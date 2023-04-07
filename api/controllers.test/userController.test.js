const UserController = require("../controllers/userController");

describe("Create user from invite", () => {
    it("should create a user from invite", async () => {
        let userController;
        let userLogic;
        let req;
        let res;
        let next;

        userLogic = {
            createUserFromInvite: jest.fn().mockResolvedValue({
                token: "token",
                actualRole: "actualRole",
                expirationDate: "expirationDate",
            }),
        };
        userController = new UserController(userLogic);
        const body = {
            name: "testname",
            email: "test@gmail.com",
            role: "testrole",
            familyId: 1,
            password: "testpassword",
            inviteToken: "ahsiethnarsietharis2",
        };
        req = {
            body: body,
        };
        res = {
            cookie: jest.fn(),
            send: jest.fn(),
        };
        next = jest.fn();
        await userController.createUserFromInvite(req, res, next);
        expect(userLogic.createUserFromInvite).toHaveBeenCalledWith(
            body.name,
            body.email,
            body.role,
            body.familyId,
            body.password,
            body.inviteToken
        );
        expect(res.cookie).toHaveBeenCalled();
    });

    it("should throw received error when trying to create user from invite", async () => {
        let userController;
        let userLogic;
        let req;
        let res;
        let next;

        userLogic = {
            createUserFromInvite: jest.fn().mockImplementation(() => {
                throw new Error();
            }),
        };
        userController = new UserController(userLogic);
        const body = {
            name: "testname",
            email: "test@gmail.com",
            role: "testrole",
            familyId: 1,
            password: "testpassword",
            inviteToken: "ahsiethnarsietharis2",
        };
        req = {
            body: body,
        };
        res = {
            send: jest.fn(),
        };
        next = jest.fn();
        try {
            await userController.createUserFromInvite(req, res, next);
        } catch (err) {
            expect(next).toHaveBeenCalled().With(err);
        }
    });
});

describe("Create new user", () => {
    it("should create a new user", async () => {
        let userController;
        let userLogic;
        let req;
        let res;
        let next;

        userLogic = {
            createNewUser: jest.fn().mockResolvedValue({ token: "token", actualRole: "user.role", expirationDate: "expirationDate" }),
        };

        userController = new UserController(userLogic);
        const body = {
            name: "testname",
            email: "test@email.com",
            role: "testrole",
            familyName: "testfamilyname",
            password: "testpassword",
        };
        req = {
            body: body,
        };
        res = {
            cookie: jest.fn(),
            send: jest.fn(),
        };
        next = jest.fn();
        await userController.createNewUser(req, res, next);
        expect(userLogic.createNewUser).toHaveBeenCalledWith(body.name, body.email, body.role, body.familyName, body.password);
        expect(res.cookie).toHaveBeenCalled();
    });

    it("should throw received error when trying to create a new user", async () => {
        let userController;
        let userLogic;
        let req;
        let res;
        let next;

        userLogic = {
            createNewUser: jest.fn().mockImplementation(() => {
                throw new Error();
            }),
        };
        userController = new UserController(userLogic);
        const body = {
            name: "testname",
            email: "test@email.com",
            role: "testrole",
            familyName: "testfamilyname",
            password: "testpassword",
        };
        req = {
            body: body,
        };
        res = {
            send: jest.fn(),
        };
        next = jest.fn();
        try {
            await userController.createNewUser(req, res, next);
        } catch (err) {
            expect(next).toHaveBeenCalled().With(err);
        }
    });
});

describe("Sign in", () => {
    it("should sign in a user", async () => {
        let userController;
        let userLogic;
        let req;
        let res;
        let next;

        userLogic = {
            signIn: jest.fn().mockResolvedValue({ token: "token", role: "user.role", expirationDate: "expirationDate" }),
        };

        userController = new UserController(userLogic);
        const body = {
            email: "test@test.com",
            password: "testpassword",
        };
        req = {
            body: body,
        };
        res = {
            cookie: jest.fn(),
            send: jest.fn(),
        };
        next = jest.fn();
        await userController.signIn(req, res, next);
        expect(userLogic.signIn).toHaveBeenCalledWith(body.email, body.password);
        expect(res.cookie).toHaveBeenCalled();
    });

    it("should throw received error when trying to sign in a user", async () => {
        let userController;
        let userLogic;
        let req;
        let res;
        let next;

        userLogic = {
            signIn: jest.fn().mockImplementation(() => {
                throw new Error();
            }),
        };
        userController = new UserController(userLogic);
        const body = {
            email: "test@email.com",
            password: "testpassword",
        };
        req = {
            body: body,
        };
        res = {
            send: jest.fn(),
        };
        next = jest.fn();
        try {
            await userController.signIn(req, res, next);
        } catch (err) {
            expect(next).toHaveBeenCalled().With(err);
        }
    });
});

describe("Log out", () => {
    it("should log out a user", async () => {
        let userController;
        let userLogic;
        let req;
        let res;
        let next;

        userLogic = {
            logOut: jest.fn().mockResolvedValue(),
        };

        userController = new UserController(userLogic);
        req = {
            cookies: {
                token: "aaseiotn",
            },
        };

        //mock return res.clearCookie("access_token").status(200).json({ message: "Successfully logged out." });]
        res = {
            clearCookie: jest.fn().mockReturnValue({
                status: jest.fn().mockReturnValue({
                    json: jest.fn(),
                }),
            }),
        };

        next = jest.fn();
        await userController.logOut(req, res, next);
        expect(res.clearCookie).toHaveBeenCalled();
    });
});

describe("Update token", () => {
    it("should update token", async () => {
        let userController;
        let userLogic;
        let req;
        let res;
        let next;

        userLogic = {
            updateToken: jest.fn(),
        };

        userController = new UserController(userLogic);
        req = {
            user: {
                userId: 1,
            },
            body: {
                token: "aaseiotnarst",
            },
        };
        const json = jest.fn();
        res = {
            status: jest.fn().mockReturnValue({
                json,
            }),
        };
        next = jest.fn();
        await userController.updateToken(req, res, next);
        expect(userLogic.updateToken).toHaveBeenCalledWith("aaseiotnarst", 1);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(json).toHaveBeenCalledWith({ message: "Token updated correctly" });
    });

    it("should throw received error when trying to update token", async () => {
        let userController;
        let userLogic;
        let req;
        let res;
        let next;

        userLogic = {
            updateToken: jest.fn().mockImplementation(() => {
                throw new Error();
            }),
        };
        userController = new UserController(userLogic);
        req = {
            user: {
                userId: 1,
            },
            body: {},
        };
        res = {
            send: jest.fn(),
        };
        next = jest.fn();
        try {
            await userController.updateToken(req, res, next);
        } catch (err) {
            expect(next).toHaveBeenCalled().With(err);
        }
    });
});
