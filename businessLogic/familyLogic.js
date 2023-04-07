const jwtSupplier = require("../library/jwtSupplier");
const DuplicateError = require("../errors/DuplicateFamilyError");
const sequelize = require("sequelize");
const WordValidator = require("../utilities/validators/wordValidator");
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
            WordValidator.validate(name, "family name", this.nameLength);
            const family = await this.familySQL.create({ name }, transaction);
            console.info("[FAMILY_CREATE] Family created id: " + family.id);
            return family;
        } catch (err) {
            if (err instanceof sequelize.UniqueConstraintError) throw new DuplicateError(name);
            throw err;
        }
    }

    async createInvite(userType, users, userId, familyId) {
        InArrayValidator.validate(userType, "user type", Object.keys(Roles));
        users.forEach((user) => {
            EmailValidator.validate(user, "user email");
        });
        const { name } = await this.getFamily(familyId);
        const inviteToken = await this.generateInvite(familyId, name, userId, userType);
        return inviteToken;
    }

    async validateInviteToken(inviteToken) {
        const decryptedToken = await jwtSupplier.decryptKey(inviteToken);
        return decryptedToken;
    }

    async getFamily(familyId) {
        const family = await this.familySQL.findOne({ where: { id: familyId } });
        return family;
    }

    async generateInvite(familyId, familyName, userId, userType) {
        const data = { familyId, familyName, userId, userType, date: new Date() };
        const invite = await jwtSupplier.createKey({ data });
        return invite;
    }
}

module.exports = FamilyLogic;
