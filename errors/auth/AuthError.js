class AuthError extends Error {
    StatusCode = 401;

    body() {
        return {
            errorType: `AUTH_ERROR`,
            message: this.message,
        };
    }

}

module.exports = AuthError;

