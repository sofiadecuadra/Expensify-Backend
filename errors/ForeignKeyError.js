const HTTPRequestError = require("./HttpRequestError");

class ForeignKeyError extends HTTPRequestError {
    StatusCode = 404;

    constructor(id, object) {
        super();
        this.message = `The ${object} with id '${id}' was not found. Please try again.`;
    }

    body() {
        return {
            errorType: `FOREIGN_KEY_ERROR`,
            message: this.message,
        };
    }
}

module.exports = ForeignKeyError;
