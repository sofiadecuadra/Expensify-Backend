const jwt = require('jsonwebtoken');
const config = require('config');
const RoleError = require('../errors/auth/RoleError');

const authMiddleware = (roleArray) => (req, res, next) => {
    const authHeaderToken = req.header('Authorization');
    console.log(authHeaderToken);
    const token = authHeaderToken.split(' ')[1] || authHeaderToken;
    if (!token) {
        //TO DO: handle errors
    }
    console.log(token)
    const user = jwt.verify(token, config.get('SECRET_KEY'));
    req.user = user;
    const role = roleArray.find((role) => role.id === user.role);
    if (!role) {
        const availableRoles = roleArray.map((role) => role.name);
        throw new RoleError(availableRoles.join(", "));
        // res.status(401).send("User not authorized. Authorized roles: " + roleArray.join(", "));
    }
    next();
};

module.exports = authMiddleware;