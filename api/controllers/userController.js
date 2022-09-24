const UserSQL = require("../../dataAccess/models/userSQL");
const FamilyController = require("./familyController");
const bcrypt = require("bcryptjs");
const { createKey } = require("../../library/jwtSupplier");
const ValidationError = require("../../errors/ValidationError");
const DuplicateError = require("../../errors/DuplicateUserError");
const InviteTokenError = require("../../errors/auth/InviteTokenError");
const sequelize = require("sequelize");
const { WordValidator, EmailValidator, PasswordValidator } = require("../../errors/inputValidators");
const { decryptKey } = require("../../library/jwtSupplier");
const UserLogic = require("../../businessLogic/userLogic");

class UserController {
    static nameLength = 20;

    static async createNewUser(req, res, next) {
        try {
            const { name, email, role, familyName, password } = req.body;
            const token = await UserLogic.createNewUser(name, email, role, familyName, password);
            res.send({ token: token });
        } catch (err) {
            console.log(err);
            const { email } = req.body;
            if (err instanceof sequelize.UniqueConstraintError) next(new DuplicateError(email));
            if (err instanceof sequelize.ValidationError) next(new ValidationError(err.errors));
            else next(err);
        }
    }

    static async createUserFromInvite(req, res, next) {
        try {
            const { name, email, role, familyId, password, inviteToken } = req.body;
            const token = await UserLogic.createUserFromInvite(name, email, role, familyId, password, inviteToken);
            res.send({ token: token });
        } catch (err) {
            console.log(err);
            const { email } = req.body;
            if (err instanceof sequelize.UniqueConstraintError) next(new DuplicateError(email));
            if (err instanceof sequelize.ValidationError) next(new ValidationError(err.errors));
            else next(err);
        }
    }
}

module.exports = UserController;
