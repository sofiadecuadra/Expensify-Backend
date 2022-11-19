const ExpenseController = require("../controllers/expenseController");

describe("Create new expense", () => {
    it("Should return 201 status code and message", async () => {
        const test = async (file) => {
            const req = {
                file,
                user: {
                    userId: "userId",
                },
                body: {
                    amount: "amount",
                    producedDate: "producedDate",
                    categoryId: "categoryId",
                    description: "description",
                },
            };
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
            };
            const next = jest.fn();
            const expenseLogic = {
                createExpense: jest.fn(),
            };
            const expenseController = new ExpenseController(expenseLogic);
            await expenseController.createNewExpense(req, res, next);
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith({ message: "Expense created successfully" });
            expect(expenseLogic.createExpense).toHaveBeenCalledWith(
                req.body.amount,
                req.body.producedDate,
                req.body.categoryId,
                req.user.userId,
                req.body.description,
                req.file,
                req.file.originalName ? req.file.originalName : req.file.originalname
            );
        };
        await test({
            originalname: "originalName",
        });
        await test({
            originalName: "originalName",
        });
    });

    it("Should return error message", async () => {
        const req = {
            file: {
                originalName: "originalName",
            },
            user: {
                userId: "userId",
            },
            body: {
                amount: "amount",
                producedDate: "producedDate",
                categoryId: "categoryId",
                description: "description",
            },
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        const next = jest.fn();
        const expenseLogic = {
            createExpense: jest.fn().mockRejectedValue(new Error("Error")),
        };
        const expenseController = new ExpenseController(expenseLogic);
        await expenseController.createNewExpense(req, res, next);
        expect(next).toHaveBeenCalledWith(new Error("Error"));
    });
});

describe("Delete expense", () => {
    it("Should return 200 status code and message", async () => {
        const req = {
            params: {
                expenseId: "expenseId",
            },
            user: {
                userId: "userId",
                familyId: "familyId",
            },
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        const next = jest.fn();
        const expenseLogic = {
            deleteExpense: jest.fn(),
        };
        const expenseController = new ExpenseController(expenseLogic);
        await expenseController.deleteExpense(req, res, next);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ message: "Expense deleted successfully" });
        expect(expenseLogic.deleteExpense).toHaveBeenCalledWith(req.user.userId, req.params.expenseId, req.user.familyId);
    });

    it("Should return error message", async () => {
        const req = {
            params: {
                expenseId: "expenseId",
            },
            user: {
                userId: "userId",
                familyId: "familyId",
            },
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        const next = jest.fn();
        const expenseLogic = {
            deleteExpense: jest.fn().mockRejectedValue(new Error("Error")),
        };
        const expenseController = new ExpenseController(expenseLogic);
        await expenseController.deleteExpense(req, res, next);
        expect(next).toHaveBeenCalledWith(new Error("Error"));
    });
});

describe("Update expense", () => {
    describe("Should return 200 status code and message", () => {
        it("When update expense without image", async () => {
            const req = {
                params: {
                    expenseId: "expenseId",
                },
                user: {
                    userId: "userId",
                    familyId: "familyId",
                },
                body: {
                    amount: "amount",
                    producedDate: "producedDate",
                    categoryId: "categoryId",
                    description: "description",
                    imageAlreadyUploaded: true,
                },
            };
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
            };
            const next = jest.fn();
            const expenseLogic = {
                updateExpense: jest.fn(),
            };
            const expenseController = new ExpenseController(expenseLogic);
            await expenseController.updateExpense(req, res, next);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ message: "Expense updated successfully" });
        });

        it("When update expense with image", async () => {
            const test = async (file) => {
                const req = {
                    params: {
                        expenseId: "expenseId",
                    },
                    user: {
                        userId: "userId",
                        familyId: "familyId",
                    },
                    body: {
                        amount: "amount",
                        producedDate: "producedDate",
                        categoryId: "categoryId",
                        description: "description",
                        imageAlreadyUploaded: false,
                    },
                    file,
                };
                const res = {
                    status: jest.fn().mockReturnThis(),
                    json: jest.fn(),
                };
                const next = jest.fn();
                const expenseLogic = {
                    updateExpense: jest.fn(),
                };
                const expenseController = new ExpenseController(expenseLogic);
                await expenseController.updateExpense(req, res, next);
                expect(res.status).toHaveBeenCalledWith(200);
                expect(res.json).toHaveBeenCalledWith({ message: "Expense updated successfully" });
                expect(expenseLogic.updateExpense).toHaveBeenCalledWith(
                    req.user.userId,
                    req.body.amount,
                    req.body.producedDate,
                    req.body.categoryId,
                    req.params.expenseId,
                    req.user.familyId,
                    req.body.description,
                    req.file,
                    req.file.originalName ? req.file.originalName : req.file.originalname,
                    req.body.imageAlreadyUploaded
                );
            };
            await test({
                originalname: "originalName",
            });
            await test({
                originalName: "originalName",
            });
        });
    });

    it("Should return error message", async () => {
        const req = {
            params: {
                expenseId: "expenseId",
            },
            user: {
                userId: "userId",
                familyId: "familyId",
            },
            body: {
                amount: "amount",
                producedDate: "producedDate",
                categoryId: "categoryId",
                description: "description",
                imageAlreadyUploaded: true,
            },
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        const next = jest.fn();
        const expenseLogic = {
            updateExpense: jest.fn().mockRejectedValue(new Error("Error")),
        };
        const expenseController = new ExpenseController(expenseLogic);
        await expenseController.updateExpense(req, res, next);
        expect(next).toHaveBeenCalledWith(new Error("Error"));
    });
});

describe("Get expenses", () => {
    it("Should return 200 status code and expenses", async () => {
        const req = {
            user: {
                userId: "userId",
                familyId: "familyId",
            },
            query: {
                startDate: "startDate",
                endDate: "endDate",
                page: 1,
                pageSize: 10,
            },
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        const next = jest.fn();
        const expenseLogic = {
            getExpenses: jest.fn().mockReturnValue("expenses"),
        };
        const expenseController = new ExpenseController(expenseLogic);
        await expenseController.getExpenses(req, res, next);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith("expenses");
        expect(expenseLogic.getExpenses).toHaveBeenCalledWith("familyId", "startDate", "endDate", 1, 10);
    });

    it("Should return error message", async () => {
        const req = {
            user: {
                userId: "userId",
                familyId: "familyId",
            },
            query: {
                startDate: "startDate",
                endDate: "endDate",
                page: 1,
                pageSize: 10,
            },
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        const next = jest.fn();
        const expenseLogic = {
            getExpenses: jest.fn().mockRejectedValue(new Error("Error")),
        };
        const expenseController = new ExpenseController(expenseLogic);
        await expenseController.getExpenses(req, res, next);
        expect(next).toHaveBeenCalledWith(new Error("Error"));
    });
});

describe("Get expenses count", () => {
    it("Should return 200 status code and expenses count", async () => {
        const req = {
            user: {
                userId: "userId",
                familyId: "familyId",
            },
            query: {
                startDate: "startDate",
                endDate: "endDate",
            },
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        const next = jest.fn();
        const expenseLogic = {
            getExpensesCount: jest.fn().mockReturnValue("expensesCount"),
        };
        const expenseController = new ExpenseController(expenseLogic);
        await expenseController.getExpensesCount(req, res, next);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith("expensesCount");
        expect(expenseLogic.getExpensesCount).toHaveBeenCalledWith(req.user.familyId, req.query.startDate, req.query.endDate);
    });
    it("Should return error message", async () => {
        const req = {
            user: {
                userId: "userId",
                familyId: "familyId",
            },
            query: {
                startDate: "startDate",
                endDate: "endDate",
            },
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        const next = jest.fn();
        const expenseLogic = {
            getExpensesCount: jest.fn().mockRejectedValue(new Error("Error")),
        };
        const expenseController = new ExpenseController(expenseLogic);
        await expenseController.getExpensesCount(req, res, next);
        expect(next).toHaveBeenCalledWith(new Error("Error"));
    });
});

describe("Get expenses by month", () => {
    it("Should return 200 status code and expenses by month", async () => {
        const req = {
            user: {
                userId: "userId",
                familyId: "familyId",
            },
            query: {
                startDate: "startDate",
                endDate: "endDate",
            },
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        const next = jest.fn();
        const expenseLogic = {
            getExpensesByMonth: jest.fn().mockReturnValue("expensesByMonth"),
        };
        const expenseController = new ExpenseController(expenseLogic);
        await expenseController.getExpensesByMonth(req, res, next);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith("expensesByMonth");
        expect(expenseLogic.getExpensesByMonth).toHaveBeenCalledWith(req.user.familyId, req.query.startDate, req.query.endDate);
    });
    it("Should return error message", async () => {
        const req = {
            user: {
                userId: "userId",
                familyId: "familyId",
            },
            query: {
                startDate: "startDate",
                endDate: "endDate",
            },
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        const next = jest.fn();
        const expenseLogic = {
            getExpensesByMonth: jest.fn().mockRejectedValue(new Error("Error")),
        };
        const expenseController = new ExpenseController(expenseLogic);
        await expenseController.getExpensesByMonth(req, res, next);
        expect(next).toHaveBeenCalledWith(new Error("Error"));
    });
});
