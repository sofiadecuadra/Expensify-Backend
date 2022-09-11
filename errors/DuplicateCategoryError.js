const HTTPRequestError = require('./HttpRequestError');

class DuplicateCategoryError extends HTTPRequestError {
    StatusCode = 409;

    constructor(name) {
        super();
        this.message = `A category named '${name}' already exists. Please try again.`; 
    }
    
    body() {
        return {
            ErrorType: `Duplicate error`,
            Message: this.message,
        };
    }
}

module.exports = DuplicateCategoryError;