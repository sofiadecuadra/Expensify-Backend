const UserLogic = require("../businessLogic/userLogic");
const bcrypt = require("bcryptjs");
const { createKey } = require("../library/jwtSupplier");
const InviteTokenError = require("../errors/auth/InviteTokenError");

describe("UserLogic", () => {
    describe("createUserFromInvite", () => {
        it("should create a user from invite", async () => {
            const encryptedPassword = "$2a$10$Pmo2cciLoefYNYnWE024ZOE8eHxyJMa/DGkSzRUNWm9yh7Oh3o54C";
            jest.spyOn(bcrypt, 'hash').mockImplementation((pass, salt) => encryptedPassword)
            const user = {
                id: 1,
                role: 1,
                email: "email@gmail.com",
                familyId: 0,
            }
            const userSQL = {
                create: jest.fn().mockResolvedValue(user),
            };
            const familySQL = {};
            const userLogicInstance = new UserLogic(userSQL, familySQL);
            const name = "name";
            const email = "email@gmail.com";
            const password = "password"
            const role = 1;
            const familyId = 0;
            const inviteToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjp7ImZhbWlseUlkIjoiMCIsInVzZXJJZCI6MSwidXNlclR5cGUiOiJhZG1pbmlzdHJhdG9yIn0sImlhdCI6MTY2MzM3MzI5Nn0.ebI5zDTODdFEpfphVtC1VcwnSW9LMimPCvTkY0D44e0"

            const token = await userLogicInstance.createUserFromInvite(name, email, role, familyId, password, inviteToken);

            expect(userSQL.create).toHaveBeenCalledWith({
                name,
                email,
                role,
                familyId: familyId,
                password: encryptedPassword,
            });
            const data = { userId: user.id, role: user.role, email: user.email, familyId: user.familyId };
            const expectedToken = await createKey(data);
            expect(token).toEqual(expectedToken);
        });
    });

    describe("createUserFromInvite invalid token", () => {
        it("should throw token error", async () => {
            const encryptedPassword = "$2a$10$Pmo2cciLoefYNYnWE024ZOE8eHxyJMa/DGkSzRUNWm9yh7Oh3o54C";
            jest.spyOn(bcrypt, 'hash').mockImplementation((pass, salt) => encryptedPassword)
            const user = {
                id: 1,
                role: 1,
                email: "email@gmail.com",
                familyId: 0,
            }
            const userSQL = {
                create: jest.fn().mockResolvedValue(user),
            };
            const familySQL = {};
            const userLogicInstance = new UserLogic(userSQL, familySQL);
            const name = "name";
            const email = "email@gmail.com";
            const password = "password"
            const role = 1;
            const familyId = 0;
            const inviteToken = "invalid token"

            try {
                await userLogicInstance.createUserFromInvite(name, email, role, familyId, password, inviteToken);
                // Fail test if above expression doesn't throw anything.
                expect(true).toBe(false);
            } catch (e) {
                expect(e).toBeInstanceOf(InviteTokenError);
                expect(e.message).toBe("Invalid invite token");
            }
        });
    });

    describe("createUserFromInvite wrong family", () => {
        it("should throw token error", async () => {
            const encryptedPassword = "$2a$10$Pmo2cciLoefYNYnWE024ZOE8eHxyJMa/DGkSzRUNWm9yh7Oh3o54C";
            jest.spyOn(bcrypt, 'hash').mockImplementation((pass, salt) => encryptedPassword)
            const user = {
                id: 1,
                role: 1,
                email: "email@gmail.com",
                familyId: 0,
            }
            const userSQL = {
                create: jest.fn().mockResolvedValue(user),
            };
            const familySQL = {};
            const userLogicInstance = new UserLogic(userSQL, familySQL);
            const name = "name";
            const email = "email@gmail.com";
            const password = "password"
            const role = 1;
            const familyId = 1;
            const inviteToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjp7ImZhbWlseUlkIjoiMCIsInVzZXJJZCI6MSwidXNlclR5cGUiOiJhZG1pbmlzdHJhdG9yIn0sImlhdCI6MTY2MzM3MzI5Nn0.ebI5zDTODdFEpfphVtC1VcwnSW9LMimPCvTkY0D44e0"

            try {
                await userLogicInstance.createUserFromInvite(name, email, role, familyId, password, inviteToken);
                // Fail test if above expression doesn't throw anything.
                expect(true).toBe(false);
            } catch (e) {
                expect(e).toBeInstanceOf(InviteTokenError);
                expect(e.message).toBe("Invalid invite token");
            }
        });
    });
});