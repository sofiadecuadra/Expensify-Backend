const { default: Expo } = require("expo-server-sdk");
const { fn } = require("sequelize");
const sequelize = require("sequelize");
const ExpenseLogic = require("../businessLogic/expenseLogic");
const ForeignKeyError = require("../errors/ForeignKeyError");
const ValidationError = require("../errors/ValidationError");
const imageUploader = require("../library/imageUploader");
const parseDate = require("../utilities/dateUtils");

describe("Create new expense", () => {
    test("Should create new expense", async () => {
        let receivedImageFile = undefined;
        let receivedImageKey = undefined;
        jest.spyOn(imageUploader, "uploadImage").mockImplementation((imageFile, imageKey) => {
            receivedImageFile = imageFile;
            receivedImageKey = imageKey;
        });
        const userId = 1;
        const amount = 100;
        const producedDate = new Date().toISOString();
        const categoryId = 1;
        const description = "Test description";
        const imageFile = "Test image file";
        const originalName = "Test original name";
        const newExpense = {
            id: 1,
            amount,
            producedDate,
            description,
            imageKey: "Test original name",
        };
        const expenseSQL = {
            create: jest.fn().mockResolvedValue(newExpense),
            sequelize: {
                query: jest.fn().mockResolvedValue([[{ id: 1 }]]),
            },
        };
        const categorySQL = {
            getCategoryById: jest.fn(),
        };
        const userSQL = {
            getUserById: jest.fn(),
        };
        const familySQL = {};
        let transactionFun = undefined;
        const expenseConnection = {
            transaction: jest.fn().mockImplementation((fun) => {
                transactionFun = fun;
                return newExpense;
            }),
        };
        const expenseLogic = new ExpenseLogic(expenseSQL, categorySQL, userSQL, familySQL, expenseConnection);

        await expenseLogic.createExpense(amount, producedDate, categoryId, userId, description, imageFile, originalName);
        await transactionFun();
        expect(receivedImageFile).toBe(imageFile);
        expect(receivedImageKey.includes("Test original name")).toBe(true);
        const imageLink = "https://undefined.s3.amazonaws.com/" + receivedImageKey;
        expect(expenseSQL.create).toHaveBeenCalledWith(
            expect.objectContaining({
                amount,
                producedDate: new Date(producedDate),
                categoryId,
                userId,
                description,
                image: imageLink,
            }),
            { transaction: undefined }
        );
    });

    test("Should throw error if category not found", async () => {
        const userId = 1;
        const amount = 100;
        const producedDate = new Date().toISOString();
        const categoryId = 1;
        const description = "Test description";
        const imageFile = "Test image file";
        const originalName = "Test original name";
        const expenseSQL = {
            create: jest.fn(),
            sequelize: {
                query: jest.fn().mockResolvedValue([]),
            },
        };
        const categorySQL = {
            getCategoryById: jest.fn(),
        };
        const userSQL = {
            getUserById: jest.fn(),
        };
        const familySQL = {};
        const expenseConnection = {
            transaction: jest.fn(),
        };
        const expenseLogic = new ExpenseLogic(expenseSQL, categorySQL, userSQL, familySQL, expenseConnection);

        try {
            await expenseLogic.createExpense(amount, producedDate, categoryId, userId, description, imageFile, originalName);
        } catch (err) {
            expect(err.message).toBe("Category not found");
        }
    });

    test("Should throw error if user not found", async () => {
        const userId = 1;
        const amount = 100;
        const producedDate = new Date().toISOString();
        const categoryId = 1;
        const description = "Test description";
        const imageFile = "Test image file";
        const originalName = "Test original name";
        const expenseSQL = {
            create: jest.fn(),
            sequelize: {
                query: jest.fn().mockResolvedValue([[{ id: 1 }]]),
            },
        };
        const categorySQL = {
            getCategoryById: jest.fn(),
        };
        const userSQL = {
            getUserById: jest.fn().mockResolvedValue([]),
        };
        const familySQL = {};
        const expenseConnection = {
            transaction: jest.fn(),
        };
        const expenseLogic = new ExpenseLogic(expenseSQL, categorySQL, userSQL, familySQL, expenseConnection);

        try {
            await expenseLogic.createExpense(amount, producedDate, categoryId, userId, description, imageFile, originalName);
        } catch (err) {
            expect(err.message).toBe("User not found");
        }
    });

    test("Should throw error if user not in family", async () => {
        const userId = 1;
        const amount = 100;
        const producedDate = new Date().toISOString();
        const categoryId = 1;
        const description = "Test description";
        const imageFile = "Test image file";
        const originalName = "Test original name";
        const expenseSQL = {
            create: jest.fn(),
            sequelize: {
                query: jest.fn().mockResolvedValue([[{ id: 1 }]]),
            },
        };
        const categorySQL = {
            getCategoryById: jest.fn(),
        };
        const userSQL = {
            getUserById: jest.fn().mockResolvedValue([{}]),
        };
        const familySQL = {
            getFamilyByUserId: jest.fn().mockResolvedValue([]),
        };
        const expenseConnection = {
            transaction: jest.fn(),
        };
        const expenseLogic = new ExpenseLogic(expenseSQL, categorySQL, userSQL, familySQL, expenseConnection);

        try {
            await expenseLogic.createExpense(amount, producedDate, categoryId, userId, description, imageFile, originalName);
        } catch (err) {
            expect(err.message).toBe("User not in family");
        }
    });

    test("Should throw ValidationError", async () => {
        const userId = 1;
        const amount = 100;
        const producedDate = new Date().toISOString();
        const categoryId = 1;
        const description = "Test description";
        const imageFile = "Test image file";
        const originalName = "Test original name";
        const expenseSQL = {
            create: jest.fn().mockImplementation(() => {
                throw new sequelize.ValidationError("Validation error message", ["undefined", "undefned"]);
            }),
            sequelize: {
                query: jest.fn().mockResolvedValue([[{ id: 1 }]]),
            },
        };
        const categorySQL = {
            getCategoryById: jest.fn(),
        };
        const userSQL = {
            getUserById: jest.fn().mockResolvedValue([{}]),
        };
        const familySQL = {
            getFamilyByUserId: jest.fn().mockResolvedValue([{}]),
        };
        const expenseConnection = {
            transaction: jest.fn().mockImplementation((fun) => fun()),
        };
        const expenseLogic = new ExpenseLogic(expenseSQL, categorySQL, userSQL, familySQL, expenseConnection);

        try {
            await expenseLogic.createExpense(amount, producedDate, categoryId, userId, description, imageFile, originalName);
        } catch (err) {
            expect(err).toBeInstanceOf(ValidationError);
            expect(err.message).toBe("Missing fields: undefined, undefined. Please fill all and try again.");
            expect(err.body()).toEqual({
                errorType: `VALIDATION_ERROR`,
                message: "Missing fields: undefined, undefined. Please fill all and try again.",
            });
        }
    });

    test("Should throw ForeignKeyError", async () => {
        const userId = 1;
        const amount = 100;
        const producedDate = new Date().toISOString();
        const categoryId = 1;
        const description = "Test description";
        const imageFile = "Test image file";
        const originalName = "Test original name";
        const expenseSQL = {
            create: jest.fn().mockImplementation(() => {
                throw new sequelize.ForeignKeyConstraintError();
            }),
            sequelize: {
                query: jest.fn().mockResolvedValue([[{ id: 1 }]]),
            },
        };
        const categorySQL = {
            getCategoryById: jest.fn(),
        };
        const userSQL = {
            getUserById: jest.fn().mockResolvedValue([{}]),
        };
        const familySQL = {
            getFamilyByUserId: jest.fn().mockResolvedValue([{}]),
        };
        const expenseConnection = {
            transaction: jest.fn().mockImplementation((fun) => fun()),
        };
        const expenseLogic = new ExpenseLogic(expenseSQL, categorySQL, userSQL, familySQL, expenseConnection);

        try {
            await expenseLogic.createExpense(amount, producedDate, categoryId, userId, description, imageFile, originalName);
        } catch (err) {
            expect(err).toBeInstanceOf(ForeignKeyError);
            expect(err.message).toBe("The category with id '1' was not found. Please try again.");
            expect(err.body()).toEqual({
                errorType: `FOREIGN_KEY_ERROR`,
                message: "The category with id '1' was not found. Please try again.",
            });
        }
    });

    test("Should throw error if error not ValidationError", async () => {
        const userId = 1;
        const amount = 100;
        const producedDate = new Date().toISOString();
        const categoryId = 1;
        const description = "Test description";
        const imageFile = "Test image file";
        const originalName = "Test original name";
        const expenseSQL = {
            create: jest.fn().mockImplementation(() => {
                throw new Error("Error message");
            }),
            sequelize: {
                query: jest.fn().mockResolvedValue([[{ id: 1 }]]),
            },
        };
        const categorySQL = {
            getCategoryById: jest.fn(),
        };
        const userSQL = {
            getUserById: jest.fn().mockResolvedValue([{}]),
        };
        const familySQL = {
            getFamilyByUserId: jest.fn().mockResolvedValue([{}]),
        };
        const expenseConnection = {
            transaction: jest.fn().mockImplementation((fun) => fun()),
        };
        const expenseLogic = new ExpenseLogic(expenseSQL, categorySQL, userSQL, familySQL, expenseConnection);

        try {
            await expenseLogic.createExpense(amount, producedDate, categoryId, userId, description, imageFile, originalName);
        } catch (err) {
            expect(err.message).toBe("Error message");
        }
    });
});

describe("Delete expense", () => {
    test("Should delete expense", async () => {
        const expenseId = 1;
        const userId = 1;
        const familyId = 1;
        const expenseSQL = {
            destroy: jest.fn(),
            findOne: jest.fn().mockResolvedValue({}),
        };
        const categorySQL = {};
        const userSQL = {};
        const familySQL = {};
        const expenseConnection = {
            transaction: jest.fn().mockImplementation((fun) => fun()),
        };
        const expenseLogic = new ExpenseLogic(expenseSQL, categorySQL, userSQL, familySQL, expenseConnection);

        await expenseLogic.deleteExpense(userId, expenseId, familyId);

        expect(expenseSQL.destroy).toBeCalledWith({
            where: {
                id: expenseId,
            },
        });
    });

    test("Should throw error if expense not found", async () => {
        const expenseId = 1;
        const userId = 1;
        const familyId = 1;
        const expenseSQL = {
            destroy: jest.fn(),
            findOne: jest.fn().mockResolvedValue(null),
        };
        const categorySQL = {};
        const userSQL = {};
        const familySQL = {};
        const expenseConnection = {
            transaction: jest.fn().mockImplementation((fun) => fun()),
        };
        const expenseLogic = new ExpenseLogic(expenseSQL, categorySQL, userSQL, familySQL, expenseConnection);

        await expenseLogic.deleteExpense(userId, expenseId, familyId);
        expect(expenseSQL.destroy).not.toBeCalled();
    });
});

describe("Upadate expense", () => {
    test("Should update expense with image", async () => {
        jest.spyOn(imageUploader, "uploadImage").mockImplementation((imageFile, imageKey) => {
            receivedImageFile = imageFile;
            receivedImageKey = imageKey;
            return "Test image url";
        });
        const expenseId = 1;
        const userId = 1;
        const familyId = 1;
        const amount = 100;
        const producedDate = new Date().toISOString();
        const categoryId = 1;
        const description = "Test description";
        const imageFile = "Test image file";
        const originalName = "Test original name";
        const expenseSQL = {
            update: jest.fn(),
            findOne: jest.fn().mockResolvedValue({
                dataValues: {
                    image: "Test image",
                    amount: 100,
                    producedDate,
                    categoryId: 1,
                },
            }),
        };
        const categorySQL = {};
        const userSQL = {};
        const familySQL = {};
        const expenseConnection = {
            transaction: jest.fn().mockImplementation((fun) => fun()),
        };
        const expenseLogic = new ExpenseLogic(expenseSQL, categorySQL, userSQL, familySQL, expenseConnection);

        await expenseLogic.updateExpense(
            userId,
            amount,
            producedDate,
            categoryId,
            expenseId,
            familyId,
            description,
            imageFile,
            originalName,
            false
        );

        expect(expenseSQL.update).toBeCalledWith(
            {
                amount,
                producedDate: new Date(producedDate),
                categoryId,
                description,
                image: "Test image url",
            },
            {
                where: {
                    id: expenseId,
                },
            }
        );
    });

    test("Should update expense without image", async () => {
        const expenseId = 1;
        const userId = 1;
        const familyId = 1;
        const amount = 100;
        const producedDate = new Date().toISOString();
        const categoryId = 1;
        const description = "Test description";
        const expenseSQL = {
            update: jest.fn(),
            findOne: jest.fn().mockResolvedValue({
                dataValues: {
                    image: "Test image",
                    amount: 100,
                    producedDate,
                    categoryId: 1,
                },
            }),
        };
        const categorySQL = {};
        const userSQL = {};
        const familySQL = {};
        const expenseConnection = {
            transaction: jest.fn().mockImplementation((fun) => fun()),
        };
        const expenseLogic = new ExpenseLogic(expenseSQL, categorySQL, userSQL, familySQL, expenseConnection);

        await expenseLogic.updateExpense(userId, amount, producedDate, categoryId, expenseId, familyId, description, null, null, true);

        expect(expenseSQL.update).toBeCalledWith(
            {
                amount,
                producedDate: new Date(producedDate),
                categoryId,
                description,
                image: undefined,
            },
            {
                where: {
                    id: expenseId,
                },
            }
        );
    });

    test("Should throw error if expense not found", async () => {
        const expenseId = 1;
        const userId = 1;
        const familyId = 1;
        const amount = 100;
        const producedDate = new Date().toISOString();
        const categoryId = 1;
        const description = "Test description";
        const expenseSQL = {
            update: jest.fn(),
            findOne: jest.fn().mockResolvedValue(null),
        };
        const categorySQL = {};
        const userSQL = {};
        const familySQL = {};
        const expenseConnection = {
            transaction: jest.fn().mockImplementation((fun) => fun()),
        };
        const expenseLogic = new ExpenseLogic(expenseSQL, categorySQL, userSQL, familySQL, expenseConnection);

        try {
            await expenseLogic.updateExpense(userId, amount, producedDate, categoryId, expenseId, familyId, description, null, null, true);
        } catch (err) {
            expect(err).toBeInstanceOf(ForeignKeyError);
            expect(err.message).toBe("The expense with id '1' was not found. Please try again.");
            expect(err.body()).toEqual({
                errorType: `FOREIGN_KEY_ERROR`,
                message: "The expense with id '1' was not found. Please try again.",
            });
        } finally {
            expect(expenseSQL.update).not.toBeCalled();
        }
    });

    test("Should throw ForeignKeyError", async () => {
        const expenseId = 1;
        const userId = 1;
        const familyId = 1;
        const amount = 100;
        const producedDate = new Date().toISOString();
        const categoryId = 1;
        const description = "Test description";
        const expenseSQL = {
            update: jest.fn().mockImplementation(() => {
                throw new sequelize.ForeignKeyConstraintError();
            }),
            findOne: jest.fn().mockResolvedValue({
                dataValues: {
                    image: "Test image",
                    amount: 100,
                    producedDate,
                    categoryId: 1,
                },
            }),
        };
        const categorySQL = {};
        const userSQL = {};
        const familySQL = {};
        const expenseConnection = {
            transaction: jest.fn().mockImplementation((fun) => fun()),
        };
        const expenseLogic = new ExpenseLogic(expenseSQL, categorySQL, userSQL, familySQL, expenseConnection);

        try {
            await expenseLogic.updateExpense(userId, amount, producedDate, categoryId, expenseId, familyId, description, null, null, true);
        } catch (err) {
            expect(err).toBeInstanceOf(ForeignKeyError);
            expect(err.message).toBe("The category with id '1' was not found. Please try again.");
            expect(err.body()).toEqual({
                errorType: `FOREIGN_KEY_ERROR`,
                message: "The category with id '1' was not found. Please try again.",
            });
        } finally {
            expect(expenseSQL.update).toBeCalled();
        }
    });

    test("Should throw ValidationError", async () => {
        const expenseId = 1;
        const userId = 1;
        const familyId = 1;
        const amount = 100;
        const producedDate = new Date().toISOString();
        const categoryId = 1;
        const description = "Test description";
        const expenseSQL = {
            update: jest.fn().mockImplementation(() => {
                throw new sequelize.ValidationError();
            }),
            findOne: jest.fn().mockResolvedValue({
                dataValues: {
                    image: "Test image",
                    amount: 100,
                    producedDate,
                    categoryId: 1,
                },
            }),
        };
        const categorySQL = {};
        const userSQL = {};
        const familySQL = {};
        const expenseConnection = {
            transaction: jest.fn().mockImplementation((fun) => fun()),
        };
        const expenseLogic = new ExpenseLogic(expenseSQL, categorySQL, userSQL, familySQL, expenseConnection);

        try {
            await expenseLogic.updateExpense(userId, amount, producedDate, categoryId, expenseId, familyId, description, null, null, true);
        } catch (err) {
            expect(err).toBeInstanceOf(ValidationError);
            expect(err.message).toBe("Missing fields: . Please fill all and try again.");
            expect(err.body()).toEqual({
                errorType: `VALIDATION_ERROR`,
                message: "Missing fields: . Please fill all and try again.",
            });
        } finally {
            expect(expenseSQL.update).toBeCalled();
        }
    });
});

describe("Get expenses", () => {
    it("Should get expenses", async () => {
        const familyId = 1;
        const startDate = new Date().toISOString();
        const endDate = new Date().toISOString();
        const page = 1;
        const pageSize = 50;
        const producedDate = new Date().toISOString();
        const registeredDate = new Date().toISOString();
        const expenseSQL = {
            findAll: jest.fn().mockResolvedValue([
                {
                    dataValues: {
                        amount: 100,
                        id: 1,
                        producedDate,
                        image: "Test image",
                        registeredDate,
                        description: "Test description",
                        category: {
                            name: "Test category",
                            image: "Test category image",
                            description: "Test category description",
                            id: 1,
                        },
                        user: {
                            name: "Test user",
                        },
                    },
                },
            ]),
        };
        const categorySQL = {};
        const userSQL = {};
        const familySQL = {};
        const expenseConnection = {};
        const expenseLogic = new ExpenseLogic(expenseSQL, categorySQL, userSQL, familySQL, expenseConnection);

        const result = await expenseLogic.getExpenses(familyId, startDate, endDate, page, pageSize);

        expect(result).toEqual([
            {
                dataValues: {
                    amount: 100,
                    id: 1,
                    producedDate,
                    image: "Test image",
                    registeredDate,
                    description: "Test description",
                    category: {
                        name: "Test category",
                        image: "Test category image",
                        description: "Test category description",
                        id: 1,
                    },
                    user: {
                        name: "Test user",
                    },
                },
            },
        ]);
        expect(expenseSQL.findAll).toBeCalledWith({
            attributes: ["amount", "id", "producedDate", "image", "registeredDate", "description"],
            limit: 50,
            offset: 50,
            where: {
                producedDate: {
                    [sequelize.Op.between]: [parseDate(startDate), parseDate(endDate)],
                },
            },
            order: [["producedDate", "ASC"]],
            include: [
                {
                    model: categorySQL,
                    attributes: ["name", "image", "description", "id"],
                },
                {
                    model: userSQL,
                    attributes: ["name"],
                    where: {
                        familyId: familyId,
                    },
                },
            ],
        });
    });

    it("Should get expenses without dates", async () => {
        const familyId = 1;
        const startDate = null;
        const endDate = null;
        const page = 1;
        const pageSize = 50;
        const producedDate = new Date().toISOString();
        const registeredDate = new Date().toISOString();
        const expenseSQL = {
            findAll: jest.fn().mockResolvedValue([
                {
                    dataValues: {
                        amount: 100,
                        id: 1,
                        producedDate,
                        image: "Test image",
                        registeredDate,
                        description: "Test description",
                        category: {
                            name: "Test category",
                            image: "Test category image",
                            description: "Test category description",
                            id: 1,
                        },
                        user: {
                            name: "Test user",
                        },
                    },
                },
            ]),
        };
        const categorySQL = {};
        const userSQL = {};
        const familySQL = {};
        const expenseConnection = {};
        const expenseLogic = new ExpenseLogic(expenseSQL, categorySQL, userSQL, familySQL, expenseConnection);

        const result = await expenseLogic.getExpenses(familyId, startDate, endDate, page, pageSize);

        expect(result).toEqual([
            {
                dataValues: {
                    amount: 100,
                    id: 1,
                    producedDate,
                    image: "Test image",
                    registeredDate,
                    description: "Test description",
                    category: {
                        name: "Test category",
                        image: "Test category image",
                        description: "Test category description",
                        id: 1,
                    },
                    user: {
                        name: "Test user",
                    },
                },
            },
        ]);
        expect(expenseSQL.findAll).toBeCalledWith({
            attributes: ["amount", "id", "producedDate", "image", "registeredDate"],
            limit: 50,
            offset: 50,
            order: [["producedDate", "ASC"]],
            include: [
                {
                    model: categorySQL,
                    attributes: ["name", "image", "description", "id"],
                },
                {
                    model: userSQL,
                    attributes: ["name"],
                    where: {
                        familyId: familyId,
                    },
                },
            ],
        });
    });
});

describe("Get expenses count", () => {
    it("Should get expenses count", async () => {
        const familyId = 1;
        const startDate = new Date().toISOString();
        const endDate = new Date().toISOString();
        const expenseSQL = {
            count: jest.fn().mockResolvedValue(1),
        };

        const categorySQL = {};
        const userSQL = {};
        const familySQL = {};
        const expenseConnection = {};
        const expenseLogic = new ExpenseLogic(expenseSQL, categorySQL, userSQL, familySQL, expenseConnection);

        const result = await expenseLogic.getExpensesCount(familyId, startDate, endDate);

        expect(result).toStrictEqual({ total: 1 });
        expect(expenseSQL.count).toBeCalledWith({
            where: {
                producedDate: {
                    [sequelize.Op.between]: [parseDate(startDate), parseDate(endDate)],
                },
            },
            include: [
                {
                    model: userSQL,
                    where: {
                        familyId: familyId,
                    },
                },
            ],
        });
    });

    it("Should get expenses count without dates", async () => {
        const familyId = 1;
        const startDate = new Date().toISOString();
        const endDate = new Date().toISOString();
        const expenseSQL = {
            count: jest.fn().mockResolvedValue(3),
        };

        const categorySQL = {};
        const userSQL = {};
        const familySQL = {};
        const expenseConnection = {};
        const expenseLogic = new ExpenseLogic(expenseSQL, categorySQL, userSQL, familySQL, expenseConnection);

        const result = await expenseLogic.getExpensesCount(familyId);

        expect(result).toStrictEqual({ total: 3 });
        expect(expenseSQL.count).toBeCalled();
    });
});

describe("Get expenses by month", () => {
    it("Should get expenses by week", async () => {
        const familyId = 1;
        const fromDate = new Date().toISOString();
        const toDate = new Date().toISOString();
        const expenseSQL = {
            findAll: jest.fn().mockResolvedValue([
                {
                    dataValues: {
                        amount: 100,
                        date: 1,
                    },
                },
            ]),
        };
        const categorySQL = {};
        const userSQL = {};
        const familySQL = {};
        const expenseConnection = {};
        const expenseLogic = new ExpenseLogic(expenseSQL, categorySQL, userSQL, familySQL, expenseConnection);

        const result = await expenseLogic.getExpensesByMonth(familyId, fromDate, toDate);

        expect(result).toEqual([
            {
                amount: 100,
                week: 1,
            },
        ]);
        expect(expenseSQL.findAll).toBeCalledWith({
            attributes: [
                [sequelize.fn("sum", sequelize.col("amount")), "amount"],
                [sequelize.fn("WEEK", sequelize.col("producedDate")), "date"],
            ],
            where: {
                producedDate: {
                    [sequelize.Op.between]: [parseDate(fromDate), parseDate(toDate)],
                },
            },
            group: [sequelize.fn("WEEK", sequelize.col("producedDate"))],
            include: [
                {
                    model: userSQL,
                    attributes: [],
                    where: {
                        familyId: familyId,
                    },
                },
            ],
        });
    });

    it("Should get expenses by month", async () => {
        const familyId = 1;
        let fromDate = new Date().toISOString();
        fromDate = new Date(fromDate).setMonth(new Date(fromDate).getMonth() - 3);
        fromDate = new Date(fromDate).toISOString();
        const toDate = new Date().toISOString();
        const expenseSQL = {
            findAll: jest.fn().mockResolvedValue([
                {
                    dataValues: {
                        amount: 100,
                        date: 1,
                    },
                },
            ]),
        };
        const categorySQL = {};
        const userSQL = {};
        const familySQL = {};
        const expenseConnection = {};
        const expenseLogic = new ExpenseLogic(expenseSQL, categorySQL, userSQL, familySQL, expenseConnection);

        const result = await expenseLogic.getExpensesByMonth(familyId, fromDate, toDate);

        expect(result).toEqual([
            {
                amount: 100,
                month: 1,
            },
        ]);
        expect(expenseSQL.findAll).toBeCalledWith({
            attributes: [
                [sequelize.fn("sum", sequelize.col("amount")), "amount"],
                [sequelize.fn("MONTH", sequelize.col("producedDate")), "date"],
            ],
            where: {
                producedDate: {
                    [sequelize.Op.between]: [parseDate(fromDate), parseDate(toDate)],
                },
            },
            group: [sequelize.fn("MONTH", sequelize.col("producedDate"))],
            include: [
                {
                    model: userSQL,
                    attributes: [],
                    where: {
                        familyId: familyId,
                    },
                },
            ],
        });
    });
});

describe("Check monthly limit", () => {
    it("Should check monthly limit and send notification", async () => {
        const categoryId = 1;
        const userId = 1;
        const expenseSQL = {
            sequelize: {
                query: jest.fn().mockResolvedValue([
                    {
                        "SUM(amount) > c.monthlyBudget": true,
                        Total: 100,
                        monthlyBudget: 50,
                        name: "categoryName",
                    },
                ]),
            },
        };
        const categorySQL = {
            findOne: jest.fn().mockResolvedValue({
                dataValues: {
                    monthlyBudget: 50,
                    name: "categoryName",
                },
            }),
        };
        const userSQL = {
            findOne: jest.fn().mockResolvedValue({
                dataValues: {
                    expoToken: "test",
                },
            }),
        };
        const familySQL = {};
        const expenseConnection = {};
        const expenseLogic = new ExpenseLogic(expenseSQL, categorySQL, userSQL, familySQL, expenseConnection);
        expenseLogic.expo = {
            sendPushNotificationsAsync: (message) => {
                expect(message).toEqual([
                    {
                        to: "test",
                        sound: "default",
                        title: "Monthly budget exceeded",
                        body: "Monthly budget exceeded by $" + 50 + ".00 for category " + "categoryName",
                        data: { data: { categoryId } },
                        priority: "high",
                    },
                ]);
                return "receipt";
            },
        };

        await expenseLogic.checkMonthlyLimit(categoryId, userId);

        expect(expenseSQL.sequelize.query).toBeCalledWith(
            `SELECT SUM(amount) > c.monthlyBudget, SUM(amount) as Total, c.monthlyBudget, c.name  FROM Expenses e, Categories c WHERE categoryId = '${categoryId}' AND e.categoryId = c.id GROUP BY c.id, c.name;`,
            { type: sequelize.QueryTypes.SELECT }
        );
    });

    it("Should check monthly limit and not send notification", async () => {
        let receivedMessage = null;
        const categoryId = 1;
        const userId = 1;
        const expenseSQL = {
            sequelize: {
                query: jest.fn().mockResolvedValue([
                    {
                        "SUM(amount) > c.monthlyBudget": true,
                        Total: 100,
                        monthlyBudget: 500,
                        name: "categoryName",
                    },
                ]),
            },
        };
        const categorySQL = {
            findOne: jest.fn().mockResolvedValue({
                dataValues: {
                    monthlyBudget: 50,
                    name: "categoryName",
                },
            }),
        };
        const userSQL = {
            findOne: jest.fn().mockResolvedValue({
                dataValues: {
                    expoToken: "test",
                },
            }),
        };
        const familySQL = {};
        const expenseConnection = {};
        const expenseLogic = new ExpenseLogic(expenseSQL, categorySQL, userSQL, familySQL, expenseConnection);
        expenseLogic.expo = {
            sendPushNotificationsAsync: jest.fn(),
        };

        await expenseLogic.checkMonthlyLimit(categoryId, userId);

        expect(expenseSQL.sequelize.query).toBeCalledWith(
            `SELECT SUM(amount) > c.monthlyBudget, SUM(amount) as Total, c.monthlyBudget, c.name  FROM Expenses e, Categories c WHERE categoryId = '${categoryId}' AND e.categoryId = c.id GROUP BY c.id, c.name;`,
            { type: sequelize.QueryTypes.SELECT }
        );
        expect(expenseLogic.expo.sendPushNotificationsAsync).not.toBeCalled();
    });

    it("Should check monthly limit and not send notification", async () => {
        const categoryId = 1;
        const userId = 1;
        const expenseSQL = {
            sequelize: {
                query: jest.fn().mockResolvedValue([
                    {
                        "SUM(amount) > c.monthlyBudget": true,
                        Total: 100,
                        monthlyBudget: 50,
                        name: "categoryName",
                    },
                ]),
            },
        };
        const categorySQL = {
            findOne: jest.fn().mockResolvedValue({
                dataValues: {
                    monthlyBudget: 50,
                    name: "categoryName",
                },
            }),
        };
        const userSQL = {
            findOne: jest.fn().mockResolvedValue({
                dataValues: {
                    expoToken: false,
                },
            }),
        };
        const familySQL = {};
        const expenseConnection = {};
        const expenseLogic = new ExpenseLogic(expenseSQL, categorySQL, userSQL, familySQL, expenseConnection);
        expenseLogic.expo = {
            sendPushNotificationsAsync: jest.fn(),
        };

        await expenseLogic.checkMonthlyLimit(categoryId, userId);
        expect(expenseSQL.sequelize.query).toBeCalledWith(
            `SELECT SUM(amount) > c.monthlyBudget, SUM(amount) as Total, c.monthlyBudget, c.name  FROM Expenses e, Categories c WHERE categoryId = '${categoryId}' AND e.categoryId = c.id GROUP BY c.id, c.name;`,
            { type: sequelize.QueryTypes.SELECT }
        );
        expect(expenseLogic.expo.sendPushNotificationsAsync).not.toBeCalled();
    });
});
