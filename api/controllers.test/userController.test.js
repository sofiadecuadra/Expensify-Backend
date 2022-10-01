const UserController = require("../controllers/userController");

describe("UserController", () => {
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
        }
        userController = new UserController(userLogic);
        const body = {
            name: "testname",
            email: "test@gmail.com",
            role: "testrole",
            familyId: 1,
            password: "testpassword",
            inviteToken: "ahsiethnarsietharis2"
        }
        req = {
            body: body
        };
        res = {
            cookie: jest.fn(),
            send: jest.fn(),
        };
        next = jest.fn();
        await userController.createUserFromInvite(req, res, next);
        expect(userLogic.createUserFromInvite).toHaveBeenCalledWith(body.name, body.email, body.role, body.familyId, body.password, body.inviteToken);
        expect(res.cookie).toHaveBeenCalled();
    });

    it("should throw received error", async () => {
        let userController;
        let userLogic;
        let req;
        let res;
        let next;

        userLogic = {
            createUserFromInvite: jest.fn().mockImplementation(() => {
                throw new Error();
            }),
        }
        userController = new UserController(userLogic);
        const body = {
            name: "testname",
            email: "test@gmail.com",
            role: "testrole",
            familyId: 1,
            password: "testpassword",
            inviteToken: "ahsiethnarsietharis2"
        }
        req = {
            body: body
        };
        res = {
            send: jest.fn(),
        };
        next = jest.fn();
        try {
            await userController.createUserFromInvite(req, res, next);
        }
        catch (err) {
            expect(next).toHaveBeenCalled().With(err);
        }

    });
});
