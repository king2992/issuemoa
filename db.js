// db.js

const mysql = require('mysql2');

// MySQL 연결 설정
  const connection = mysql.createConnection({
  //host: "139.150.69.126",    //localhost
  host : "10.24.75.2",       //prod
  user: "issue",
  password: "Wlsdn801@",
  database: "issuemoa",
  port: 3306,
  connectTimeout: 10000,
  ssl: {
    rejectUnauthorized: false,
    require: true,
  },
});

connection.connect((err) => {
  if (err) {
    console.error("Error connecting to MySQL:");
    console.error("Error Code:", err.code);
    console.error("Error Number:", err.errno);
    console.error("SQL Message:", err.sqlMessage);
    console.error("SQL State:", err.sqlState);
    console.error("Is Fatal:", err.fatal);
  } else {
    console.log("Connected to MySQL database.");
  }
});

module.exports = connection;
