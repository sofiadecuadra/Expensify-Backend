const bcrypt = require("bcrypt");
const UserSQL = require("../../models/userSQL");
const { createKey } = require("../../library/jwtSupplier");

class SignInController {

    static async logIn(req, res, next) {
        try {
            let user = await UserSQL.instance.findOne({ email: req.body.email });

            const isValidPassword = await bcrypt.compare(req.body.password, user.password);
            //TO DO: handle errors
            const data = { userId: user.id, role: user.role, email: user.email, familyId: user.familyId };
            const token = await createKey(data);
            console.log(data)
            res.send({ token: token });
        } catch (err) {
            next(err);
        }
    }


}

module.exports = SignInController;