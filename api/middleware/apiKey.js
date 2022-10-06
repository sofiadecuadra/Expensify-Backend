const InvalidApiKeyError = require("../../errors/auth/InvalidApiKeyError");

const { decryptKey } = require("../../library/jwtSupplier");

const apiKeyMiddleware = () => async (req, res, next) => {
    const authHeaderToken = req.header("Authorization");

    const token = !authHeaderToken ? null : authHeaderToken.split(" ")[1] || authHeaderToken;
    try {
        const item = await decryptKey(token);
        if (!item.data.name) {
            throw new InvalidApiKeyError();
        }
        req.familyName = item.data.name;
        req.apiKey = token;
        next();
    } catch (err) {
        return next(new InvalidApiKeyError());
    }
};

module.exports = apiKeyMiddleware;
