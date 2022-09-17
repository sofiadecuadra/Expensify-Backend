const HTTPRequestError = require('./HttpRequestError');

class DuplicateFamilyError extends HTTPRequestError {
    StatusCode = 409;

    constructor(name) {
        super();
        this.message = `A family named '${name}' already exists. Please try again.`;
    }

    body() {
        return {
            errorType: `Duplicate error`,
            message: this.message,
        };
    }
}

module.exports = DuplicateFamilyError;