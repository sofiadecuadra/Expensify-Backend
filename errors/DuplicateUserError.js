const HTTPRequestError = require('./HttpRequestError');

class DuplicateUserError extends HTTPRequestError {
    StatusCode = 409;

    constructor(email) {
        super();
        this.message = `The email '${email}' is already in use. Please try again.`; 
    }
    
    body() {
        return {
            ErrorType: `Duplicate error`,
            Message: this.message,
        };
    }
}

module.exports = DuplicateUserError;