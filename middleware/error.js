const HttpRequestError = require("../errors/HttpRequestError");
const AuthError = require("../errors/auth/AuthError");
const InputValidationError = require("../utilities/InputValidationError");

const errorMiddleware = (err, req, res, next) => {

    console.log(err.message)
    if (err instanceof HttpRequestError || err instanceof AuthError || err instanceof InputValidationError) {
        return res.status(err.StatusCode).send(err.body());
    }
    return res.status(500).send({
        error_type: err.type,
        msg: err.msg,
    });
};

module.exports = errorMiddleware;