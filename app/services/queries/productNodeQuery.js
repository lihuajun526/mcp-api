const db = require('../../db');

async function queryProductNode(user, request) {
  const site = request.marketplace;
  const nodeIdPath = request.nodeIdPath ? String(request.nodeIdPath).trim() : '';
  const keyword = request.keyword ? String(request.keyword).trim() : '';

  let sql;
  let params;

  if (nodeIdPath) {
    // 查指定节点的直接子类目
    sql = `
      SELECT node_id, label, node_label_locale, node_label_path_locale
      FROM amz_category
      WHERE site = ? AND parent_node_id = ?
      ORDER BY products DESC
    `;
    params = [site, nodeIdPath];
  } else if (keyword) {
    // 按 nodeId 或类目名称搜索
    const like = `%${keyword}%`;
    sql = `
      SELECT node_id, label, node_label_locale, node_label_path_locale
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
      SELECT node_id, label, node_label_locale, node_label_path_locale
      FROM amz_category
      WHERE site = ? AND (parent_node_id IS NULL OR parent_node_id = '')
      ORDER BY products DESC
    `;
    params = [site];
  }

  const rows = await db.query(sql, params);

  return rows.map((row) => ({
    nodeIdPath: row.node_id,
    nodeLabelPath: row.label,
    nodeLabelLocale: row.node_label_locale,
    nodeLabelPathLocale: row.node_label_path_locale
  }));
}

module.exports = { queryProductNode };
