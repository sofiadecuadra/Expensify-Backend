const FileUploadError = require("../errors/FileUploadError");

const dotenv = require("dotenv");
const s3aws = require("@aws-sdk/client-s3");
dotenv.config();

const bucketName = process.env.AWS_BUCKET_NAME;
const region = process.env.AWS_BUCKET_REGION;
const accessKeyId = process.env.AWS_ACCESS_KEY;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
const sessionToken = process.env.AWS_SESSION_TOKEN;

const credentials = {
    accessKeyId: accessKeyId,
    secretAccessKey: secretAccessKey,
    sessionToken: sessionToken,
};

const s3 = new s3aws.S3Client({
    region: region,
    credentials,
});

const uploadImage = async (imageFile, imageKey) => {
    try {
        const params = {
            Bucket: bucketName,
            Key: imageKey,
            Body: imageFile.buffer,
        };
        const command = new s3aws.PutObjectCommand(params);
        await s3.send(command);
        const image = "https://" + bucketName + ".s3.amazonaws.com/" + params.Key;
        console.info("[S3] Uploaded: " + image);
        return image;
    } catch (err) {
        throw new FileUploadError();
    }
};

module.exports = { uploadImage };
