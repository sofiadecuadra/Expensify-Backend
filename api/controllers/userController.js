const UserLogic = require("../../businessLogic/userLogic");

class UserController {
    static async createNewUser(req, res, next) {
        try {
            const { name, email, role, familyName, password } = req.body;
            const token = await UserLogic.createNewUser(name, email, role, familyName, password);
            res.send({ token: token });
        } catch (err) {
            next(err);
        }
    }

    static async createUserFromInvite(req, res, next) {
        try {
            const { name, email, role, familyId, password, inviteToken } = req.body;
            const token = await UserLogic.createUserFromInvite(name, email, role, familyId, password, inviteToken);
            res.send({ token: token });
        } catch (err) {
            next(err);
        }
    }
}

module.exports = UserController;
