const mysql = require('mysql2');
const sqlpassword = require('../util/password');

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: sqlpassword.password,
    database: 'node-complete'
});

module.exports = pool.promise();