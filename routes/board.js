const express = require('express');
const router = express.Router();
const connection = require('../db');


router.get('/boards/:id', (req, res) => {
    const boardId = req.params.id;

    const query = `
                    SELECT T1.board_id
                            , T1.title
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

        // console.log("Database results:", results);
        res.render('detail', { items: results });
    });

});

module.exports = router;