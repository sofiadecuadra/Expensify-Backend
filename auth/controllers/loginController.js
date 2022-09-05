const bcrypt = require("bcrypt");
const { User } = require("../../models/UserSQL");

class loginController {
    static async logIn(req, res, next) {
        try {
            let user = await User.findOne({ email: req.body.email });

            const isValidPassword = await bcrypt.compare(req.body.password, user.password);
            if (!isValidPassword) throw new LoginError();

            const token = user.createToken();
            res.send({ token: token });
        } catch (err) {
            next(err);
        }
    }
}

module.exports = loginController;