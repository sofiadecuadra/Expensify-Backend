class InputValidationError extends Error {
    StatusCode = 400;

    body() {
        return {
            ErrorType: `Input validation error`,
            Message: this.message,
        };
    }

}

module.exports = InputValidationError;

