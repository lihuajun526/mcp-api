const db = require('../../db');

/**
 * 查询指定站点的一级类目列表。
 * 返回 category_name（原生类目名）、category_name_cn（中文类目名）、category_value（类目值），
 * 供模型按语义匹配后取 category_value 作为其它工具的类目入参。
 */
async function queryCategoryFirst(user, request) {
  const marketplace = String(request.marketplace || '').trim().toUpperCase();
  const rows = await db.query(
    `SELECT category_name, category_name_cn, category_value
     FROM amz_category_first
     WHERE site = ?
     ORDER BY id ASC`,
    [marketplace]
  );

  return {
    marketplace,
    total: rows.length,
    items: rows.map((row) => ({
      category_name: row.category_name,
      category_name_cn: row.category_name_cn,
      category_value: row.category_value
    }))
  };
}

module.exports = { queryCategoryFirst };
