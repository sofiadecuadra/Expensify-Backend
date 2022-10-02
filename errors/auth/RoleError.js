const AuthError = require('./AuthError');

class RoleError extends AuthError {
    StatusCode = 401;

    constructor(authorizedRoles) {
        super();
        this.message = `User not authorized. Authorized roles: ${authorizedRoles}`;
    }

    body() {
        return {
            errorType: `ROLE_ERROR`,
            message: this.message,
        };
    }
}

module.exports = RoleError