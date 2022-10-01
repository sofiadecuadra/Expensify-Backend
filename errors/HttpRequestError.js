class HTTPRequestError extends Error {
    StatusCode = 500;

    body() {
        return {
            errorType: `HTTP_REQUEST_ERROR`,
            message: this.message,
        };
    }

}

module.exports = HTTPRequestError;

