const FamilyController = require("../controllers/familyController");

describe("Create invite", () => {
    it("should create an invite", async () => {
        let familyController;
        let familyLogic;
        let req;
        let res;
        let next;

        familyLogic = {
            createInvite: jest.fn().mockResolvedValue({
                inviteToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjp7ImZhbWlseUlkIjoiMCIsInVzZXJJZCI6MSwidXNlclR5cGUiOiJhZG1pbmlzdHJhdG9yIn0sImlhdCI6MTY2MzM3MzI5Nn0.ebI5zDTODdFEpfphVtC1VcwnSW9LMimPCvTkY0D44e0",
            }),
        };
        familyController = new FamilyController(familyLogic);
        const body = {
            userType: "Mmeber",
            users: ["test1@gmail.com", "test2@gmail.com"]
        };
        req = {
            body: body,
            user: {
                userId: 1,
                familyId: 1,
            },
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        next = jest.fn();
        await familyController.createInvite(req, res, next);
        expect(familyLogic.createInvite).toHaveBeenCalledWith(
            body.userType,
            body.users,
            req.user.userId,
            req.user.familyId
        );
        expect(res.status).toHaveBeenCalledWith(200);
    });
    it("should throw received error when trying to create an invite", async () => {
        let familyController;
        let familyLogic;
        let req;
        let res;
        let next;

        familyLogic = {
            createInvite: jest.fn().mockImplementation(() => {
                throw new Error();
            }),
        };
        familyController = new FamilyController(familyLogic);
        const body = {
            userType: "Mmeber",
            users: ["te"]
        };
        req = {
            body: body,
            user: {
                userId: 1,
                familyId: 1,
            },
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        next = jest.fn();
        await familyController.createInvite(req, res, next);
        expect(familyLogic.createInvite).toHaveBeenCalledWith(
            body.userType,
            body.users,
            req.user.userId,
            req.user.familyId
        );
        expect(next).toHaveBeenCalled();
    });
});

describe("Validate invite token", () => {
    it("should validate invite token", async () => {
        let familyController;
        let familyLogic;
        let req;
        let res;
        let next;

        familyLogic = {
            validateInviteToken: jest.fn().mockResolvedValue({
                userId: 1,
                userType: "Member",
                familyId: 1,
            }),
        };
        familyController = new FamilyController(familyLogic);
        const params = {
            inviteToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjp7ImZhbWlseUlkIjoiMCIsInVzZXJJZCI6MSwidXNlclR5cGUiOiJhZG1pbmlzdHJhdG9yIn0sImlhdCI6MTY2MzM3MzI5Nn0.ebI5zDTODdFEpfphVtC1VcwnSW9LMimPCvTkY0D44e0",
        };
        req = {
            params: params,
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        next = jest.fn();
        await familyController.validateInviteToken(req, res, next);
        expect(familyLogic.validateInviteToken).toHaveBeenCalledWith(params.inviteToken);
        expect(res.status).toHaveBeenCalledWith(200);
    })
    it("should throw received error when trying to validate invite token", async () => {
        let familyController;
        let familyLogic;
        let req;
        let res;
        let next;

        familyLogic = {
            validateInviteToken: jest.fn().mockImplementation(() => {
                throw new Error();
            }),
        };
        familyController = new FamilyController(familyLogic);
        const params = {
            inviteToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjp7ImZhbWlseUlkIjoiMCIsInVzZXJJZCI6MSwidXNlclR5cGUiOiJhZG1pbmlzdHJhdG9yIn0sImlhdCI6MTY2MzM3MzI5Nn0.ebI5zDTODdFEpfphVtC1VcwnSW9LMimPCvTkY0D44e0",
        };
        req = {
            params: params,
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        next = jest.fn();
        await familyController.validateInviteToken(req, res, next);
        expect(familyLogic.validateInviteToken).toHaveBeenCalledWith(params.inviteToken);
        expect(next).toHaveBeenCalled();
    })
});

