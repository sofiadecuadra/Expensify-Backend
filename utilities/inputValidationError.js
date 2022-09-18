class InputValidationError extends Error {
    StatusCode = 400;

    body() {
        return {
            errorType: `Input validation error`,
            message: this.message,
        };
    }

}

module.exports = InputValidationError;

