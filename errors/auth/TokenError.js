const AuthError = require('./AuthError');

class TokenError extends AuthError {
    StatusCode = 401;

    constructor(authorizedRoles) {
        super();
        this.message = 'Invalid token format or token expired';
    }

    body() {
        return {
            errorType: `Token error`,
            message: this.message,
        };
    }
}

module.exports = TokenError