const UserSQL = require("../models/userSQL");
const FamilyController = require("./familyController");
const bcrypt = require("bcrypt");
const UserDTO = require("../DTO/userDTO");
const createKey = require("../library/jwtSupplier");

class UserController {
    static async createNewUser(req, res, next) {
        try {
            const { name, email, role, familyName, password } = req.body;
            const family = await FamilyController.createNewFamily(familyName);
            const salt = await bcrypt.genSalt(10);
            const encriptedPassword = await bcrypt.hash(password.toString(), salt);
            const user = await UserSQL.instance.create({ name, email, role, familyId: family.dataValues.id, password: encriptedPassword });
            const data = { userId: user.id, role: user.role, email: user.email, familyId: user.familyId };
            const token = await createKey(data);
            res.send({ token: token });
        } catch (err) {
            console.log(err);
            next(err);
        }
    }
}

module.exports = UserController;