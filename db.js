// db.js

const mysql = require('mysql2');

// MySQL 연결 설정
const connection = mysql.createConnection({
  host: "139.150.69.126",
  user: "root",
  password: "Koreait1234!",
  database: "issuemoa",
  port: 3306,
  connectTimeout: 10000,
  // ssl: {
  //   rejectUnauthorized: false,
  //   require: true,
  // },
});

connection.connect((err) => {
  if (err) {
    console.error("Error connecting to MySQL:", err);
  } else {
    console.log("Connected to MySQL database.");
  }
});

module.exports = connection;
