const jwt = require('jsonwebtoken');
const config = require('config');

const authMiddleware = (array) => (req, res, next) => {
    try {
        const authHeader = req.header('Authorization');
        const token = authHeader.split(' ')[1];
        if (!token) {
            //TO DO: handle errors
        }
        const user = jwt.verify(token, config.get('SECRET_KEY'));
        req.user = user;
        // TO DO: handle roles
        next();
    } catch (err) {
        // next(err);
    }
};

module.exports = authMiddleware;