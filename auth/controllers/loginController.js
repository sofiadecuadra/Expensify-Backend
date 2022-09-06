const bcrypt = require("bcrypt");
const UserSQL = require("../../models/userSQL");
const createToken = require("../../library/tokenManager");

class LoginController {

    static async logIn(req, res, next) {
        try {
            console.log(UserSQL);
            let user = await UserSQL.instance.findOne({ email: req.body.email });

            const isValidPassword = await bcrypt.compare(req.body.password, user.password);
            //TO DO: handle errors
            const token = await createToken(user.id, user.role, user.email, user.familyId);
            res.send({ token: token });
        } catch (err) {
            next(err);
        }
    }


}

module.exports = LoginController;