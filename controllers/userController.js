const UserSQL = require("../models/userSQL");
const FamilyController = require("./familyController");
const bcrypt = require("bcrypt");
const createKey = require("../library/jwtSupplier");
const ValidationError = require('../errors/ValidationError');
const DuplicateError = require('../errors/DuplicateUserError');
const sequelize = require("sequelize");
const WordValidator = require("../utilities/inputValidators");
const EmailValidator = require("../utilities/inputValidators");
const PasswordValidator = require("../utilities/inputValidators");

class UserController {
    static async createNewUser(req, res, next) {
        try {
            const { name, email, role, familyName, password } = req.body;
            WordValidator.validate(name, "name", 20);
            EmailValidator.validate(email);
            PasswordValidator.validate(password);
            const user = await UserSQL.connection.transaction(async (t) => {
                const family = await FamilyController.createNewFamily(familyName, { transaction: t });
                const salt = await bcrypt.genSalt(10);
                const encriptedPassword = await bcrypt.hash(password.toString(), salt);
                const user = await UserSQL.instance.create({ name, email, role, familyId: family.dataValues.id, password: encriptedPassword }, { transaction: t });
                return user;
            });

            const data = { userId: user.id, role: user.role, email: user.email, familyId: user.familyId };
            const token = await createKey(data);
            res.send({ token: token });
        } catch (err) {
            console.log(err);
            const { email } = req.body;
            if (err instanceof sequelize.UniqueConstraintError) next(new DuplicateError(email));
            if (err instanceof sequelize.ValidationError) next(new ValidationError(err.errors));
            else next(err);
        }
    }
}

module.exports = UserController;