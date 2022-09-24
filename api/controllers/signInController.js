const bcrypt = require("bcryptjs");
const SignInLogic = require("../../businessLogic/signInLogic");

class SignInController {
    static async signIn(req, res, next) {
        try {
            const { email, password } = req.body;
            const token = await SignInLogic.signIn(email, password);
            res.status(200).send({ token: token });
        } catch (err) {
            next(err);
        }
    }
}

module.exports = SignInController;
