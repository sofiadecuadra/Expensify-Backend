class AuthError extends Error {
    StatusCode = 401;

    body() {
        return {
            ErrorType: `Auth error`,
            Message: this.message,
        };
    }

}

module.exports = AuthError;

