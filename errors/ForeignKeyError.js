const HTTPRequestError = require('./HttpRequestError');

class ForeignKeyError extends HTTPRequestError {
    StatusCode = 404;

    constructor(id) {
        super();
        this.message = `The category with id '${id}' was not found. Please try again.`;
    }
    
    body() {
        return {
            ErrorType: `Not found error`,
            Message: this.message,
        };
    }
}

module.exports = ForeignKeyError;