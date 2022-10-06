const HTTPRequestError = require('./HttpRequestError');

class DuplicateFamilyError extends HTTPRequestError {
    StatusCode = 409;

    constructor(name) {
        super();
        this.message = `A family named '${name}' already exists. Please try again.`;
    }

    body() {
        return {
            errorType: `DUPLICATE_FAMILY_ERROR`,
            message: this.message,
        };
    }
}

module.exports = DuplicateFamilyError;