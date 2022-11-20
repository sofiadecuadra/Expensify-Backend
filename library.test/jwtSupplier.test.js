/* TEST
*const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();
const secretKey = process.env.SECRET_KEY;

const createKey = async (data) => {
    const token = jwt.sign(data, secretKey);
    return token;
};

const decryptKey = async (token) => {
    const data = jwt.verify(token, secretKey);
    return data;
};

module.exports = { createKey, decryptKey };*/

const { createKey, decryptKey } = require("../library/jwtSupplier");
const jwt = require("jsonwebtoken");

describe("jwtSupplier", () => {
    describe("createKey", () => {
        test("should return", () => {
            jest.spyOn(jwt, "sign").mockImplementation(() => "test");
            const dotenv = require("dotenv");
            dotenv.config();
            process.env.SECRET_KEY = "secret";
            const secretKey = process.env.SECRET_KEY ?? "test";

            const res = createKey({ id: 1, email: "test@test.com" });
            expect(jwt.sign).toHaveBeenCalledWith({ id: 1, email: "test@test.com" }, undefined);
        });
    });

    describe("decryptKey", () => {
        test("should return", () => {
            jest.spyOn(jwt, "verify").mockImplementation(() => "test");
            const dotenv = require("dotenv");
            dotenv.config();
            process.env.SECRET_KEY;
            const secretKey = process;
            const res = decryptKey("test");
            expect(jwt.verify).toHaveBeenCalledWith("test", undefined);
        });
    });
});
