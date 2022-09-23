class HealthCheckError extends Error {
    StatusCode = 500;

    body() {
        return {
            errorType: `Health check error`,
            message: this.message,
        };
    }

}

module.exports = HealthCheckError;

