const bcrypt = require("bcrypt");
const UserSQL = require("../models/userSQL");
const jwt = require("jsonwebtoken");

class loginController {
    static async logIn(req, res, next) {
        try {
            console.log(UserSQL);
            let user = await UserSQL.instance.findOne({ email: req.body.email });

            const isValidPassword = await bcrypt.compare(req.body.password, user.password);
            //TO DO: handle errors
            const token = await loginController.createToken();
            res.send({ token: token });
        } catch (err) {
            next(err);
        }
    }

    static async createToken(id, role) {
        const token = jwt.sign({ id, role }, "secret");
        return token;
    };
}

module.exports = loginController;