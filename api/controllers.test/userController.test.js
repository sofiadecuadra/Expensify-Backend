const UserController = require("../controllers/userController");

describe("UserController", () => {
    it("should create a user from invite", async () => {
        let userController;
        let userLogic;
        let req;
        let res;
        let next;

        userLogic = {
            createUserFromInvite: jest.fn(),
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
        userController.createUserFromInvite(req, res, next);
        expect(userLogic.createUserFromInvite).toHaveBeenCalledWith(body.name, body.email, body.role, body.familyId, body.password, body.inviteToken);

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
            userController.createUserFromInvite(req, res, next);
        }
        catch (err) {
            expect(next).toHaveBeenCalled().With(err);
        }

    });
});
