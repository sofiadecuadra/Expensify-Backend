const UserSQL = require("../models/userSQL");
const FamilyController = require("./familyController");
class UserController {
    static async createNewUser(req, res, next) {
        try {
            const { name, email, role, familyName } = req.body;
            const family = await FamilyController.createNewFamily(familyName);
            const user = await UserSQL.instance.create({ name, email, role, familyId: family.dataValues.id });
            res.json(user);
        } catch (err) {
            console.log(err);
            next(err);
        }
    }
}

module.exports = UserController;