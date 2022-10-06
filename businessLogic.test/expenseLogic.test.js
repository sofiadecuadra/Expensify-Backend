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
const InvalidApiKeyError = require("../errors/auth/InvalidApiKeyError");

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
            const mockedFamily = {
                dataValues: {
                    id: 1
                }
            }
            const expenseSQL = {
                findAll: jest.fn().mockReturnValue(mockedArray),
            }
            const familySQL = {
                findOne: jest.fn().mockReturnValue(mockedFamily),
            }
            const categorySQL = {
                findOne: jest.fn(),
            }
            const expenseLogic = new ExpenseLogic(expenseSQL, categorySQL, null, familySQL);
            let fromDate = new Date();
            fromDate.setMonth(fromDate.getMonth() - 1);
            fromDate = fromDate.toISOString();
            const toDate = new Date().toISOString();
            parseDate(new Date().toDateString());
            const familyName = 'familyName';
            const apiKey = 'apiKey';

            const expenses = await expenseLogic.getExpensesByCategory(1, fromDate, toDate, familyName, apiKey);
            expect(expenses).toEqual(mockedArray);
            expect(expenseSQL.findAll).toHaveBeenCalledWith({
                include: [
                    {
                        model: categorySQL,
                        where: {
                            familyId: 1,
                        }
                    },
                ],
                where: {
                    categoryId: 1,
                    producedDate: {
                        [sequelize.Op.between]: [parseDate(fromDate), parseDate(toDate)],
                    },
                },
            });
            expect(familySQL.findOne).toHaveBeenCalledWith({
                attributes: ["id"],
                where: {
                    name: familyName,
                    apiKey: apiKey,
                },
            });

        });

        it("Should throw invalid category error", async () => {
            const mockedFamily = {
                dataValues: {
                    id: 1
                }
            }
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
            const familySQL = {
                findOne: jest.fn().mockReturnValue(mockedFamily),
            }
            const categorySQL = {
                findOne: jest.fn(),
            }
            const expenseLogic = new ExpenseLogic(expenseSQL, categorySQL, null, familySQL);
            let fromDate = new Date();
            fromDate.setMonth(fromDate.getMonth() - 1);
            fromDate = fromDate.toISOString();
            const toDate = new Date().toISOString();
            parseDate(new Date().toDateString());
            const familyName = 'familyName';
            const apiKey = 'apiKey';

            try {
                const expenses = await expenseLogic.getExpensesByCategory(-1, fromDate, toDate, familyName, apiKey);
            }
            catch (err) {
                expect(err).toBeInstanceOf(InputValidationError);
                expect(err.message).toBe("Please enter a non-empty category id containing a maximum of 1000000000 digits!");
            }

        });

        it("Should throw invalid date error", async () => {
            const mockedFamily = {
                dataValues: {
                    id: 1
                }
            }
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
            const familySQL = {
                findOne: jest.fn().mockReturnValue(mockedFamily),
            }
            const categorySQL = {
                findOne: jest.fn(),
            }
            const expenseLogic = new ExpenseLogic(expenseSQL, categorySQL, null, familySQL);
            let fromDate = new Date();
            fromDate.setMonth(fromDate.getMonth() - 1);
            fromDate = fromDate.toISOString();
            const valid = parseDate('2020-01-01 00:00:00');
            const toDate = valid + "invalid";
            const familyName = 'familyName';
            const apiKey = 'apiKey';



            try {
                const expenses = await expenseLogic.getExpensesByCategory(1, fromDate, toDate, familyName, apiKey);
            }
            catch (err) {
                expect(err).toBeInstanceOf(InputValidationError);
                expect(err.message).toBe("Please enter a valid end date in ISO format!");
            }

        });

        it("Should throw invalid api key error", async () => {
            const familySQL = {
                findOne: jest.fn().mockReturnValue(undefined),
            }
            const expenseLogic = new ExpenseLogic(null, null, null, familySQL);


            try {
                await expenseLogic.getExpensesByCategory();
            }
            catch (err) {
                expect(err).toBeInstanceOf(InvalidApiKeyError);
                expect(err.message).toBe("Invalid api key");
                expect(err.body()).toEqual({
                    errorType: "API_KEY_ERROR",
                    message: "Invalid api key",
                });
            }

        });

    });
});

