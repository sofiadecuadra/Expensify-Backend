const bcrypt = require("bcryptjs");
const { createKey } = require("../library/jwtSupplier");
const ValidationError = require("../errors/ValidationError");
const DuplicateError = require("../errors/DuplicateUserError");
const InviteTokenError = require("../errors/auth/InviteTokenError");
const sequelize = require("sequelize");
const WordValidator = require("../utilities/validators/wordValidator");
const EmailValidator = require("../utilities/validators/emailValidator");
const PasswordValidator = require("../utilities/validators/passwordValidator");
const { decryptKey } = require("../library/jwtSupplier");

class UserLogic {
    nameLength = 20;
    userSQL;
    userConnection;
    familyLogic;

    constructor(userSQL, userConnection, familyLogic) {
        this.userSQL = userSQL;
        this.userConnection = userConnection;
        this.familyLogic = familyLogic;
    }

    async createNewUser(name, email, role, familyName, password) {
        try {
            WordValidator.validate(name, "name", this.nameLength);
            EmailValidator.validate(email);
            PasswordValidator.validate(password);
            const user = await this.userConnection.transaction(async (t) => {
                const family = await this.familyLogic.createNewFamily(familyName, { transaction: t });
                const salt = await bcrypt.genSalt(10);
                const encryptedPassword = await bcrypt.hash(password.toString(), salt);
                const user = await this.userSQL.create(
                    { name, email, role, familyId: family.dataValues.id, password: encryptedPassword },
                    { transaction: t }
                );
                return user;
            });

            const data = { userId: user.id, role: user.role, email: user.email, familyId: user.familyId };
            const token = await createKey(data);
            return token;
        } catch (err) {
            if (err instanceof sequelize.UniqueConstraintError) throw new DuplicateError(email);
            if (err instanceof sequelize.ValidationError) throw new ValidationError(err.errors);
            else throw err;
        }
    }

    async createUserFromInvite(name, email, role, familyId, password, inviteToken) {
        try {
            let inviteData = {};
            try {
                inviteData = await decryptKey(inviteToken);
                if (inviteData.data.familyId != familyId) throw new InviteTokenError();
            } catch (e) {
                throw new InviteTokenError();
            }
            WordValidator.validate(name, "name", this.nameLength);
            EmailValidator.validate(email);
            PasswordValidator.validate(password);
            const salt = await bcrypt.genSalt(10);
            const encryptedPassword = await bcrypt.hash(password.toString(), salt);

            const user = await this.userSQL.create({
                name,
                email,
                role,
                familyId: familyId,
                password: encryptedPassword,
            });

            const data = { userId: user.id, role: user.role, email: user.email, familyId: user.familyId };
            const token = await createKey(data);
            return token;
        } catch (err) {
            if (err instanceof sequelize.UniqueConstraintError) throw new DuplicateError(email);
            if (err instanceof sequelize.ValidationError) throw new ValidationError(err.errors);
            else throw err;
        }
    }
}

module.exports = UserLogic;
