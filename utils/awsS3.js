const fs = require("fs");
const awsS3 = require("../config/awsS3Config");
const { STATUS_CODE, TEXTS } = require("./texts");
// Upload file
module.exports.uploadFile = async (filePath, bucketName, fileName, res, retries = 3) => {
  try {
    const fileStream = fs.createReadStream(filePath);
    const params = {
      Bucket: bucketName,
      Key: fileName,
      Body: fileStream,
    };
    const data = await awsS3.upload(params).promise();
    console.log(`File uploaded successfully. ${data.Location}`);
  } catch (err) {
    console.error("Error during S3 upload:", err);
    if (retries > 0) {
      console.log(`Retrying upload... (${3 - retries + 1})`);
      return await uploadFile(filePath, bucketName, fileName, res, retries - 1);
    }
    if (res) {
      return res.status(STATUS_CODE.CONFLICT).json({
        status: STATUS_CODE.CONFLICT,
        message: TEXTS.fileUploadingFail,
      });
    }
  }
};

// Download file
module.exports.downloadFile = async (fileName, bucketName, res) => {
  try {
    const params = {
      Bucket: bucketName,
      Key: fileName,
    };

    const data = await awsS3.getObject(params).promise();
    fs.writeFileSync(fileName, data.Body.toString());
    console.log(`File downloaded successfully. ${fileName}`);
  } catch (err) {
    fs.writeFileSync("texts.FILE_DOWNLOAD_FAIL.txt", err.toString());
    return res.status(STATUS_CODE.CONFLICT).json({
      status: STATUS_CODE.CONFLICT,
      message: TEXTS.fileDownloading,
    });
  }
};

// Delete file
module.exports.deleteFile = async (fileName, bucketName, res) => {
  try {
    const params = {
      Bucket: bucketName,
      Key: fileName,
    };

    const data = await awsS3.deleteObject(params).promise();
    console.log(`File deleted successfully: ${fileName}`, data);
  } catch (err) {
    fs.writeFileSync("texts.FILE_DELETE_FAIL.txt", err.toString());
    return res.status(STATUS_CODE.CONFLICT).json({
      status: STATUS_CODE.CONFLICT,
      message: TEXTS.fileDeletionFail,
    });
  }
};
