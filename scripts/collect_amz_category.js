// 引入 axios，用于发起 HTTP 请求
const axios = require('axios');
// 引入 crypto 的 randomInt，用于生成随机延时，避免请求过于密集
const { randomInt } = require('crypto');
// 应用配置
const config = require('../app/config');
// 数据库连接
const db = require('../app/db');
// Redis 连接
const redis = require('../app/redis');

// 分类爬虫相关配置
const c = config.categoryCrawler;
// 以 site:marketId 作为命名空间，区分不同站点 / 市场的爬取任务
const namespace = `${c.site}:${c.marketId}`;
// 待处理任务队列 key
const pendingKey = `amz:category:crawl:pending:${namespace}`;
// 处理中任务队列 key
const processingKey = `amz:category:crawl:processing:${namespace}`;
// 去重集合 key（记录已入队的节点，避免重复爬取）
const dedupKey = `amz:category:crawl:dedup:${namespace}`;

// 延时指定毫秒数
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// 返回当前时间的格式化字符串（YYYY-MM-DD HH:mm:ss）
function nowFmt() {
  return new Date().toISOString().slice(0, 19).replace('T', ' ');
}

// 恢复：把上次异常残留的「处理中」任务重新放回「待处理」队列
async function recoverProcessing() {
  while ((await redis.llen(processingKey)) > 0) {
    const payload = await redis.rpoplpush(processingKey, pendingKey);
    if (!payload) {
      break;
    }
  }
}

// 如果节点尚未入队过，则加入待处理队列（借助 Redis 集合去重）
async function enqueueIfAbsent(task) {
  const dedupField = task.nodeId || 'ROOT';
  const added = await redis.sadd(dedupKey, dedupField);
  if (added > 0) {
    await redis.lpush(pendingKey, JSON.stringify(task));
    return true;
  }
  return false;
}

// 从待处理队列阻塞式取出一个任务，并转移到处理中队列
async function popTaskForProcess(timeoutSeconds = 5) {
  return redis.brpoplpush(pendingKey, processingKey, timeoutSeconds);
}

// 确认任务完成：从处理中队列移除
async function ackTask(payload) {
  await redis.lrem(processingKey, 1, payload);
}

// 任务失败后重新入队
async function requeue(payload) {
  await redis.lrem(processingKey, 1, payload);
  await redis.lpush(pendingKey, payload);
}

// 拉取某个节点的子分类数据；nodeId 为空表示拉取根节点
async function fetchChildren(nodeId) {
  const params = { marketId: c.marketId, table: c.tableName };
  if (nodeId) {
    params[c.childNodeParam] = nodeId;
  }
  const headers = {
    accept: c.accept,
    'accept-language': c.acceptLanguage,
    referer: c.referer,
    'user-agent': c.userAgent
  };
  if (c.cookie) {
    headers.cookie = c.cookie;
  }
  const resp = await axios.get(`${config.sellerSprite.baseUrl}${c.path}`, {
    params,
    headers,
    timeout: Number(process.env.SELLERSPRITE_TIMEOUT_MS || 12000)
  });
  return resp.data || {};
}

// 插入或更新分类记录；以 node_id 为主键去重
async function upsertCategory(item, task) {
  const ts = nowFmt();
  await db.execute(
    `INSERT INTO amz_category
      (site, market_id, node_id, parent_node_id, label, node_label_locale, node_label_path_locale, products, children_count, depth, leaf, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE
      parent_node_id=VALUES(parent_node_id),
      label=VALUES(label),
      node_label_locale=VALUES(node_label_locale),
      node_label_path_locale=VALUES(node_label_path_locale),
      products=VALUES(products),
      children_count=VALUES(children_count),
      depth=VALUES(depth),
      leaf=VALUES(leaf),
      updated_at=VALUES(updated_at)`,
    [
      c.site,
      c.marketId,
      item.id,
      task.nodeId || null,
      item.label || null,
      item.nodeLabelLocale || null,
      item.nodeLabelPathLocale || null,
      item.products || null,
      Number(item.children || 0),
      Number(task.depth || 0),
      Number(item.children || 0) > 0 ? 0 : 1,
      ts,
      ts
    ]
  );
}

// 处理单个任务：拉取子分类、写入数据库，并把有子节点的分类继续入队
async function processOneTask(payload) {
  const task = JSON.parse(payload);
  const response = await fetchChildren(task.nodeId || null);
  const items = Array.isArray(response.items) ? response.items : [];

  for (const item of items) {
    await upsertCategory(item, task);
    if (Number(item.children || 0) > 0) {
      await enqueueIfAbsent({ nodeId: item.id, depth: Number(task.depth || 0) + 1 });
    }
  }
}

// 主流程
async function main() {
  console.log(`[collector] start site=${c.site} marketId=${c.marketId}`);
  await recoverProcessing();

  const pending = await redis.llen(pendingKey);
  const processing = await redis.llen(processingKey);
  // 队列为空时，从根节点开始爬取
  if (pending === 0 && processing === 0) {
    await enqueueIfAbsent({ nodeId: null, depth: 0 });
  }

  let emptyRounds = 0;
  while (true) {
    const payload = await popTaskForProcess(5);
    if (!payload) {
      // 连续多次取不到任务且没有处理中的任务，则认为爬取完成
      emptyRounds += 1;
      const stillProcessing = await redis.llen(processingKey);
      if (emptyRounds >= 3 && stillProcessing === 0) {
        break;
      }
      continue;
    }
    emptyRounds = 0;

    try {
      await processOneTask(payload);
      await ackTask(payload);
      await sleep(randomInt(4000, 8001));
    } catch (err) {
      console.error('[collector] task failed, requeue:', err.message);
      await requeue(payload);
      await sleep(3000);
    }
  }

  // 统计本次爬取的分类节点总数
  const [countRow] = await db.query('SELECT COUNT(*) AS cnt FROM amz_category WHERE site = ? AND market_id = ?', [
    c.site,
    c.marketId
  ]);
  console.log(`[collector] done site=${c.site} marketId=${c.marketId} totalNode=${countRow.cnt}`);
}

main()
  .catch((err) => {
    console.error('[collector] fatal:', err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await redis.quit().catch(() => { });
    await db.pool.end().catch(() => { });
  });
