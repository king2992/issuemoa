const express = require('express');
const router = express.Router();
const connection = require('../db');

const path = require('path');
const fs = require('fs');
const formidable = require('formidable');  // 추가된 부분
const uuid4 = require('uuid4');



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
                        WHERE T1.board_id = ${boardId}
                    `;
    console.log(query)

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

router.post('/upload', async (req, res) => {

    const [countResults] = await connection.promise().query("SELECT MAX(attach_id) AS maxAttachId FROM issuemoa.attach_file");
    const maxAttachId = countResults[0].maxAttachId + 1;

    let form = new formidable.IncomingForm();
    form.allowEmptyFiles = true;
    form.parse(req, async (err, fields, files) => {
        if (err) {
            console.error("Error:", err);
            res.status(500).send("Internal Server Error");
            return;
        }

        const title = fields.title;
        let uploadedFiles = Object.values(files);


        //const uploadedFile = files.files[0];

        for(let i = 0; i < uploadedFiles.length; i++){

            let uploadedFile = uploadedFiles[i];

            if (!uploadedFile) {
                res.status(400).send("No file provided");
                return;
            }
    
            const uploadDir = path.join(__dirname, '..', 'public', 'img', 'uploads');
    
            if (!fs.existsSync(uploadDir)) {
                fs.mkdirSync(uploadDir);
            }
    
            const targetFilePath = path.join(uploadDir, uploadedFile[0].originalFilename);
    
            // 임시 파일을 지정한 위치로 이동합니다.
            fs.renameSync(uploadedFile[0].filepath, targetFilePath);
    
            const insertFileQuery = `
                                        INSERT INTO issuemoa.attach_file 
                                        (attach_id, attach_seq, file_nm, file_save_nm, file_path) 
                                        VALUES (?, ?, ?, ?, ?)
                                    `;
            const fileValues = [maxAttachId, (i+1), uploadedFile[0].originalFilename, uploadedFile[0].originalFilename, '/img/uploads'];
            await connection.promise().query(insertFileQuery, fileValues);
        }

        const insertBoardQuery = `INSERT INTO issuemoa.board(title, attach_id, regist_dt) VALUES(?, ?, now())`;
        const boardValues = [title, maxAttachId];
        await connection.promise().query(insertBoardQuery, boardValues);
        res.send('File uploaded successfully');
    });
});







module.exports = router;