// 一级类目导入脚本：解析 docs/一级类目/{site} 的 HTML 片段，写入本地 MySQL 一级类目表
const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');
const db = require('../app/db');

// 站点（目录名），可通过命令行参数覆盖，默认 US
const site = process.argv[2] || 'US';
// 一级类目标文件名与 HTML 文件路径
const tableName = 'amz_category_first';
const htmlPath = path.join(process.cwd(), 'docs', '一级类目', site);

// 解析 HTML，提取每条一级类目的原生类目名、中文名、类目值
function parseCategories(html) {
  const $ = cheerio.load(html);
  const list = [];
  $('label.el-checkbox').each((_, label) => {
    const $label = $(label);
    const value = $label.find('input.el-checkbox__original').attr('value');
    const $divs = $label.find('span.el-checkbox__label > div');
    const categoryName = $divs.eq(0).text().trim();
    const categoryNameCn = $divs.eq(1).text().trim();
    if (!value || !categoryName) {
      return;
    }
    list.push({ value, categoryName, categoryNameCn });
  });
  return list;
}

// 创建一级类目表
async function ensureTable() {
  await db.query(
    `CREATE TABLE IF NOT EXISTS ${tableName} (
      id BIGINT PRIMARY KEY AUTO_INCREMENT,
      category_name VARCHAR(255) NOT NULL COMMENT '原生类目名',
      category_name_cn VARCHAR(255) NULL COMMENT '中文类目名',
      category_value VARCHAR(128) NOT NULL COMMENT '类目值',
      site VARCHAR(32) NOT NULL COMMENT '站点',
      created_at DATETIME NOT NULL COMMENT '创建时间',
      updated_at DATETIME NOT NULL COMMENT '更新时间',
      UNIQUE KEY uk_site_value (site, category_value)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='一级类目表'`
  );
}

// 以 (site, category_value) 去重写入，已存在则更新名称与更新时间
async function upsertCategory(item) {
  await db.execute(
    `INSERT INTO ${tableName}
      (category_name, category_name_cn, category_value, site, created_at, updated_at)
     VALUES (?, ?, ?, ?, NOW(), NOW())
     ON DUPLICATE KEY UPDATE
      category_name = VALUES(category_name),
      category_name_cn = VALUES(category_name_cn),
      updated_at = NOW()`,
    [item.categoryName, item.categoryNameCn || null, item.value, site]
  );
}

async function main() {
  const html = fs.readFileSync(htmlPath, 'utf8');
  const categories = parseCategories(html);
  console.log(`[l1-category] site=${site} parsed=${categories.length}`);

  await ensureTable();
  for (const item of categories) {
    await upsertCategory(item);
  }

  const [row] = await db.query(`SELECT COUNT(*) AS cnt FROM ${tableName} WHERE site = ?`, [site]);
  console.log(`[l1-category] done site=${site} total=${row.cnt}`);
}

main()
  .catch((err) => {
    console.error('[l1-category] fatal:', err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await db.pool.end().catch(() => { });
  });
