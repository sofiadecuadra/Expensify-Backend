const parseDate = require("../utilities/dateUtils");
const sequelize = require("sequelize");
const NumberValidator = require("../utilities/validators/numberValidator");
const ISODateValidator = require("../utilities/validators/dateISOValidator");
const InvalidApiKeyError = require("../errors/auth/InvalidApiKeyError");

class ExpenseLogic {
    numberLength = 1000000000;
    expenseSQL;
    categorySQL;
    userSQL;
    familySQL;

    constructor(expenseSQL, categorySQL, userSQL, familySQL) {
        this.expenseSQL = expenseSQL;
        this.categorySQL = categorySQL;
        this.userSQL = userSQL;
        this.familySQL = familySQL;
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

    async getExpensesByCategory(categoryId, startDate, endDate, familyName, apiKey) {
        const family = await this.familySQL.findOne({
            attributes: ["id"],
            where: {
                name: familyName,
                apiKey: apiKey,
            },
        });
        if (!family)
            throw new InvalidApiKeyError(familyName);

        ISODateValidator.validate(startDate, "start date");
        ISODateValidator.validate(endDate, "end date");
        NumberValidator.validate(categoryId, "category id", this.numberLength);

        return await this.expenseSQL.findAll({
            include: [
                {
                    model: this.categorySQL,
                    where: {
                        familyId: family.dataValues.id,
                    }
                },
            ],
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
                            attributes: ["name", "image", "description", "id"],
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
