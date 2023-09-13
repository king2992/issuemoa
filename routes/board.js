const express = require('express');
const router = express.Router();
const connection = require('../db');

const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uuid4 = require('uuid4');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '..', 'public', 'img', 'uploads'));
    },
    filename: function (req, file, cb) {
        const safeName = encodeURIComponent(file.originalname);
        cb(null, Date.now() + '-' + safeName);
    }
});

const upload = multer({ storage: storage });

router.get('/boards/add', (req, res)=>{
    res.render('add');
});

router.get('/boards/:id', (req, res) => {

    const boardId = req.params.id;

    const query = `
                    SELECT T1.board_id
                            , T1.title
                            , DATE_FORMAT(T1.REGIST_DT, '%Y-%m-%d') AS regist_dt 
                            , CONCAT(T2.FILE_PATH, '/', T2.FILE_SAVE_NM) AS file_src
                        FROM issuemoa.board T1
                        LEFT JOIN issuemoa.attach_file T2
                        ON (T1.ATTACH_ID = T2.ATTACH_ID)
                        WHERE T1.ATTACH_ID = ${boardId}
                    `;


    connection.query(query, (queryErr, results) => {
        if (queryErr) {
            console.error("Error executing query:", queryErr);
            res.status(500).send("Internal Server Error");
            return;
        }

        console.log("Database results:", results);
        res.render('detail', { items: results });
    });

});

router.post('/upload', upload.array('files'), async (req, res) => {
    const title = req.body.title; // 사용자가 입력한 제목을 가져옵니다.
    const files = req.files; // 업로드된 파일 정보를 가져옵니다.

    // 파일을 저장할 디렉토리 경로 설정
    const uploadDir = path.join(__dirname, 'uploads');

    // 디렉토리가 없다면 생성
    if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir);
    }

    const countQuery = "SELECT MAX(attach_id) AS maxAttachId FROM issuemoa.attach_file";
    
    try {
        const [countResults] = await connection.promise().query(countQuery);

        const maxAttachId = countResults[0].maxAttachId + 1;
        console.log("maxAttachId");
        console.log(maxAttachId);

        // 파일 처리 로직
        files.forEach((file, index) => {
            const fileName = Date.now() + '-' + file.originalname;
            const randomID = uuid4();
            const filePath = path.join(uploadDir, randomID);

            // 파일을 서버에 저장
            fs.writeFileSync(filePath, file.buffer);

            // 파일 정보를 데이터베이스에 저장하거나 필요한 로직을 수행

            console.log(`File ${index + 1}: ${fileName}`);
        });

        // 여기에서 데이터베이스에 저장하는 로직을 추가하세요.

        console.log('Title:', title);

        res.send('Files and title uploaded successfully.');
    } catch (error) {
        console.error("Error executing count query:", error);
        res.status(500).send("Internal Server Error");
    }
});



module.exports = router;