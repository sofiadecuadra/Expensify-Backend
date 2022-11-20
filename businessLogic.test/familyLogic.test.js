const FamilyLogic = require("../businessLogic/familyLogic");
const DuplicateError = require("../errors/DuplicateFamilyError");
const InputValidationError = require("../errors/inputValidationError");
const jwtSupplier = require("../library/jwtSupplier");
const sequelize = require("sequelize");

describe("create new family", () => {
    describe("createNewFamily", () => {
        it("should create a new family", async () => {
            const family = {
                id: 1,
                name: "test",
            };
            const familySQL = {
                create: jest.fn().mockReturnValue(family),
            };
            const familyLogic = new FamilyLogic(familySQL);
            let transaction = undefined;

            const result = await familyLogic.createNewFamily("test", transaction);
            const expectedResponse = {
                id: 1,
                name: "test",
            };
            expect(result).toEqual(expectedResponse);
            expect(familySQL.create).toHaveBeenCalled();
        });
        it("should throw an error if the family name is not unique", async () => {
            const familySQL = {
                create: jest.fn().mockRejectedValue(new sequelize.UniqueConstraintError),
            };
            const familyLogic = new FamilyLogic(familySQL);
            let transaction = undefined;

            await expect(familyLogic.createNewFamily("test", transaction)).rejects.toThrow("A family named 'test' already exists. Please try again.");
            expect(familySQL.create).toHaveBeenCalled();
        });
        it("should throw an error if an error ocurred", async () => {
            const familySQL = {
                create: jest.fn().mockRejectedValue(new Error("An error ocurred while creating the family. Please try again.")),
            };
            const familyLogic = new FamilyLogic(familySQL);
            let transaction = undefined;

            await expect(familyLogic.createNewFamily("test", transaction)).rejects.toThrow("An error ocurred while creating the family. Please try again.");
            expect(familySQL.create).toHaveBeenCalled();
        });
        it("should throw an error if the family name is not valid", async () => {
            const family = {
                id: 1,
                name: "te",
            };
            const familySQL = {
                create: jest.fn().mockReturnValue(family),
            };
            const familyLogic = new FamilyLogic(familySQL);
            let transaction = undefined;

            try {
                await familyLogic.createNewFamily("te", transaction);
            }
            catch (err) {
                expect(err).toBeInstanceOf(InputValidationError);
                expect(err.message).toBe("Please enter a non-empty family name containing only letters, numbers or spaces with maximum length of 20!");
                expect(err.body()).toEqual({
                    errorType: `INPUT_VALIDATION_ERROR`,
                    message: "Please enter a non-empty family name containing only letters, numbers or spaces with maximum length of 20!",
                });
            }
        });
    });
});
describe("create invite", () => {
    describe("createInvite", () => {
        it("should create an invite", async () => {
            jest.spyOn(jwtSupplier, "createKey").mockImplementation((token) => {});
            const family = {
                id: 1,
                name: "test",
            };
            const user = {
                id: 1,
                email: "test@gmail.com"
            }
            const familySQL = {
                findOne: jest.fn().mockReturnValue(family),
            };
            const familyLogic = new FamilyLogic(familySQL);
            const result = await familyLogic.createInvite("Member", ["test1@gmail.com", "test2@gmail.com"], user.id, family.id);
            const data = { familyId: family.id, familyName: family.name, userId: user.id, userType: "Member", date: new Date() };
            const expectedResponse = jwtSupplier.createKey(data);
            expect(result).toEqual(expectedResponse);
        });
        it("should throw an error if the user type is not valid", async () => {
            const family = {
                id: 1,
                name: "test",
            };
            const user = {
                id: 1,
                email: "test@gmail.com"
            }
            const familySQL = {
                findOne: jest.fn().mockReturnValue(family),
            };
            const familyLogic = new FamilyLogic(familySQL);

            try {
                await familyLogic.createInvite("Mem", ["test1@gmail.com", "test2@gmail.com"], user.id, family.id);
            }
            catch (err) {
                expect(err).toBeInstanceOf(InputValidationError);
                expect(err.message).toBe("Please enter a valid user type from the list [Member,Administrator]!");
                expect(err.body()).toEqual({
                    errorType: `INPUT_VALIDATION_ERROR`,
                    message: "Please enter a valid user type from the list [Member,Administrator]!",
                });
            }
        });
        it("should throw an error if the users emails are not valid", async () => {
            const family = {
                id: 1,
                name: "test",
            };
            const user = {
                id: 1,
                email: "test@gmail.com"
            }
            const familySQL = {
                findOne: jest.fn().mockReturnValue(family),
            };
            const familyLogic = new FamilyLogic(familySQL);

            try {
                await familyLogic.createInvite("Member", ["tes", "te"], user.id, family.id);
            }
            catch (err) {
                expect(err).toBeInstanceOf(InputValidationError);
                expect(err.message).toBe("Please enter a valid email!");
                expect(err.body()).toEqual({
                    errorType: `INPUT_VALIDATION_ERROR`,
                    message: "Please enter a valid email!",
                });
            }
        })
    });
});
describe("validate invite token", () => {
    describe("validateInviteToken", () => {
        it("should validate the invite token", async () => {
            const inviteDate = { data: { familyId: 1 } };
            jest.spyOn(jwtSupplier, "decryptKey").mockImplementation((token) => inviteDate);
            const family = {
                id: 1,
                name: "test",
            };
            const familySQL = {
                create: jest.fn().mockReturnValue(family),
            };
            const familyLogic = new FamilyLogic(familySQL);
            const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjp7ImZhbWlseUlkIjoiMCIsInVzZXJJZCI6MSwidXNlclR5cGUiOiJhZG1pbmlzdHJhdG9yIn0sImlhdCI6MTY2MzM3MzI5Nn0.ebI5zDTODdFEpfphVtC1VcwnSW9LMimPCvTkY0D44e0";

            const result = await familyLogic.validateInviteToken(token);

            expect(result).toEqual(inviteDate);
        });
    });
})
