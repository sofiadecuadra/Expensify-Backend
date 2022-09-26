const parseDate = require("../utilities/dateUtils");
const sequelize = require("sequelize");
const NumberValidator = require("../utilities/validators/numberValidator");
const ISODateValidator = require("../utilities/validators/dateISOValidator");

class ExpenseLogic {
    numberLength = 1000000000;
    expenseSQL;
    categorySQL;
    userSQL;

    constructor(expenseSQL, categorySQL, userSQL) {
        this.expenseSQL = expenseSQL;
        this.categorySQL = categorySQL;
        this.userSQL = userSQL;
    }

    async createExpense(amount, producedDate, categoryId, userId) {
        try {
            NumberValidator.validate(amount, "expense amount", this.numberLength);
            ISODateValidator.validate(producedDate, "produced date");
            NumberValidator.validate(categoryId, "category id", this.numberLength);

            await this.expenseSQL.create({
                amount,
                producedDate: parseDate(producedDate),
                categoryId,
                userId,
                registeredDate: parseDate(new Date()),
            });
        } catch (err) {
            if (err instanceof sequelize.ForeignKeyConstraintError) throw new ForeignKeyError(categoryId);
            else if (err instanceof sequelize.ValidationError) throw new ValidationError(err.errors);
            else throw err;
        }
    }

    async deleteExpense(expenseId) {
        NumberValidator.validate(expenseId, "expense id", this.numberLength);

        await this.expenseSQL.destroy({ where: { id: expenseId } });
    }

    async updateExpense(amount, producedDate, categoryId, expenseId) {
        try {
            NumberValidator.validate(expenseId, "expense id", this.numberLength);
            NumberValidator.validate(amount, "expense amount", 1000000000);
            ISODateValidator.validate(producedDate, "produced date");

            await this.expenseSQL.update(
                {
                    amount,
                    producedDate: parseDate(producedDate),
                    categoryId,
                },
                { where: { id: expenseId } }
            );
        } catch (err) {
            if (err instanceof sequelize.ForeignKeyConstraintError) throw new ForeignKeyError(categoryId);
            else if (err instanceof sequelize.ValidationError) throw new ValidationError(err.errors);
            else throw err;
        }
    }

    async getExpensesByCategory(categoryId, startDate, endDate) {
        ISODateValidator.validate(startDate, "start date");
        ISODateValidator.validate(endDate, "end date");

        return await this.expenseSQL.findAll({
            where: {
                categoryId: categoryId,
                producedDate: {
                    [sequelize.Op.between]: [parseDate(startDate), parseDate(endDate)],
                },
            },
        });
    }

    async getExpensesPaginated(startDate, endDate, page, pageSize) {
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

        return await this.expenseSQL.findAll(
            this.paginate(
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
                            model: this.categorySQL,
                            attributes: ["name", "image", "description"],
                        },
                        {
                            model: this.userSQL,
                            attributes: ["name"],
                        },
                    ],
                },
                { page, pageSize }
            )
        );
    }

    async getExpensesCount(startDate, endDate) {
        if (startDate && endDate) {
            ISODateValidator.validate(startDate, "start date");
            ISODateValidator.validate(endDate, "end date");
        } else {
            endDate = new Date();
            startDate = new Date();
            startDate.setDate(startDate.getDate() - 30);
        }
        return await this.expenseSQL.findAll({
            attributes: [[sequelize.fn("count", sequelize.col("id")), "total"]],
            where: {
                producedDate: {
                    [sequelize.Op.between]: [parseDate(startDate), parseDate(endDate)],
                },
            },
        });
    }

    paginate(query, { page, pageSize }) {
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
