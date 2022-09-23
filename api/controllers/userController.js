const UserSQL = require("../../dataAccess/models/userSQL");
const FamilyController = require("./familyController");
const bcrypt = require("bcryptjs");
const { createKey } = require("../../library/jwtSupplier");
const ValidationError = require("../../errors/ValidationError");
const DuplicateError = require("../../errors/DuplicateUserError");
const InviteTokenError = require("../../errors/auth/InviteTokenError");
const sequelize = require("sequelize");
const { WordValidator, EmailValidator, PasswordValidator } = require("../../utilities/inputValidators");
const { decryptKey } = require("../../library/jwtSupplier");

class UserController {
    static nameLength = 20;

    static async createNewUser(req, res, next) {
        try {
            const { name, email, role, familyName, password } = req.body;
            WordValidator.validate(name, "name", UserController.nameLength);
            EmailValidator.validate(email);
            PasswordValidator.validate(password);
            const user = await UserSQL.connection.transaction(async (t) => {
                const family = await FamilyController.createNewFamily(familyName, { transaction: t });
                const salt = await bcrypt.genSalt(10);
                const encryptedPassword = await bcrypt.hash(password.toString(), salt);
                const user = await UserSQL.instance.create(
                    { name, email, role, familyId: family.dataValues.id, password: encryptedPassword },
                    { transaction: t }
                );
                return user;
            });

            const data = { userId: user.id, role: user.role, email: user.email, familyId: user.familyId };
            const token = await createKey(data);
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
            let inviteData = {};
            console.log(inviteToken);
            console.log(inviteToken);

            console.log("inviteToken");

            try {
                inviteData = await decryptKey(inviteToken);
                if (inviteData.data.familyId != familyId) throw new InviteTokenError();
            } catch (e) {
                throw new InviteTokenError();
            }
            WordValidator.validate(name, "name", UserController.nameLength);
            EmailValidator.validate(email);
            PasswordValidator.validate(password);
            const salt = await bcrypt.genSalt(10);
            const encryptedPassword = await bcrypt.hash(password.toString(), salt);

            const user = await UserSQL.instance.create({
                name,
                email,
                role,
                familyId: familyId,
                password: encryptedPassword,
            });

            const data = { userId: user.id, role: user.role, email: user.email, familyId: user.familyId };
            const token = await createKey(data);
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
