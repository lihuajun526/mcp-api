const db = require('../../db');
const billingService = require('../billingService');

const ENDPOINT_CODE = 'product_node';
const PROVIDER = 'LOCAL_DB';
const SELECT_COLUMNS = 'node_id, label, products, node_label_locale, node_label_path_locale';

async function queryProductNode(user, request) {
  const site = request.marketplace;
  const nodeIdPath = request.nodeIdPath ? String(request.nodeIdPath).trim() : '';
  const keyword = request.keyword ? String(request.keyword).trim() : '';

  let sql;
  let params;

  if (nodeIdPath) {
    // 查指定节点的直接子类目
    sql = `
      SELECT ${SELECT_COLUMNS}
      FROM amz_category
      WHERE site = ? AND parent_node_id = ?
      ORDER BY products DESC
    `;
    params = [site, nodeIdPath];
  } else if (keyword) {
    // 按 nodeId 或类目名称搜索
    const like = `%${keyword}%`;
    sql = `
      SELECT ${SELECT_COLUMNS}
      FROM amz_category
      WHERE site = ?
        AND (node_id LIKE ? OR label LIKE ? OR node_label_locale LIKE ?)
      ORDER BY depth ASC, products DESC
      LIMIT 100
    `;
    params = [site, like, like, like];
  } else {
    // 返回顶层根类目
    sql = `
      SELECT ${SELECT_COLUMNS}
      FROM amz_category
      WHERE site = ? AND (parent_node_id IS NULL OR parent_node_id = '')
      ORDER BY products DESC
    `;
    params = [site];
  }

  const rows = await db.query(sql, params);

  const pricing = await billingService.getPricing(ENDPOINT_CODE);
  await billingService.deductAndRecord(user, pricing, PROVIDER);

  return rows.map((row) => ({
    nodeIdPath: row.node_id,
    nodeLabelPath: row.label,
    products: row.products != null ? Number(row.products) : null,
    nodeLabelLocale: row.node_label_locale,
    nodeLabelPathLocale: row.node_label_path_locale
  }));
}

module.exports = { queryProductNode };
