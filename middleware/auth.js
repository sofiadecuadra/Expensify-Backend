const jwt = require('jsonwebtoken');
const config = require('config');

const authMiddleware = (array) => (req, res, next) => {
    try {
        const authHeaderToken = req.header('Authorization');
        console.log(authHeaderToken);
        const token = authHeaderToken.split(' ')[1] || authHeaderToken;
        if (!token) {
            //TO DO: handle errors
        }
        console.log(token)
        const user = jwt.verify(token, config.get('SECRET_KEY'));
        req.user = user;
        // TO DO: handle roles
        next();
    } catch (err) {
        // next(err);
    }
};

module.exports = authMiddleware;