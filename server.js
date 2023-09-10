const express = require('express');
const app = express();


// 라우터 모듈 불러오기
const board = require('./routes/board');

//bodyparser
const bodyParser = require("body-parser");

//db connection
const connection = require('./db');


// 라우터 모듈 사용
app.use('/', board);


app.use(bodyParser.urlencoded({ extended: true }));

// 정적 파일 서비스 설정
app.use(express.static('public'));

//npm install ejs
app.set('view engine', 'ejs'); // EJS 설정


// 서버 종료 시 MySQL 연결 종료
process.on("SIGINT", () => {
    connection.end((endErr) => {
        if (endErr) {
            console.error("Error ending connection:", endErr);
        } else {
            console.log("Connection to MySQL database closed.");
        }
        process.exit(); // 서버 종료
    });
});

app.listen(3000, () => {
    console.log(`Server is running on port 3000`);
});

app.get('/', (req, res) => {
    // const data = readData();
    // res.render('index', { items: data });

    // 데이터베이스 조회 쿼리
    const query = `
                    SELECT
                        T1.board_id,
                        T1.title,
                        CONCAT(T2.file_path, '/', T2.file_save_nm) as file_src
                    FROM
                        issuemoa.board T1
                    LEFT JOIN
                        issuemoa.attach_file T2
                    ON
                        (T1.attach_id = T2.attach_id AND T2.attach_seq = 1)
                  `;



    connection.query(query, (queryErr, results) => {
        if (queryErr) {
            console.error("Error executing query:", queryErr);
            res.status(500).send("Internal Server Error");
            return;
        }

        // console.log("Database results:", results);
        res.render('index', { items: results });
    });
});