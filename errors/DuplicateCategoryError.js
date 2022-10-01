const HTTPRequestError = require('./HttpRequestError');

class DuplicateCategoryError extends HTTPRequestError {
    StatusCode = 409;

    constructor(name) {
        super();
        this.message = `A category named '${name}' already exists. Please try again.`;
    }

    body() {
        return {
            errorType: `DUPLICATE_CATEGORY_ERROR`,
            message: this.message,
        };
    }
}

module.exports = DuplicateCategoryError;