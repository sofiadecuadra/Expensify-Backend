const ExpenseController = require("../controllers/expenseController");

describe("Create new expense", () => {
    test("Should return 201 status code and message", async () => {
        const req = {
            file: {
                originalName: "originalName",
                originalname: "originalname",
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
            createExpense: jest.fn(),
        };
        const expenseController = new ExpenseController(expenseLogic);
        await expenseController.createNewExpense(req, res, next);
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith({ message: "Expense created successfully" });
    });
});
