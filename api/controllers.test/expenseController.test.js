const ExpenseController = require("../controllers/expenseController");

describe("ExpenseController", () => {
    it("should return category expenses", async () => {
        let expenseController;
        let expenseLogic;
        let req;
        let res;
        let next;

        expenseLogic = {
            getExpensesByCategory: jest.fn(),
        }
        expenseController = new ExpenseController(expenseLogic);
        req = {
            params: {
                categoryId: 1,
            },
            query: {
                startDate: "2020-01-01",
                endDate: "2020-01-02",
            }
        };
        res = {
            send: jest.fn(),
        };
        next = jest.fn();
        expenseController.getExpensesByCategory(req, res, next);
        expect(expenseLogic.getExpensesByCategory).toHaveBeenCalledWith(1, "2020-01-01", "2020-01-02");

    });


    it("should throw received error from get expenses by category", async () => {
        let expenseController;
        let expenseLogic;
        let req;
        let res;
        let next;

        expenseLogic = {
            getExpensesByCategory: jest.fn().mockImplementation(() => {
                throw new Error();
            }),
        }
        expenseController = new ExpenseController(expenseLogic);
        const body = {
            categoryId: 1,
            fromDate: "2020-01-01",
            toDate: "2020-01-02",
        }
        req = {
            body: body
        };
        res = {
            send: jest.fn(),
        };
        next = jest.fn();
        expenseController.getExpensesByCategory(req, res, next);
        expect(next).toHaveBeenCalled();
    });
});
