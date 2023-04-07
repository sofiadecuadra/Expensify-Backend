const bcrypt = require("bcryptjs");
const jwtSupplier = require("../library/jwtSupplier");
const ValidationError = require("../errors/ValidationError");
const DuplicateError = require("../errors/DuplicateUserError");
const InviteTokenError = require("../errors/auth/InviteTokenError");
const sequelize = require("sequelize");
const WordValidator = require("../utilities/validators/wordValidator");
const EmailValidator = require("../utilities/validators/emailValidator");
const PasswordValidator = require("../utilities/validators/passwordValidator");
const AuthError = require("../errors/auth/AuthError");

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
            const token = await jwtSupplier.createKey(data);
            const expirationDate = new Date();
            expirationDate.setDate(expirationDate.getDate() + 30);
            const response = { token: token, actualRole: user.role, expirationDate: expirationDate };
            console.info(`[USER_${user.id}] [USER_CREATE]`);
            console.info(`[USER_${user.id}] [SIGN_IN]`);
            return response;
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
                inviteData = await jwtSupplier.decryptKey(inviteToken);
                if (inviteData.data.familyId != familyId) throw new InviteTokenError();
            } catch (e) {
                throw e;
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
            const token = await jwtSupplier.createKey(data);
            const expirationDate = new Date();
            expirationDate.setDate(expirationDate.getDate() + 30);
            const response = { token: token, actualRole: user.role, expirationDate: expirationDate };
            console.info(`[USER_${user.id}] [USER_CREATE]`);
            console.info(`[USER_${user.id}] [SIGN_IN]`);
            return response;
        } catch (err) {
            if (err instanceof sequelize.UniqueConstraintError) throw new DuplicateError(email);
            if (err instanceof sequelize.ValidationError) throw new ValidationError(err.errors);
            else throw err;
        }
    }

    async signIn(email, password) {
        let user = await this.userSQL.findOne({ where: { email: email } });
        if (!user) {
            console.info(`[EMAIL_${email}] [SIGN_IN_ATTEMPT]`);
            throw new AuthError("Your email and password do not match. Please try again.");
        }

        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            console.info(`[EMAIL_${email}] [SIGN_IN_ATTEMPT]`);
            throw new AuthError("Your email and password do not match. Please try again.");
        }

        const data = { userId: user.id, role: user.role, email: user.email, familyId: user.familyId };
        const token = await jwtSupplier.createKey(data);
        const expirationDate = new Date();
        expirationDate.setDate(expirationDate.getDate() + 30);
        const response = { token: token, role: user.role, expirationDate: expirationDate };
        console.info(`[USER_${user.id}] [SIGN_IN]`);
        return response;
    }

    async updateToken(token, userId) {
        const user = await this.userSQL.findOne({ where: { id: userId } });
        if (!user) {
            console.info(`[USER_${userId}] [UPDATE_TOKEN] User not found`);
            throw new AuthError("User not found.");
        }
        user.expoToken = token;
        await user.save();
        console.info(`[USER_${userId}] [UPDATE_TOKEN] User token updated correctly`);
    }
}

module.exports = UserLogic;
