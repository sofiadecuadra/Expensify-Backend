const ExpenseSQL = require("../models/expenseSQL");
const parseDate = require("../utilities/dateUtils");
const sequelize = require("sequelize");
const CategorySQL = require("../models/categorySQL");
const ValidationError = require("../errors/ValidationError");
const ForeignKeyError = require("../errors/ForeignKeyError");
const { NumberValidator, ISODateValidator } = require("../utilities/inputValidators");

class ExpenseController {
    static async createNewExpense(req, res, next) {
        try {
            const { amount, producedDate, categoryId } = req.body;
            NumberValidator.validate(amount, "expense amount", 1000000000);
            ISODateValidator.validate(producedDate, "produced date");
            NumberValidator.validate(categoryId, "category id", 1000000000);

            const { userId } = req.user;
            await ExpenseSQL.instance.create({
                amount,
                producedDate: parseDate(producedDate),
                categoryId,
                userId,
                registeredDate: parseDate(new Date()),
            });
            res.status(201).json({ message: "Expense created successfully" });
        } catch (err) {
            console.log(err);
            const { categoryId } = req.body;
            if (err instanceof sequelize.ForeignKeyConstraintError) next(new ForeignKeyError(categoryId));
            else if (err instanceof sequelize.ValidationError) next(new ValidationError(err.errors));
            else next(err);
        }
    }

    static async deleteExpense(req, res, next) {
        try {
            const { expenseId } = req.params;
            NumberValidator.validate(expenseId, "expense id", 1000000000);

            await ExpenseSQL.instance.destroy({ where: { id: expenseId } });
            res.status(200).json({ message: "Expense deleted successfully" });
        } catch (err) {
            console.log(err.message);
            next(err);
        }
    }

    static async updateExpense(req, res, next) {
        try {
            const { expenseId } = req.params;
            NumberValidator.validate(expenseId, "expense id", 1000000000);
            const { amount, producedDate, categoryId } = req.body;
            NumberValidator.validate(amount, "expense amount", 1000000000);
            ISODateValidator.validate(producedDate, "produced date");

            await ExpenseSQL.instance.update(
                {
                    amount,
                    producedDate: parseDate(producedDate),
                    categoryId,
                },
                { where: { id: expenseId } }
            );
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
            ISODateValidator.validate(startDate, "start date");
            ISODateValidator.validate(endDate, "end date");

            const expenses = await ExpenseSQL.instance.findAll({
                where: {
                    categoryId: categoryId,
                    producedDate: {
                        [sequelize.Op.between]: [parseDate(startDate), parseDate(endDate)],
                    },
                },
            });
            res.status(200).json(expenses);
        } catch (err) {
            console.log(err.message);
            next(err);
        }
    }

    static async getExpensesPaginated(req, res, next) {
        try {
            let { startDate, endDate, page, pageSize } = req.query;
            ISODateValidator.validate(startDate, "start date");
            ISODateValidator.validate(endDate, "end date");
            NumberValidator.validate(page, "page", 100000);
            NumberValidator.validate(pageSize, "page size", 50);

            if (!startDate || !endDate) {
                endDate = new Date();
                startDate = new Date();
                startDate.setDate(startDate.getDate() - 30);
            }
            const expenses = await ExpenseSQL.instance.findAll(
                ExpenseController.paginate(
                    {
                        attributes: ["amount", "id", "producedDate"],
                        where: {
                            producedDate: {
                                [sequelize.Op.between]: [parseDate(startDate), parseDate(endDate)],
                            },
                        },
                        order: [["producedDate", "ASC"]],
                        include: [
                            {
                                model: CategorySQL.instance,
                                attributes: [
                                    "name",
                                    "image",
                                    "description",
                                    /*, "description", "image", "monthlyBudget", "familyId", "active"*/
                                ],
                                where: {
                                    active: true,
                                },
                            },
                        ],
                    },
                    { page, pageSize }
                )
            );
            res.status(200).json(expenses);
        } catch (err) {
            console.log(err.message);
            next(err);
        }
    }

    static async getExpensesCount(req, res, next) {
        try {
            let { startDate, endDate } = req.query;
            ISODateValidator.validate(startDate, "start date");
            ISODateValidator.validate(endDate, "end date");

            if (!startDate || !endDate) {
                endDate = new Date();
                startDate = new Date();
                startDate.setDate(startDate.getDate() - 30);
            }
            const expenses = await ExpenseSQL.instance.findAll({
                attributes: [[sequelize.fn("count", sequelize.col("id")), "total"]],
                where: {
                    producedDate: {
                        [sequelize.Op.between]: [parseDate(startDate), parseDate(endDate)],
                    },
                },
            });
            res.status(200).json(expenses);
        } catch (err) {
            console.log(err.message);
            next(err);
        }
    }

    static paginate(query, { page, pageSize }) {
        const offset = parseInt(page) * parseInt(pageSize);
        const limit = parseInt(pageSize);

        return {
            ...query,
            offset,
            limit,
        };
    }
}

module.exports = ExpenseController;
