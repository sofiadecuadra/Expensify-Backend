class HTTPRequestError extends Error {
    StatusCode = 500;

    body() {
        return {
            errorType: `Server error`,
            message: this.message,
        };
    }

}

module.exports = HTTPRequestError;

