const ExpenseSQL = require("../../dataAccess/models/expenseSQL");
const CategorySQL = require("../../dataAccess/models/categorySQL");
const UserSQL = require("../../dataAccess/models/userSQL");

const parseDate = require("../../utilities/dateUtils");
const sequelize = require("sequelize");

const ValidationError = require("../../errors/ValidationError");
const ForeignKeyError = require("../../errors/ForeignKeyError");

const { NumberValidator, ISODateValidator } = require("../../errors/inputValidators");

const ExpenseLogic = require("../../businessLogic/expenseLogic");
class ExpenseController {
    static async createNewExpense(req, res, next) {
        try {
            const { userId } = req.user;
            const { amount, producedDate, categoryId } = req.body;
            await ExpenseLogic.createExpense(amount, producedDate, categoryId, userId);
            res.status(201).json({ message: "Expense created successfully" });
        } catch (err) {
            const { categoryId } = req.body;
            if (err instanceof sequelize.ForeignKeyConstraintError) next(new ForeignKeyError(categoryId));
            else if (err instanceof sequelize.ValidationError) next(new ValidationError(err.errors));
            else next(err);
        }
    }

    static async deleteExpense(req, res, next) {
        try {
            const { expenseId } = req.params;
            await ExpenseLogic.deleteExpense(expenseId);
            res.status(200).json({ message: "Expense deleted successfully" });
        } catch (err) {
            next(err);
        }
    }

    static async updateExpense(req, res, next) {
        try {
            const { expenseId } = req.params;
            const { amount, producedDate, categoryId } = req.body;
            await ExpenseLogic.updateExpense(amount, producedDate, categoryId, expenseId);
            res.status(200).json({ message: "Expense updated successfully" });
        } catch (err) {
            console.log(err);
            const { categoryId } = req.body;
            if (err instanceof sequelize.ForeignKeyConstraintError) next(new ForeignKeyError(categoryId));
            else if (err instanceof sequelize.ValidationError) next(new ValidationError(err.errors));
            else next(err);
        }
    }

    static async getExpensesByCategory(req, res, next) {
        try {
            const { categoryId } = req.params;
            const { startDate, endDate } = req.query;
            const expenses = await ExpenseLogic.getExpensesByCategory(categoryId, startDate, endDate);
            res.status(200).json(expenses);
        } catch (err) {
            console.log(err.message);
            next(err);
        }
    }

    static async getExpensesPaginated(req, res, next) {
        try {
            let { startDate, endDate, page, pageSize } = req.query;
            const expenses = await ExpenseLogic.getExpensesPaginated(startDate, endDate, page, pageSize);
            res.status(200).json(expenses);
        } catch (err) {
            console.log(err.message);
            next(err);
        }
    }

    static async getExpensesCount(req, res, next) {
        try {
            let { startDate, endDate } = req.query;
            const expenses = await ExpenseLogic.getExpensesCount(startDate, endDate);
            res.status(200).json(expenses);
        } catch (err) {
            console.log(err.message);
            next(err);
        }
    }
}

module.exports = ExpenseController;
