const ExpenseSQL = require("../models/expenseSQL");
const parseDate = require("../utilities/dateUtils");

class ExpenseController {
    static async createNewExpense(req, res, next) {
        try {
            const { amount, userId, producedDate, categoryId } = req.body;
            const user = await ExpenseSQL.instance.create({
                amount,
                userId,
                registeredDate: parseDate(new Date()),
                producedDate: parseDate(producedDate),
                categoryId,
            });
            res.json(user);
        } catch (err) {
            console.log(err.message);
            next(err);
        }
    }
}

module.exports = ExpenseController;