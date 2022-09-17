const jwt = require("jsonwebtoken");
const config = require("config");

const createKey = async (data) => {
    const token = jwt.sign(data, config.get('SECRET_KEY'));
    return token;
};

const decryptKey = async (token) => {
    const data = jwt.verify(token, config.get('SECRET_KEY'));
    return data;
};

module.exports = { createKey, decryptKey };