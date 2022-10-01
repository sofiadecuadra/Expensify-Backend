const bcrypt = require("bcryptjs");
const AuthError = require("../errors/auth/AuthError");
const { createKey } = require("../library/jwtSupplier");

class SignInLogic {
    userSql;

    constructor(userSql) {
        this.userSql = userSql;
    }

    async signIn(email, password) {
        let user = await this.userSql.findOne({ where: { email: email } });

        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) throw new AuthError("Your email and password do not match. Please try again.");

        const data = { userId: user.id, role: user.role, email: user.email, familyId: user.familyId };
        const token = await createKey(data);
        const expirationDate = new Date();
        expirationDate.setDate(expirationDate.getDate() + 30);
        const response = { token: token, role: user.role, expirationDate: expirationDate };
        return response;
    }
}

module.exports = SignInLogic;
