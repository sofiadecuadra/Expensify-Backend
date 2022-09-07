const jwt = require("jsonwebtoken");
const config = require("config");

const createKey = async(data) => {
    const token = jwt.sign(data, config.get('SECRET_KEY'));
    return token;
};

module.exports = createKey;