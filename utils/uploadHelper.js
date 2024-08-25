const { AWS_MEDIA_URL } = require("./texts");
const { uploadFile } = require('./awsS3');
const fs = require("fs");

const handleFileUpload = async (file, id) => {
    try {
        const originalName = file.originalname;
        const fileExtension = originalName.slice(
            ((originalName.lastIndexOf(".") - 1) >>> 0) + 2
        );
        const updatedOriginalName = file.originalname.split('.').slice(0, -1).join('.');
        const timestamp = Date.now();
        const fileKey = `${id}_${updatedOriginalName}_${file.fieldname}_${timestamp}.${fileExtension}`;
        const filePath = file.path;

        await uploadFile(filePath, process.env.AWS_BUCKET_NAME, fileKey);

        fs.unlinkSync(filePath);

        return `${AWS_MEDIA_URL}${fileKey}`;
    } catch (error) {
        console.log(error);
    }
}

module.exports = handleFileUpload;
