const HttpRequestError = require("../../errors/HttpRequestError");
const AuthError = require("../../errors/auth/AuthError");
const InputValidationError = require("../../errors/inputValidationError");
const HealthCheckError = require("../../errors/HealthCheckError");

const errorMiddleware = (err, req, res, next) => {
   
    if (
        err instanceof HttpRequestError ||
        err instanceof AuthError ||
        err instanceof InputValidationError ||
        err instanceof HealthCheckError
    ) {
        const errBody = err.body();
        console.error("[" + errBody.errorType + "]", errBody.message);
        return res.status(err.StatusCode).send(err.body());
    }
    else {
        console.error("[SERVER_ERROR] [" + err.name + "]", err.message);
        return res.status(500).send({
            error_type: err.name,
            msg: err.message,
        });
    }
};

module.exports = errorMiddleware;
