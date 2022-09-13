const AuthError = require('./AuthError');

class RoleError extends AuthError {
    StatusCode = 401;

    constructor(authorizedRoles) {
        super();
        this.message = `User not authorized. Authorized roles: ${authorizedRoles}`;
    }

    body() {
        return {
            ErrorType: `Role error error`,
            Message: this.message,
        };
    }
}

module.exports = RoleError