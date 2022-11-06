const mysql = require('mysql');

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'facebook',
    charset: 'utf8mb4',
});

db.connect((err) => {
    if (err) console.log('Connection to database failed');
});

module.exports = db;
