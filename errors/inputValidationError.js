class InputValidationError extends Error {
    StatusCode = 400;

    body() {
        return {
            errorType: `INPUT_VALIDATION_ERROR`,
            message: this.message,
        };
    }

}

module.exports = InputValidationError;

