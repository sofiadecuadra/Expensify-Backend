const ExpenseSQL = require("../models/expenseSQL");
const parseDate = require("../utilities/dateUtils");
const sequelize = require("sequelize");
const CategorySQL = require("../models/categorySQL");

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

    static async getExpensesByCategory(req, res, next) {
        try {
            const { categoryId } = req.params;
            const { startDate, endDate } = req.query;
            console.log(startDate, endDate);
            const expenses = await ExpenseSQL.instance.findAll({
                where: {
                    categoryId: categoryId,
                    producedDate: {
                        [sequelize.Op.between]: [parseDate(startDate), parseDate(endDate)]
                    }
                }
            });
            res.status(200).json(expenses);
        } catch (err) {
            console.log(err.message);
            next(err);
        }
    }

    static async getExpensesPaginated(req, res, next) {
        try {
            let { startDate, endDate, page, pageSize } = req.body;
            if (!startDate || !endDate) {
                endDate = new Date();
                startDate = new Date();
                startDate.setDate(startDate.getDate() - 30);
            }
            const expenses = await ExpenseSQL.instance.findAll(ExpenseController.paginate({
                attributes: ["amount", "id", "producedDate"],
                where: {
                    producedDate: {
                        [sequelize.Op.between]: [parseDate(startDate), parseDate(endDate)]
                    }
                },
                order: [["producedDate", "ASC"]],
                include: [
                    {
                        model: CategorySQL.instance,
                        attributes: [
                            "name", "image", "description"
                            /*, "description", "image", "monthlyBudget", "familyId", "active"*/
                        ],
                        where: {
                            active: true,
                        },
                    },
                ],
            }, { page, pageSize }));
            res.status(200).json(expenses);
        } catch (err) {
            console.log(err.message);
            next(err);
        }
    }

    static paginate(query, { page, pageSize }) {
        const offset = page * pageSize;
        const limit = pageSize;

        return {
            ...query,
            offset,
            limit,
        };
    };

}

module.exports = ExpenseController;