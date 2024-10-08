const express = require('express');
const { responseFormatter } = require('../../utils/helper');
const { STATUS_CODE, TEXTS } = require('../../utils/texts');
const upload = require('../../config/multerConfig');
const handleFileUpload = require('../../utils/uploadHelper');
const router = express.Router();

// Register user
router.post('/upload', upload.single("file"), async (req, res, next) => {
    try {
        let file = {};
        let oldFile = req.body.oldFile;
        if (req?.file) {
            file = await handleFileUpload(req?.file, oldFile, res);
        }
        responseFormatter(res, STATUS_CODE.SUCCESS, { url: file }, TEXTS.fileUploaded);
    } catch (err) {
        next(err);
    }
});

module.exports = router;
