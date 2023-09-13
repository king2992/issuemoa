// logMiddleware.js
const requestIp = require('request-ip'); // 필요한 경우 외부 라이브러리나 모듈 불러오기
const connection = require('./db');

function saveLogMiddleware(req, res, next) {
    const userIp = requestIp.getClientIp(req);
    const fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl;

    console.log("Request IP Address:", userIp);
    console.log("Request URL:", fullUrl);

    const logQuery = "INSERT INTO connect_log (connect_ip, url, regist_dt) VALUES(?, ?, NOW())";
    connection.query(logQuery, [userIp, fullUrl], (logErr) => {
        if (logErr) {
            console.error("Error saving log:", logErr);
            res.status(500).send("Internal Server Error");
            return;
        }

        next(); // 로그 저장 후 다음 미들웨어나 라우터로 이동
    });
}

module.exports = saveLogMiddleware; // 미들웨어 함수 내보내기
