const jwt = require("jsonwebtoken");
const config = require("config");

const createToken = async (userId, role, email, familyId) => {
    const token = jwt.sign({ userId, role, email, familyId }, config.get('SECRET_KEY'));
    return token;
};

module.exports = createToken;