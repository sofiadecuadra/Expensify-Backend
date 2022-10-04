const { createKey, decryptKey } = require("../library/jwtSupplier");
const DuplicateError = require("../errors/DuplicateFamilyError");
const sequelize = require("sequelize");
const sendEmail = require("../library/emailSender");
const WordValidator = require("../utilities/validators/wordValidator");
const NumberValidator = require("../utilities/validators/numberValidator");
const EmailValidator = require("../utilities/validators/emailValidator");
const InArrayValidator = require("../utilities/validators/inArrayValidator");
const Roles = require("../library/roles");

class FamilyLogic {
    nameLength = 20;
    numberLength = 1000000000;
    familySQL;

    constructor(familySQL) {
        this.familySQL = familySQL;
    }

    async createNewFamily(name, transaction) {
        try {
            const apiKey = await this.createApiKey(name);
            WordValidator.validate(name, "family name", this.nameLength);
            const family = await this.familySQL.create({ name, apiKey }, transaction);
            console.info("[FAMILY_CREATE] Family created id: " + family.id);
            return family;
        } catch (err) {
            if (err instanceof sequelize.UniqueConstraintError) throw new DuplicateError(name);
            throw err;
        }
    }

    async updateApiKey(userId, familyId) {
        NumberValidator.validate(familyId, "family id", this.numberLength);
        const family = await this.familySQL.findOne({ where: { id: familyId } });
        const apiKey = await this.createApiKey(family.name);
        await this.familySQL.update({ apiKey }, { where: { id: familyId } });
        console.info(`[USER_${userId}] [API_KEY_UPDATE] Family updated id: ${familyId}`);
    }

    async getApiKey(familyId) {
        const apiKey = await this.familySQL.findOne({
            where: { id: familyId },
            attributes: ["apiKey"],
        });
        return apiKey;
    }

    async createInvite(userType, users, userId, familyId) {
        InArrayValidator.validate(userType, "user type", Object.keys(Roles));
        users.forEach((user) => {
            EmailValidator.validate(user, "user email");
        });
        const { name } = await this.getFamily(familyId);
        const inviteToken = await this.generateInvite(familyId, name, userId, userType);
        await sendEmail(users, inviteToken, name);
        console.info(`[USER_${userId}] [INVITATON] users invited: ${users}`);
        return inviteToken;
    }

    async validateInviteToken(inviteToken) {
        const decryptedToken = await decryptKey(inviteToken);
        return decryptedToken;
    }

    async createApiKey(familyName) {
        const todayDate = new Date();
        const data = { createdAt: todayDate, name: familyName };
        const apiKey = await createKey({ data });
        return apiKey;
    }

    async getFamily(familyId) {
        const family = await this.familySQL.findOne({ where: { id: familyId } });
        return family;
    }

    async generateInvite(familyId, familyName, userId, userType) {
        const data = { familyId, familyName, userId, userType, date: new Date() };
        const invite = await createKey({ data });
        return invite;
    }
}

module.exports = FamilyLogic;
