const UserLogic = require("../../businessLogic/userLogic");

class UserController {
    userLogic;

    constructor(userLogic) {
        this.userLogic = userLogic;
    }

    async createNewUser(req, res, next) {
        try {
            const { name, email, role, familyName, password } = req.body;
            const token = await this.userLogic.createNewUser(name, email, role, familyName, password);
            res.send({ token: token });
        } catch (err) {
            next(err);
        }
    }

    async createUserFromInvite(req, res, next) {
        try {
            const { name, email, role, familyId, password, inviteToken } = req.body;
            const token = await this.userLogic.createUserFromInvite(name, email, role, familyId, password, inviteToken);
            res.send({ token: token });
        } catch (err) {
            next(err);
        }
    }

    async signIn(req, res, next) {
        try {
            const { email, password } = req.body;
            const response = await this.userLogic.signIn(email, password);
            const { token, role, expirationDate } = response;
            res
                .cookie("access_token", token, {
                    httpOnly: true,
                    secure: false, //TODO Poner en True para HTTPS
                    expires: expirationDate,
                })
                .status(200)
                .send({ role, expirationDate });
        } catch (err) {
            next(err);
        }
    }
}

module.exports = UserController;
