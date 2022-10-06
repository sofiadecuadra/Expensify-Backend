const FileUploadError = require("../errors/FileUploadError");

const dotenv = require("dotenv");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
dotenv.config();

const bucketName = process.env.AWS_BUCKET_NAME;
const region = process.env.AWS_BUCKET_REGION;
const accessKeyId = process.env.AWS_ACCESS_KEY;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
const sessionToken = process.env.AWS_SESSION_TOKEN;
const insideVPC = process.env.INSIDE_VPC;

const credentials = insideVPC ? undefined : {
    accessKeyId: accessKeyId,
    secretAccessKey: secretAccessKey,
    sessionToken: sessionToken,
};

const s3 = new S3Client({
    region: region,
    credentials
});

const uploadImage = async (imageFile, imageKey, categoryName) => {
    try {
        const params = {
            Bucket: bucketName,
            Key: imageKey,
            Body: imageFile.buffer,
        };
        const command = new PutObjectCommand(params);
        await s3.send(command);
        const image = "https://" + bucketName + ".s3.amazonaws.com/" + params.Key;
        console.info("[S3] Uploaded: " + image);
        return image;
    } catch (err) {
        throw new FileUploadError(categoryName);
    }
}

module.exports = { uploadImage }