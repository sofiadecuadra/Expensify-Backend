const ExpenseSQL = require("../dataAccess/models/expenseSQL");
const CategorySQL = require("../dataAccess/models/categorySQL");
const UserSQL = require("../dataAccess/models/userSQL");

const parseDate = require("../utilities/dateUtils");
const sequelize = require("sequelize");

const ValidationError = require("../errors/ValidationError");
const ForeignKeyError = require("../errors/ForeignKeyError");

const { NumberValidator, ISODateValidator } = require("../errors/inputValidators");

class ExpenseLogic {
    static numberLength = 1000000000;

    static async createExpense(amount, producedDate, categoryId, userId) {
        NumberValidator.validate(amount, "expense amount", ExpenseController.numberLength);
        ISODateValidator.validate(producedDate, "produced date");
        NumberValidator.validate(categoryId, "category id", ExpenseController.numberLength);

        await ExpenseSQL.instance.create({
            amount,
            producedDate: parseDate(producedDate),
            categoryId,
            userId,
            registeredDate: parseDate(new Date()),
        });
    }

    static async deleteExpense(expenseId) {
        NumberValidator.validate(expenseId, "expense id", ExpenseLogic.numberLength);

        await ExpenseSQL.instance.destroy({ where: { id: expenseId } });
    }

    static async updateExpense(amount, producedDate, categoryId, expenseId) {
        NumberValidator.validate(expenseId, "expense id", ExpenseController.numberLength);
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
    }

    static async getExpensesByCategory(categoryId, startDate, endDate) {
        ISODateValidator.validate(startDate, "start date");
        ISODateValidator.validate(endDate, "end date");

        return await ExpenseSQL.instance.findAll({
            where: {
                categoryId: categoryId,
                producedDate: {
                    [sequelize.Op.between]: [parseDate(startDate), parseDate(endDate)],
                },
            },
        });
    }

    static async getExpensesPaginated(startDate, endDate, page, pageSize) {
        NumberValidator.validate(page, "page", 100000);
        NumberValidator.validate(pageSize, "page size", 50);

        if (startDate && endDate) {
            ISODateValidator.validate(startDate, "start date");
            ISODateValidator.validate(endDate, "end date");
        } else {
            endDate = new Date();
            startDate = new Date();
            startDate.setDate(startDate.getDate() - 30);
        }

        return await ExpenseSQL.instance.findAll(
            ExpenseLogic.paginate(
                {
                    attributes: ["amount", "id", "producedDate", "registeredDate"],
                    where: {
                        producedDate: {
                            [sequelize.Op.between]: [parseDate(startDate), parseDate(endDate)],
                        },
                    },
                    order: [["producedDate", "ASC"]],
                    include: [
                        {
                            model: CategorySQL.instance,
                            attributes: ["name", "image", "description"],
                        },
                        {
                            model: UserSQL.instance,
                            attributes: ["name"],
                        },
                    ],
                },
                { page, pageSize }
            )
        );
    }

    static async getExpensesCount(startDate, endDate) {
        if (startDate && endDate) {
            ISODateValidator.validate(startDate, "start date");
            ISODateValidator.validate(endDate, "end date");
        } else {
            endDate = new Date();
            startDate = new Date();
            startDate.setDate(startDate.getDate() - 30);
        }
        return await ExpenseSQL.instance.findAll({
            attributes: [[sequelize.fn("count", sequelize.col("id")), "total"]],
            where: {
                producedDate: {
                    [sequelize.Op.between]: [parseDate(startDate), parseDate(endDate)],
                },
            },
        });
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

module.exports = ExpenseLogic;
