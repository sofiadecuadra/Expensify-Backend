const ExpenseSQL = require("../models/expenseSQL");
const parseDate = require("../utilities/dateUtils");

class ExpenseController {
    static async createNewExpense(req, res, next) {
        try {
            const { amount, producedDate, categoryId } = req.body;
            const { userId } = req.user;
            await ExpenseSQL.instance.create({
                amount,
                producedDate: parseDate(producedDate),
                categoryId,
                userId,
                registeredDate: parseDate(new Date())
            });
            res.status(201).json({ message: 'Expense created successfully' });
        } catch (err) {
            console.log(err.message);
            next(err);
        }
    }

    static async deleteExpense(req, res, next) {
        try {
            const { expenseId } = req.params;
            console.log(expenseId);
            await ExpenseSQL.instance.destroy({ where: { id: expenseId } });
            res.status(200).json({ message: 'Expense deleted successfully' });
        } catch (err) {
            console.log(err.message);
            next(err);
        }
    }

    static async updateExpense(req, res, next) {
        try {
            const { expenseId } = req.params;
            const { amount, producedDate, categoryId } = req.body;
            await ExpenseSQL.instance.update({
                amount,
                producedDate: parseDate(producedDate),
                categoryId
            }, { where: { id: expenseId } });
            res.status(200).json({ message: 'Expense updated successfully' });
        } catch (err) {
            console.log(err.message);
            next(err);
        }
    }
}

module.exports = ExpenseController;