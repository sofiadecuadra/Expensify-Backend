class AuthError extends Error {
    StatusCode = 401;

    body() {
        return {
            errorType: `Auth error`,
            message: this.message,
        };
    }

}

module.exports = AuthError;

