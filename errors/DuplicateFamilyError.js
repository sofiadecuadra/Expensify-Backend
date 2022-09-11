const HTTPRequestError = require('./HttpRequestError');

class DuplicateFamilyError extends HTTPRequestError {
    StatusCode = 409;

    constructor(name) {
        super();
        this.message = `A family named '${name}' already exists. Please try again.`; 
    }
    
    body() {
        return {
            ErrorType: `Duplicate error`,
            Message: this.message,
        };
    }
}

module.exports = DuplicateFamilyError;