class HealthCheckError extends Error {
    StatusCode = 500;

    body() {
        return {
            errorType: `HEALTH_CHECK_ERROR`,
            message: this.message,
        };
    }
}

module.exports = HealthCheckError;

