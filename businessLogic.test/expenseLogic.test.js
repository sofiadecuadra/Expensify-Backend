const UserLogic = require("../businessLogic/userLogic");
const bcrypt = require("bcryptjs");
const { createKey } = require("../library/jwtSupplier");
const InviteTokenError = require("../errors/auth/InviteTokenError");
const InputValidationError = require("../errors/inputValidationError");
const AuthError = require("../errors/auth/AuthError");
const sequelize = require("sequelize");
const DuplicateUserError = require("../errors/DuplicateUserError");
const ValidationError = require("../errors/ValidationError");
const HTTPRequestError = require("../errors/HttpRequestError");
const ExpenseLogic = require("../businessLogic/expenseLogic");
const parseDate = require("../utilities/dateUtils");

describe("ExpenseLogicTest", () => {
    describe("Get category expenses", () => {
        it("Should return all expenses for a category", async () => {
            const mockedArray = [
                {
                    id: 1,
                    amount: 100,
                    producedDate: new Date(),
                    registeredDate: new Date(),
                    categoryId: 1,
                    userId: 1,
                },
                {
                    id: 2,
                    amount: 200,
                    producedDate: new Date(),
                    registeredDate: new Date(),
                    categoryId: 1,
                    userId: 1,
                },
            ];
            const expenseSQL = {
                findAll: jest.fn().mockReturnValue(mockedArray),
            }
            const expenseLogic = new ExpenseLogic(expenseSQL);
            let fromDate = new Date();
            fromDate.setMonth(fromDate.getMonth() - 1);
            fromDate = fromDate.toISOString();
            const toDate = new Date().toISOString();
            parseDate(new Date().toDateString());

            const expenses = await expenseLogic.getExpensesByCategory(1, fromDate, toDate);
            expect(expenses).toEqual(mockedArray);
            expect(expenseSQL.findAll).toHaveBeenCalledWith({
                where: {
                    categoryId: 1,
                    producedDate: {
                        [sequelize.Op.between]: [parseDate(fromDate), parseDate(toDate)],
                    },
                },
            });

        });

        it("Should throw invalid category error", async () => {
            const mockedArray = [
                {
                    id: 1,
                    amount: 100,
                    producedDate: new Date(),
                    registeredDate: new Date(),
                    categoryId: 1,
                    userId: 1,
                },
                {
                    id: 2,
                    amount: 200,
                    producedDate: new Date(),
                    registeredDate: new Date(),
                    categoryId: 1,
                    userId: 1,
                },
            ];
            const expenseSQL = {
                findAll: jest.fn().mockReturnValue(mockedArray),
            }
            const expenseLogic = new ExpenseLogic(expenseSQL);
            let fromDate = new Date();
            fromDate.setMonth(fromDate.getMonth() - 1);
            fromDate = fromDate.toISOString();
            const toDate = new Date().toISOString();
            parseDate(new Date().toDateString());

            try {
                const expenses = await expenseLogic.getExpensesByCategory(-1, fromDate, toDate);
            }
            catch (err) {
                expect(err).toBeInstanceOf(InputValidationError);
                expect(err.message).toBe("Please enter a non-empty category id containing a maximum of 1000000000 digits!");
            }

        });

        it("Should throw invalid date error", async () => {
            const mockedArray = [
                {
                    id: 1,
                    amount: 100,
                    producedDate: new Date(),
                    registeredDate: new Date(),
                    categoryId: 1,
                    userId: 1,
                },
                {
                    id: 2,
                    amount: 200,
                    producedDate: new Date(),
                    registeredDate: new Date(),
                    categoryId: 1,
                    userId: 1,
                },
            ];
            const expenseSQL = {
                findAll: jest.fn().mockReturnValue(mockedArray),
            }
            const expenseLogic = new ExpenseLogic(expenseSQL);
            let fromDate = new Date();
            fromDate.setMonth(fromDate.getMonth() - 1);
            fromDate = fromDate.toISOString();
            const toDate = new Date().toISOString() + "invalid";
            parseDate(new Date().toDateString());

            try {
                const expenses = await expenseLogic.getExpensesByCategory(1, fromDate, toDate);
            }
            catch (err) {
                expect(err).toBeInstanceOf(InputValidationError);
                expect(err.message).toBe("Please enter a valid end date in ISO format!");
            }

        });

    });
});

