/*
const uploadImage = async (imageFile, imageKey) => {
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
        throw new FileUploadError();
    }
}*/

const s3aws = require("@aws-sdk/client-s3");
const FileUploadError = require("../errors/FileUploadError");
const { uploadImage } = require("../library/imageUploader");
jest.mock("@aws-sdk/client-s3");

describe("imageUploader", () => {
    it("should throw an error", async () => {
        try {
            const imageFile = {
                buffer: Buffer.from("test", "utf-8"),
            };
            s3aws.PutObjectCommand.mockImplementation(() => {
                throw new Error();
            });
            await uploadImage(imageFile, "test");
        } catch (err) {
            expect(err).toBeInstanceOf(FileUploadError);
        }
    });
    describe("uploadImage", () => {
        it("should upload an image", async () => {
            const mockS3Client = jest.fn();
            const sendMock = jest.fn();
            s3aws.S3Client = class {
                constructor() {
                    mockS3Client();
                }
                send(command) {
                    expect(command).toEqual({
                        Bucket: undefined,
                        Key: undefined,
                        Body: "test",
                    });
                    sendMock(command);
                }
            };
            s3aws.PutObjectCommand = class {
                constructor(params) {
                    return { ...params };
                }
            };

            const mockSend = jest.fn();
            mockS3Client.mockImplementation(() => {
                return { send: mockSend };
            });
            const imageFile = {
                buffer: Buffer.from("test", "utf-8"),
            };
            const imageKey = "test";
            const image = await uploadImage(imageFile, imageKey);
            expect(image).toBe("https://" + "undefined" + ".s3.amazonaws.com/" + "test");
        });
    });
});
