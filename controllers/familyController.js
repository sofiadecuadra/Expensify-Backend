const FamilySql = require("../dataAccess/models/familySQL");
const { createKey, decryptKey } = require("../library/jwtSupplier");
const DuplicateError = require("../errors/DuplicateFamilyError");
const sequelize = require("sequelize");
const sendEmail = require("../library/emailSender");
const { WordValidator, NumberValidator, InArrayValidator, EmailValidator } = require("../utilities/inputValidators");
const Roles = require("../library/roles");
class FamilyController {
    static nameLength = 20;
    static numberLength = 1000000000;

    static async createNewFamily(name, transaction) {
        try {
            const apiKey = await FamilyController.createApiKey(name);
            WordValidator.validate(name, "family name", FamilyController.nameLength);
            const family = await FamilySql.instance.create({ name, apiKey }, transaction);
            return family;
        } catch (err) {
            if (err instanceof sequelize.UniqueConstraintError) throw new DuplicateError(name);
            throw err;
        }
    }

    static async updateApiKey(req, res, next) {
        try {
            const { familyId } = req.user;
            NumberValidator.validate(familyId, "family id", FamilyController.numberLength);

            const family = await FamilySql.instance.findOne({ where: { id: familyId } });
            const apiKey = await FamilyController.createApiKey(family.name);
            await FamilySql.instance.update({ apiKey }, { where: { id: familyId } });
            res.status(200).json({ message: "Family API KEY updated successfully" });
        } catch (err) {
            next(err);
        }
    }

    static async getApiKey(req, res, next) {
        try {
            const { familyId } = req.user;

            const apiKey = await FamilySql.instance.findOne({
                where: { id: familyId },
                attributes: ["apiKey"],
            });
            res.json(apiKey);
        } catch (err) {
            console.log(err.message);
            next(err);
        }
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

    static async createInvite(req, res, next) {
        try {
            const { userType, users } = req.body;
            const { userId, familyId } = req.user;
            InArrayValidator.validate(userType, "user type", Object.keys(Roles));
            users.forEach((user) => {
                EmailValidator.validate(user, "user email");
            });
            const { name } = await FamilyController.getFamily(familyId);

            const inviteToken = await FamilyController.generateInvite(familyId, name, userId, userType);
            //mailing the inviteToken to the user

            await sendEmail(users, inviteToken, name);
            res.status(200).json({ inviteToken });
        } catch (err) {
            console.log(err.message);
            next(err);
        }
    }

    static async generateInvite(familyId, familyName, userId, userType) {
        const data = { familyId, familyName, userId, userType, date: new Date() };
        console.log(data);
        const invite = await createKey({ data });
        return invite;
    }

    static async validateInviteToken(req, res, next) {
        try {
            const { inviteToken } = req.params;
            const decryptedToken = await decryptKey(inviteToken);
            res.status(200).json({ inviteData: decryptedToken.data });
        } catch (err) {
            console.log(err.message);
            next(err);
        }
    }
}

module.exports = FamilyController;
