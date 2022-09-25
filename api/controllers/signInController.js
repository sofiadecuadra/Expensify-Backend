class SignInController {
    signInLogic;

    constructor(signInLogic) {
        this.signInLogic = signInLogic;
    }

    async signIn(req, res, next) {
        try {
            const { email, password } = req.body;
            const token = await this.signInLogic.signIn(email, password);
            res.status(200).send({ token: token });
        } catch (err) {
            next(err);
        }
    }
}

module.exports = SignInController;
