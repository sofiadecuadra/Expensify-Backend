const RoleError = require('../errors/auth/RoleError');
const AuthError = require('../errors/auth/AuthError');
const { decryptKey } = require('../library/jwtSupplier');

const authMiddleware = (roleArray) => async (req, res, next) => {
    const authHeaderToken = req.header('Authorization');
    if (!authHeaderToken){
        throw new AuthError('No token provided');
    }
    console.log(authHeaderToken);
    const token = authHeaderToken.split(' ')[1] || authHeaderToken;
    if (!token) {
        //TO DO: handle errors
    }
    const user = await decryptKey(token);
    req.user = user;
    const role = roleArray.find((role) => role.id === user.role);
    if (!role) {
     const availableRoles = roleArray.map((role) => role.name);
        throw new RoleError(availableRoles.join(", "));
    }
    next();
};

module.exports = authMiddleware;