const FamilySql = require("../dataAccess/models/familySQL");
const { createKey, decryptKey } = require("../library/jwtSupplier");
const DuplicateError = require("../errors/DuplicateFamilyError");
const sequelize = require("sequelize");
const sendEmail = require("../library/emailSender");
const { WordValidator, NumberValidator, InArrayValidator, EmailValidator } = require("../errors/inputValidators");
const Roles = require("../library/roles");

class FamilyLogic {
    static nameLength = 20;
    static numberLength = 1000000000;

    static async createNewFamily(name, transaction) {
        try {
            const apiKey = await FamilyLogic.createApiKey(name);
            WordValidator.validate(name, "family name", FamilyLogic.nameLength);
            const family = await FamilySql.instance.create({ name, apiKey }, transaction);
            return family;
        } catch (err) {
            if (err instanceof sequelize.UniqueConstraintError) throw new DuplicateError(name);
            throw err;
        }
    }

    static async updateApiKey(familyId) {
        NumberValidator.validate(familyId, "family id", FamilyLogic.numberLength);

        const family = await FamilySql.instance.findOne({ where: { id: familyId } });
        const apiKey = await FamilyLogic.createApiKey(family.name);
        await FamilySql.instance.update({ apiKey }, { where: { id: familyId } });
    }

    static async getApiKey(familyId) {
        const apiKey = await FamilySql.instance.findOne({
            where: { id: familyId },
            attributes: ["apiKey"],
        });
        return apiKey;
    }

    static async createInvite(userType, users, userId, familyId) {
        InArrayValidator.validate(userType, "user type", Object.keys(Roles));
        users.forEach((user) => {
            EmailValidator.validate(user, "user email");
        });
        const { name } = await FamilyLogic.getFamily(familyId);
        const inviteToken = await FamilyLogic.generateInvite(familyId, name, userId, userType);
        await sendEmail(users, inviteToken, name);
        return inviteToken;
    }

    static async validateInviteToken(inviteToken) {
        const decryptedToken = await decryptKey(inviteToken);
        return decryptedToken;
    }

    static async createApiKey(familyName) {
        const todayDate = new Date();
        const data = { createdAt: todayDate, name: familyName };
        const apiKey = await createKey({ data });
        return apiKey;
    }

    static async getFamily(familyId) {
        const family = await FamilySql.instance.findOne({ where: { id: familyId } });
        return family;
    }

    static async generateInvite(familyId, familyName, userId, userType) {
        const data = { familyId, familyName, userId, userType, date: new Date() };
        const invite = await createKey({ data });
        return invite;
    }
}

module.exports = FamilyLogic;
