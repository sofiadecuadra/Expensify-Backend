const FamilyLogic = require("../../businessLogic/familyLogic");
class FamilyController {
    static async updateApiKey(req, res, next) {
        try {
            const { familyId } = req.user;
            await FamilyLogic.updateApiKey(familyId);
            res.status(200).json({ message: "Family API KEY updated successfully" });
        } catch (err) {
            next(err);
        }
    }

    static async getApiKey(req, res, next) {
        try {
            const { familyId } = req.user;
            const apiKey = await FamilyLogic.getApiKey(familyId);
            res.status(200).json(apiKey);
        } catch (err) {
            next(err);
        }
    }

    static async createInvite(req, res, next) {
        try {
            const { userType, users } = req.body;
            const { userId, familyId } = req.user;
            const inviteToken = await FamilyLogic.createInvite(userType, users, userId, familyId);
            res.status(200).json({ inviteToken });
        } catch (err) {
            next(err);
        }
    }

    static async validateInviteToken(req, res, next) {
        try {
            const { inviteToken } = req.params;
            const decryptedToken = await FamilyLogic.validateInviteToken(inviteToken);
            res.status(200).json({ inviteData: decryptedToken.data });
        } catch (err) {
            next(err);
        }
    }
}

module.exports = FamilyController;
