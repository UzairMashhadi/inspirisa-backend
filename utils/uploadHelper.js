const fs = require("fs");
const { AWS_MEDIA_URL } = require("./texts");
const { uploadFile, deleteFile } = require('./awsS3');
const AWS = require('aws-sdk');

// Initialize S3
const awsS3 = new AWS.S3();

const handleFileUpload = async (file, oldFile, res) => {
    try {
        // Replace spaces in the originalName with underscores
        const originalName = file?.originalname.replace(/\s+/g, '_');
        const fileExtension = originalName?.slice(((originalName.lastIndexOf(".") - 1) >>> 0) + 2);
        const updatedOriginalName = originalName.split('.').slice(0, -1).join('.');
        const timestamp = Date.now();
        const fileKey = `${updatedOriginalName}_${file.fieldname}_${timestamp}.${fileExtension}`;
        const filePath = file?.path;

        if (oldFile) {
            await deleteFile(oldFile, process.env.AWS_BUCKET_NAME, res);
        }

        // Call the uploadFile function
        await uploadFile(filePath, process.env.AWS_BUCKET_NAME, fileKey);

        // Delete the local file after upload
        fs.unlinkSync(filePath);

        return `${AWS_MEDIA_URL}${fileKey}`;
    } catch (error) {
        console.error("Error during file upload:", error);
        throw error; // Re-throw error for further handling if needed
    }
};

module.exports = handleFileUpload;
