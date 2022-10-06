const AuthError = require("./AuthError");

class InviteTokenError extends AuthError {
    StatusCode = 401;

    constructor() {
        super();
        this.message = "Invalid invite token";
    }

    body() {
        return {
            errorType: `INVITE_TOKEN_ERROR`,
            message: this.message,
        };
    }
}

module.exports = InviteTokenError;
