const mysql = require('mysql2/promise');
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'alarasi@12=...',         // change if you have password
  database: 'luct_system',
});
module.exports = pool;
