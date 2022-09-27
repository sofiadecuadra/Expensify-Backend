const AuthError = require("./AuthError");

class InvalidApiKeyError extends AuthError {
    StatusCode = 401;

    constructor() {
        super();
        this.message = "Invalid api key";
    }

    body() {
        return {
            errorType: `Api key error`,
            message: this.message,
        };
    }
}

module.exports = InvalidApiKeyError;
