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
        if (!user) throw new AuthError("Your email and password do not match. Please try again.");

        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) throw new AuthError("Your email and password do not match. Please try again.");

        const data = { userId: user.id, role: user.role, email: user.email, familyId: user.familyId };
        const token = await createKey(data);
        console.info("[SIGN_IN] User signed in id: " + user.id);
        return token;
    }
}

module.exports = SignInLogic;
