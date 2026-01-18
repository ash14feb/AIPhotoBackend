const mysql = require('mysql2/promise');

const dbConfig = {
  host: process.env.MYSQL_HOST,
  port: process.env.MYSQL_PORT || 3306,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE || 'PhotoAIDB',
  ssl: process.env.MYSQL_SSL === 'true' ? {
    rejectUnauthorized: true
  } : undefined,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

let pool;

async function getPool() {
  if (!pool) {
    pool = mysql.createPool(dbConfig);
  }
  return pool;
}

async function query(sql, params) {
  const connectionPool = await getPool();
  try {
    const [results] = await connectionPool.execute(sql, params);
    return results;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

module.exports = {
  getPool,
  query
};