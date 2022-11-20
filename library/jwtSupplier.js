const jwt = require("jsonwebtoken");
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

module.exports = { createKey, decryptKey };
