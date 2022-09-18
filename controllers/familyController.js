const FamilySql = require("../models/familySQL");
const { createKey, decryptKey } = require("../library/jwtSupplier");
const DuplicateError = require("../errors/DuplicateFamilyError");
const sequelize = require("sequelize");
const { WordValidator, NumberValidator, InArrayValidator } = require("../utilities/inputValidators");

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
            console.log(err.message);
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

    static async createInvite(req, res, next) {
        try {
            const { userType, users } = req.body;
            const { userId, familyId } = req.user;

            InArrayValidator.validate(userType, "user type", ["administrator", "member"]);
            NumberValidator.validate(familyId, "family id", FamilyController.numberLength);

            const inviteToken = await FamilyController.generateInvite(familyId, userId, userType);
            //mailing the inviteToken to the user
            res.status(200).json({ inviteToken });
        } catch (err) {
            console.log(err.message);
            next(err);
        }
    }

    static async generateInvite(familyId, userId, userType) {
        const data = { familyId, userId, userType, date: new Date() };
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
