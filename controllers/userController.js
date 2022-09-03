const UserSQL = require('../models/userSQL');
const FamilyController = require('./familyController');
class UserController {

    static async createNewUser(req, res, next) {
        try {
            const { name, email, role, familyName } = req.body;
            await FamilyController.createNewFamily(familyName);
            const user = await UserSQL.instance.create({ name, email, role, familyName });
            res.json(user);
        } catch (err) {
            console.log(err);
            next(err);
        }
    }

    // async deleteUser(user) {
    //     await this.userSQL.deleteUser(user);
    // }

    // async updateUser(user) {
    //     await this.userSQL.updateUser(user);
    // }

    // async getUser(user) {
    //     await this.userSQL.getUser(user);
    // }
}

module.exports = UserController;