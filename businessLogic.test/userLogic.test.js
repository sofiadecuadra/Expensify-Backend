const UserLogic = require("../businessLogic/userLogic");
const bcrypt = require("bcryptjs");
const jwtSupplier = require("../library/jwtSupplier");
const InviteTokenError = require("../errors/auth/InviteTokenError");
const InputValidationError = require("../errors/inputValidationError");
const AuthError = require("../errors/auth/AuthError");
const sequelize = require("sequelize");
const DuplicateUserError = require("../errors/DuplicateUserError");
const ValidationError = require("../errors/ValidationError");
const HTTPRequestError = require("../errors/HttpRequestError");
const ForeignKeyError = require("../errors/ForeignKeyError");


describe("UserLogic", () => {
    describe("createUserFromInvite", () => {
        it("should create a user from invite", async () => {
            const encryptedPassword = "$2a$10$Pmo2cciLoefYNYnWE024ZOE8eHxyJMa/DGkSzRUNWm9yh7Oh3o54C";
            jest.spyOn(bcrypt, "hash").mockImplementation((pass, salt) => encryptedPassword);
            const inviteData = { data: { familyId: 0 } };
            jest.spyOn(jwtSupplier, "decryptKey").mockImplementation((token) => inviteData);
            jest.spyOn(jwtSupplier, "createKey").mockImplementation((token) => "key")
            const user = {
                id: 1,
                role: 1,
                email: "email@gmail.com",
                familyId: 0,
            };
            const userSQL = {
                create: jest.fn().mockResolvedValue(user),
            };
            const familySQL = {};
            const userLogicInstance = new UserLogic(userSQL, familySQL);
            const name = "name";
            const email = "email@gmail.com";
            const password = "password";
            const role = 1;
            const familyId = 0;
            const inviteToken =
                "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjp7ImZhbWlseUlkIjoiMCIsInVzZXJJZCI6MSwidXNlclR5cGUiOiJhZG1pbmlzdHJhdG9yIn0sImlhdCI6MTY2MzM3MzI5Nn0.ebI5zDTODdFEpfphVtC1VcwnSW9LMimPCvTkY0D44e0";

            const response = await userLogicInstance.createUserFromInvite(
                name,
                email,
                role,
                familyId,
                password,
                inviteToken
            );

            expect(userSQL.create).toHaveBeenCalledWith({
                name,
                email,
                role,
                familyId: familyId,
                password: encryptedPassword,
            });
            const data = { userId: user.id, role: user.role, email: user.email, familyId: user.familyId };
            const expectedToken = jwtSupplier.createKey(data);
            expect(response.token).toEqual(expectedToken);
            expect(response.actualRole).toEqual(role);
            expect(response.expirationDate).toBeInstanceOf(Date);
        });
    });

    describe("createUserFromInvite invalid token", () => {
        it("should throw token error", async () => {
            const encryptedPassword = "$2a$10$Pmo2cciLoefYNYnWE024ZOE8eHxyJMa/DGkSzRUNWm9yh7Oh3o54C";
            jest.spyOn(bcrypt, "hash").mockImplementation((pass, salt) => encryptedPassword);
            const inviteData = { data: { familyId: 0 } };
            jest.spyOn(jwtSupplier, "decryptKey").mockImplementation((token) => { throw new InviteTokenError() });
            jest.spyOn(jwtSupplier, "createKey").mockImplementation((token) => "key")
            const user = {
                id: 1,
                role: 1,
                email: "email@gmail.com",
                familyId: 0,
            };
            const userSQL = {
                create: jest.fn().mockResolvedValue(user),
            };
            const familySQL = {};
            const userLogicInstance = new UserLogic(userSQL, familySQL);
            const name = "name";
            const email = "email@gmail.com";
            const password = "password";
            const role = 1;
            const familyId = 0;
            const inviteToken = "invalid token";

            try {
                await userLogicInstance.createUserFromInvite(name, email, role, familyId, password, inviteToken);
                // Fail test if above expression doesn't throw anything.
                expect(true).toBe(false);
            } catch (e) {
                expect(e).toBeInstanceOf(InviteTokenError);
                expect(e.message).toBe("Invalid invite token");
                expect(e.body()).toEqual({
                    errorType: `INVITE_TOKEN_ERROR`,
                    message: "Invalid invite token",
                });
            }
        });
    });

    describe("createUserFromInvite wrong family", () => {
        it("should throw token error", async () => {
            const encryptedPassword = "$2a$10$Pmo2cciLoefYNYnWE024ZOE8eHxyJMa/DGkSzRUNWm9yh7Oh3o54C";
            jest.spyOn(bcrypt, "hash").mockImplementation((pass, salt) => encryptedPassword);
            const inviteData = { data: { familyId: 0 } };
            jest.spyOn(jwtSupplier, "decryptKey").mockImplementation((token) => inviteData);
            jest.spyOn(jwtSupplier, "createKey").mockImplementation((token) => "key")
            const user = {
                id: 1,
                role: 1,
                email: "email@gmail.com",
                familyId: 0,
            };
            const userSQL = {
                create: jest.fn().mockResolvedValue(user),
            };
            const familySQL = {};
            const userLogicInstance = new UserLogic(userSQL, familySQL);
            const name = "name";
            const email = "email@gmail.com";
            const password = "password";
            const role = 1;
            const familyId = 1;
            const inviteToken =
                "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjp7ImZhbWlseUlkIjoiMCIsInVzZXJJZCI6MSwidXNlclR5cGUiOiJhZG1pbmlzdHJhdG9yIn0sImlhdCI6MTY2MzM3MzI5Nn0.ebI5zDTODdFEpfphVtC1VcwnSW9LMimPCvTkY0D44e0";

            try {
                await userLogicInstance.createUserFromInvite(name, email, role, familyId, password, inviteToken);
                // Fail test if above expression doesn't throw anything.
                expect(true).toBe(false);
            } catch (e) {
                expect(e).toBeInstanceOf(InviteTokenError);
                expect(e.message).toBe("Invalid invite token");
                expect(e.body()).toEqual({
                    errorType: `INVITE_TOKEN_ERROR`,
                    message: "Invalid invite token",
                });
                const newInstance = new AuthError("message");
                expect(newInstance.body()).toEqual({
                    errorType: `AUTH_ERROR`,
                    message: 'message',
                });
            }
        });
    });

    describe("createUserFromInvite invalid name", () => {
        it("should throw invalid name error", async () => {
            const encryptedPassword = "$2a$10$Pmo2cciLoefYNYnWE024ZOE8eHxyJMa/DGkSzRUNWm9yh7Oh3o54C";
            jest.spyOn(bcrypt, "hash").mockImplementation((pass, salt) => encryptedPassword);
            const inviteData = { data: { familyId: 0 } };
            jest.spyOn(jwtSupplier, "decryptKey").mockImplementation((token) => inviteData);
            jest.spyOn(jwtSupplier, "createKey").mockImplementation((token) => "key")
            const user = {
                id: 1,
                role: 1,
                email: "email@gmail.com",
                familyId: 0,
            };
            const userSQL = {
                create: jest.fn().mockResolvedValue(user),
            };
            const familySQL = {};
            const userLogicInstance = new UserLogic(userSQL, familySQL);
            const name = "";
            const email = "email@gmail.com";
            const password = "password";
            const role = 1;
            const familyId = 0;
            const inviteToken =
                "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjp7ImZhbWlseUlkIjoiMCIsInVzZXJJZCI6MSwidXNlclR5cGUiOiJhZG1pbmlzdHJhdG9yIn0sImlhdCI6MTY2MzM3MzI5Nn0.ebI5zDTODdFEpfphVtC1VcwnSW9LMimPCvTkY0D44e0";

            try {
                await userLogicInstance.createUserFromInvite(name, email, role, familyId, password, inviteToken);
                // Fail test if above expression doesn't throw anything.
                expect(true).toBe(false);
            } catch (e) {
                expect(e).toBeInstanceOf(InputValidationError);
                expect(e.message).toBe(
                    "Please enter a non-empty name containing only letters, numbers or spaces with maximum length of 20!"
                );
                expect(e.body()).toEqual({
                    errorType: `INPUT_VALIDATION_ERROR`,
                    message:
                        "Please enter a non-empty name containing only letters, numbers or spaces with maximum length of 20!",
                });
            }
        });
    });

    describe("createUserFromInvite invalid email", () => {
        it("should throw invalid email error", async () => {
            const encryptedPassword = "$2a$10$Pmo2cciLoefYNYnWE024ZOE8eHxyJMa/DGkSzRUNWm9yh7Oh3o54C";
            jest.spyOn(bcrypt, "hash").mockImplementation((pass, salt) => encryptedPassword);
            const inviteData = { data: { familyId: 0 } };
            jest.spyOn(jwtSupplier, "decryptKey").mockImplementation((token) => inviteData);
            jest.spyOn(jwtSupplier, "createKey").mockImplementation((token) => "key")
            const user = {
                id: 1,
                role: 1,
                email: "email@gmail.com",
                familyId: 0,
            };
            const userSQL = {
                create: jest.fn().mockResolvedValue(user),
            };
            const familySQL = {};
            const userLogicInstance = new UserLogic(userSQL, familySQL);
            const name = "name";
            const email = "invalidEmail";
            const password = "password";
            const role = 1;
            const familyId = 0;
            const inviteToken =
                "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjp7ImZhbWlseUlkIjoiMCIsInVzZXJJZCI6MSwidXNlclR5cGUiOiJhZG1pbmlzdHJhdG9yIn0sImlhdCI6MTY2MzM3MzI5Nn0.ebI5zDTODdFEpfphVtC1VcwnSW9LMimPCvTkY0D44e0";

            try {
                await userLogicInstance.createUserFromInvite(name, email, role, familyId, password, inviteToken);
                // Fail test if above expression doesn't throw anything.
                expect(true).toBe(false);
            } catch (e) {
                expect(e).toBeInstanceOf(InputValidationError);
                expect(e.message).toBe(
                    "Please enter a valid email!"
                );
                expect(e.body()).toEqual({
                    errorType: `INPUT_VALIDATION_ERROR`,
                    message:
                        "Please enter a valid email!",
                });
            }
        });
    });

    describe("createUserFromInvite invalid password", () => {
        it("should throw invalid password error", async () => {
            const encryptedPassword = "$2a$10$Pmo2cciLoefYNYnWE024ZOE8eHxyJMa/DGkSzRUNWm9yh7Oh3o54C";
            jest.spyOn(bcrypt, "hash").mockImplementation((pass, salt) => encryptedPassword);
            const inviteData = { data: { familyId: 0 } };
            jest.spyOn(jwtSupplier, "decryptKey").mockImplementation((token) => inviteData);
            jest.spyOn(jwtSupplier, "createKey").mockImplementation((token) => "key")
            const user = {
                id: 1,
                role: 1,
                email: "email@gmail.com",
                familyId: 0,
            };
            const userSQL = {
                create: jest.fn().mockResolvedValue(user),
            };
            const familySQL = {};
            const userLogicInstance = new UserLogic(userSQL, familySQL);
            const name = "name";
            const email = "email@gmail.com";
            const password = "";
            const role = 1;
            const familyId = 0;
            const inviteToken =
                "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjp7ImZhbWlseUlkIjoiMCIsInVzZXJJZCI6MSwidXNlclR5cGUiOiJhZG1pbmlzdHJhdG9yIn0sImlhdCI6MTY2MzM3MzI5Nn0.ebI5zDTODdFEpfphVtC1VcwnSW9LMimPCvTkY0D44e0";

            try {
                await userLogicInstance.createUserFromInvite(name, email, role, familyId, password, inviteToken);
                // Fail test if above expression doesn't throw anything.
                expect(true).toBe(false);
            } catch (e) {
                const foreignKeyError = new ForeignKeyError("1");
                expect(e).toBeInstanceOf(InputValidationError);
                expect(e.message).toBe(
                    "Please enter a password between 4 and 64 characters (letters, numbers or symbols)!"
                );
                expect(e.body()).toEqual({
                    errorType: `INPUT_VALIDATION_ERROR`,
                    message:
                        "Please enter a password between 4 and 64 characters (letters, numbers or symbols)!",
                });
                expect(foreignKeyError.body()).toEqual({
                    errorType: `FOREIGN_KEY_ERROR`,
                    message:
                        "The category with id '1' was not found. Please try again.",
                });
            }
        });
    });

    describe("createUserFromInvite duplicate user email", () => {
        it("should throw an error accordingly", async () => {
            const encryptedPassword = "$2a$10$Pmo2cciLoefYNYnWE024ZOE8eHxyJMa/DGkSzRUNWm9yh7Oh3o54C";
            jest.spyOn(bcrypt, "hash").mockImplementation((pass, salt) => encryptedPassword);
            const inviteData = { data: { familyId: 0 } };
            jest.spyOn(jwtSupplier, "decryptKey").mockImplementation((token) => inviteData);
            jest.spyOn(jwtSupplier, "createKey").mockImplementation((token) => "key")
            const user = {
                id: 1,
                role: 1,
                email: "email@gmail.com",
                familyId: 0,
            };
            const userSQL = {
                create: jest.fn().mockImplementation(() => {
                    throw new sequelize.UniqueConstraintError();
                }),
            };
            const familySQL = {};
            const userLogicInstance = new UserLogic(userSQL, familySQL);
            const name = "name";
            const email = "email@gmail.com";
            const password = "password";
            const role = 1;
            const familyId = 0;
            const inviteToken =
                "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjp7ImZhbWlseUlkIjoiMCIsInVzZXJJZCI6MSwidXNlclR5cGUiOiJhZG1pbmlzdHJhdG9yIn0sImlhdCI6MTY2MzM3MzI5Nn0.ebI5zDTODdFEpfphVtC1VcwnSW9LMimPCvTkY0D44e0";

            try {
                await userLogicInstance.createUserFromInvite(name, email, role, familyId, password, inviteToken);
                // Fail test if above expression doesn't throw anything.
                expect(true).toBe(false);
            } catch (e) {
                const httpRequestError = new HTTPRequestError("Duplicate user email");
                expect(e).toBeInstanceOf(DuplicateUserError);
                expect(e.message).toBe(
                    "The email 'email@gmail.com' is already in use. Please try again."
                );
                expect(e.body()).toEqual({
                    errorType: `DUPLICATE_USER_ERROR`,
                    message:
                        "The email 'email@gmail.com' is already in use. Please try again.",
                });
                expect(httpRequestError.body()).toEqual({
                    errorType: `HTTP_REQUEST_ERROR`,
                    message:
                        "Duplicate user email",
                });
            }
        });
    });

    describe("createUserFromInvite validationError", () => {
        it("should throw an error accordingly", async () => {
            const encryptedPassword = "$2a$10$Pmo2cciLoefYNYnWE024ZOE8eHxyJMa/DGkSzRUNWm9yh7Oh3o54C";
            jest.spyOn(bcrypt, "hash").mockImplementation((pass, salt) => encryptedPassword);
            const inviteData = { data: { familyId: 0 } };
            jest.spyOn(jwtSupplier, "decryptKey").mockImplementation((token) => inviteData);
            jest.spyOn(jwtSupplier, "createKey").mockImplementation((token) => "key")
            const user = {
                id: 1,
                role: 1,
                email: "email@gmail.com",
                familyId: 0,
            };
            const userSQL = {
                create: jest.fn().mockImplementation(() => {
                    throw new sequelize.ValidationError("Validation error message", ['undefined', 'undefned']);
                }),
            };
            const newError = new ValidationError([])
            const familySQL = {};
            const userLogicInstance = new UserLogic(userSQL, familySQL);
            const name = "name";
            const email = "email@gmail.com";
            const password = "password";
            const role = 1;
            const familyId = 0;
            const inviteToken =
                "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjp7ImZhbWlseUlkIjoiMCIsInVzZXJJZCI6MSwidXNlclR5cGUiOiJhZG1pbmlzdHJhdG9yIn0sImlhdCI6MTY2MzM3MzI5Nn0.ebI5zDTODdFEpfphVtC1VcwnSW9LMimPCvTkY0D44e0";

            try {
                await userLogicInstance.createUserFromInvite(name, email, role, familyId, password, inviteToken);
                // Fail test if above expression doesn't throw anything.
                expect(true).toBe(false);
            } catch (e) {
                expect(e).toBeInstanceOf(ValidationError);
                expect(e.message).toBe(
                    "Missing fields: undefined, undefined. Please fill all and try again."
                );
                expect(e.body()).toEqual({
                    errorType: `VALIDATION_ERROR`,
                    message:
                        "Missing fields: undefined, undefined. Please fill all and try again.",
                });
            }
        });
    });
});
