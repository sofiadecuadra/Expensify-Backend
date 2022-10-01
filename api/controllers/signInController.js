class SignInController {
    signInLogic;

    constructor(signInLogic) {
        this.signInLogic = signInLogic;
    }

    async signIn(req, res, next) {
        try {
            const { email, password } = req.body;
            const response = await this.signInLogic.signIn(email, password);
            const { token, role, expirationDate } = response;
            res
                .cookie("access_token", token, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === "production",
                    expires: expirationDate,
                })
                .status(200)
                .send({ role, expirationDate });
        } catch (err) {
            next(err);
        }
    }
}

module.exports = SignInController;
