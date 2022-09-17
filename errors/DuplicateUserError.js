const HTTPRequestError = require('./HttpRequestError');

class DuplicateUserError extends HTTPRequestError {
    StatusCode = 409;

    constructor(email) {
        super();
        this.message = `The email '${email}' is already in use. Please try again.`;
    }

    body() {
        return {
            errorType: `Duplicate error`,
            message: this.message,
        };
    }
}

module.exports = DuplicateUserError;