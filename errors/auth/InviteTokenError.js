const AuthError = require("./AuthError");

class InviteTokenError extends AuthError {
    StatusCode = 401;

    constructor() {
        super();
        this.message = "Invalid invite token";
    }

    body() {
        return {
            errorType: `Token error`,
            message: this.message,
        };
    }
}

module.exports = InviteTokenError;
