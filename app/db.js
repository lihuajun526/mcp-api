const mysql = require('mysql2/promise');
const config = require('./config');

const pool = mysql.createPool(config.mysql);

async function query(sql, params) {
  const [rows] = await pool.query(sql, params);
  return rows;
}

async function execute(sql, params) {
  const [result] = await pool.execute(sql, params);
  return result;
}

module.exports = {
  pool,
  query,
  execute
};
