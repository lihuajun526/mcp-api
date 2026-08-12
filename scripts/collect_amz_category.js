const axios = require('axios');
const { randomInt } = require('crypto');
const config = require('../app/config');
const db = require('../app/db');
const redis = require('../app/redis');

const c = config.categoryCrawler;
const namespace = `${c.site}:${c.marketId}`;
const pendingKey = `amz:category:crawl:pending:${namespace}`;
const processingKey = `amz:category:crawl:processing:${namespace}`;
const dedupKey = `amz:category:crawl:dedup:${namespace}`;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function nowFmt() {
  return new Date().toISOString().slice(0, 19).replace('T', ' ');
}

async function recoverProcessing() {
  while ((await redis.llen(processingKey)) > 0) {
    const payload = await redis.rpoplpush(processingKey, pendingKey);
    if (!payload) {
      break;
    }
  }
}

async function enqueueIfAbsent(task) {
  const dedupField = task.nodeId || 'ROOT';
  const added = await redis.sadd(dedupKey, dedupField);
  if (added > 0) {
    await redis.lpush(pendingKey, JSON.stringify(task));
    return true;
  }
  return false;
}

async function popTaskForProcess(timeoutSeconds = 5) {
  return redis.brpoplpush(pendingKey, processingKey, timeoutSeconds);
}

async function ackTask(payload) {
  await redis.lrem(processingKey, 1, payload);
}

async function requeue(payload) {
  await redis.lrem(processingKey, 1, payload);
  await redis.lpush(pendingKey, payload);
}

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

async function main() {
  console.log(`[collector] start site=${c.site} marketId=${c.marketId}`);
  await recoverProcessing();

  const pending = await redis.llen(pendingKey);
  const processing = await redis.llen(processingKey);
  if (pending === 0 && processing === 0) {
    await enqueueIfAbsent({ nodeId: null, depth: 0 });
  }

  let emptyRounds = 0;
  while (true) {
    const payload = await popTaskForProcess(5);
    if (!payload) {
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
    await redis.quit().catch(() => {});
    await db.pool.end().catch(() => {});
  });
