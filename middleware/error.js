const HttpRequestError = require("../errors/HttpRequestError");
const AuthError = require("../errors/auth/AuthError");

const errorMiddleware = (err, req, res, next) => {

    if (err instanceof HttpRequestError || err instanceof AuthError) {
        return res.status(err.StatusCode).send(err.body());
    }
    return res.status(500).send({
        error_type: err.type,
        msg: err.msg,
    });
};

module.exports = errorMiddleware;