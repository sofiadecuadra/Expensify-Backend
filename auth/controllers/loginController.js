const bcrypt = require("bcrypt");
const UserSQL = require("../../models/userSQL");
const jwt = require("jsonwebtoken");
const config = require("config");

class LoginController {

    static async logIn(req, res, next) {
        try {
            console.log(UserSQL);
            let user = await UserSQL.instance.findOne({ email: req.body.email });

            const isValidPassword = await bcrypt.compare(req.body.password, user.password);
            //TO DO: handle errors
            const token = await LoginController.createToken(user.id, user.role, user.email, user.familyId);
            res.send({ token: token });
        } catch (err) {
            next(err);
        }
    }

    static async createToken(userId, role, email, familyId) {
        const token = jwt.sign({ userId, role, email, familyId }, config.get('SECRET_KEY'));
        return token;
    };
}

module.exports = LoginController;