class FamilyController {
    familyLogic;

    constructor(familyLogic) {
        this.familyLogic = familyLogic;
    }

    async updateApiKey(req, res, next) {
        try {
            const { userId, familyId } = req.user;
            await this.familyLogic.updateApiKey(userId, familyId);
            res.status(200).json({ message: "Family API KEY updated successfully" });
        } catch (err) {
            next(err);
        }
    }

    async getApiKey(req, res, next) {
        try {
            const { familyId } = req.user;
            const apiKey = await this.familyLogic.getApiKey(familyId);
            res.status(200).json(apiKey);
        } catch (err) {
            next(err);
        }
    }

    async createInvite(req, res, next) {
        try {
            const { userType, users } = req.body;
            const { userId, familyId } = req.user;
            const inviteToken = await this.familyLogic.createInvite(userType, users, userId, familyId);
            res.status(200).json({ inviteToken });
        } catch (err) {
            next(err);
        }
    }

    async validateInviteToken(req, res, next) {
        try {
            const { inviteToken } = req.params;
            const decryptedToken = await this.familyLogic.validateInviteToken(inviteToken);
            res.status(200).json({ inviteData: decryptedToken.data });
        } catch (err) {
            next(err);
        }
    }
}

module.exports = FamilyController;
