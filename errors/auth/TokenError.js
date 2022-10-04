const AuthError = require('./AuthError');

class TokenError extends AuthError {
    StatusCode = 401;

    constructor() {
        super();
        this.message = 'Invalid token format or token expired';
    }

    body() {
        return {
            errorType: `TOKEN_ERROR`,
            message: this.message,
        };
    }
}

module.exports = TokenError