const parseDate = require("../utilities/dateUtils");
const sequelize = require("sequelize");
const NumberValidator = require("../utilities/validators/numberValidator");
const ISODateValidator = require("../utilities/validators/dateISOValidator");
const InvalidApiKeyError = require("../errors/auth/InvalidApiKeyError");
const ForeignKeyError = require("../errors/ForeignKeyError");
const { ValidationError } = require("sequelize");

class ExpenseLogic {
    numberLength = 1000000000;
    expenseSQL;
    categorySQL;
    userSQL;
    familySQL;
    logs;

    constructor(expenseSQL, categorySQL, userSQL, familySQL, logs) {
        this.expenseSQL = expenseSQL;
        this.categorySQL = categorySQL;
        this.userSQL = userSQL;
        this.familySQL = familySQL;
        this.logs = logs;
    }

    async createExpense(amount, producedDate, categoryId, userId) {
        try {
            NumberValidator.validate(amount, "expense amount", this.numberLength);
            ISODateValidator.validate(producedDate, "produced date");
            NumberValidator.validate(categoryId, "category id", this.numberLength);

            const newExpense = await this.expenseSQL.create({
                amount,
                producedDate: parseDate(producedDate),
                categoryId,
                userId,
                registeredDate: parseDate(new Date()),
            });
            console.info(`[USER_${userId}] [EXPENSE_CREATE] Expense created id: ${newExpense.id}`);
        } catch (err) {
            if (err instanceof sequelize.ForeignKeyConstraintError) throw new ForeignKeyError(categoryId);
            else if (err instanceof sequelize.ValidationError) throw new ValidationError(err.errors);
            else throw err;
        }
    }

    async deleteExpense(userId, expenseId, familyId) {
        NumberValidator.validate(expenseId, "expense id", this.numberLength);

        const expense = await this.expenseSQL.findOne({
            where: {
                id: expenseId,
            },
        });

        if (expense) {
            await this.expenseSQL.destroy({
                where: {
                    id: expenseId,
                },
            });
            console.info(`[USER_${userId}] [EXPENSE_DELETE] Expense deleted id: ${expenseId}`);
            const logObject = {
                type: "EXPENSE_DELETE",
                userId: userId,
                familyId: familyId,
                expenseId: expenseId,
                amount: expense.dataValues.amount,
                producedDate: expense.dataValues.producedDate,
                categoryId: expense.dataValues.categoryId,
                date: new Date().toISOString()
            }
            this.addLog(logObject);

        }

    }

    async updateExpense(userId, amount, producedDate, categoryId, expenseId, familyId) {
        try {
            NumberValidator.validate(expenseId, "expense id", this.numberLength);
            NumberValidator.validate(amount, "expense amount", 1000000000);
            ISODateValidator.validate(producedDate, "produced date");
            const previousExpense = await this.expenseSQL.findOne({
                where: {
                    id: expenseId,
                }
            });
            if (!previousExpense) throw new ForeignKeyError(expenseId);


            await this.expenseSQL.update(
                {
                    amount,
                    producedDate: parseDate(producedDate),
                    categoryId,
                },
                { where: { id: expenseId } }
            );
            console.info(`[USER_${userId}] [EXPENSE_UPDATE] Expense updated id: ${expenseId}`);
            const logObject = {
                type: "EXPENSE_UPDATE",
                userId: userId,
                familyId: familyId,
                expenseId: expenseId,
                prevAmount: previousExpense.dataValues.amount,
                amount: amount,
                prevProducedDate: previousExpense.dataValues.producedDate,
                producedDate: producedDate,
                prevCategoryId: previousExpense.dataValues.categoryId,
                categoryId: categoryId,
                date: new Date().toISOString()
            }
            this.addLog(logObject);
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

    async getExpensesPaginated(familyId, startDate, endDate, page, pageSize) {
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
                        }
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
                            where: {
                                familyId: familyId,
                            }
                        },
                    ],
                },
                { page, pageSize }
            )
        );
    }

    async getExpensesCount(familyId, startDate, endDate) {
        if (startDate && endDate) {
            ISODateValidator.validate(startDate, "start date");
            ISODateValidator.validate(endDate, "end date");
        } else {
            endDate = new Date();
            startDate = new Date();
            startDate.setDate(startDate.getDate() - 30);
        }
        const total = await this.expenseSQL.count({
            where: {
                producedDate: {
                    [sequelize.Op.between]: [parseDate(startDate), parseDate(endDate)],
                }
            },
            include: [
                {
                    model: this.userSQL,
                    where: {
                        familyId: familyId,
                    }
                },
            ],
        });
        return { total };
    }

    async getLogs(familyId, page, pageSize) {
        NumberValidator.validate(page, "page", 100000);
        NumberValidator.validate(pageSize, "page size", 50);

        const logs = await this.logs.find({
            familyId: familyId,
        }, { projection: { _id: 0 } }).sort({ date: -1 }).skip(page * pageSize).limit(parseInt(pageSize)).toArray();

        const categoriesId = new Set();
        for (let i = 0; i < logs.length; i++) {
            if (logs[i].categoryId) {
                categoriesId.add(logs[i].categoryId);
                categoriesId.add(logs[i].prevCategoryId);
            }
        }
        const categoriesIdArray = Array.from(categoriesId);
        const categories = await this.categorySQL.findAll({
            attributes: ["id", "name"],
            where: {
                id: {
                    [sequelize.Op.in]: categoriesIdArray,
                }
            }
        });
        const userIds = new Set();
        for (let i = 0; i < logs.length; i++) {
            if (logs[i].userId) {
                userIds.add(logs[i].userId);
            }
        }
        const userIdsArray = Array.from(userIds);
        const users = await this.userSQL.findAll({
            attributes: ["id", "name"],
            where: {
                id: {
                    [sequelize.Op.in]: userIdsArray,
                }
            }
        });
        for (let i = 0; i < logs.length; i++) {
            if (logs[i].userId) {
                const user = users.find(user => user.dataValues.id === logs[i].userId);
                logs[i].userName = user.dataValues.name;
            }
            if (logs[i].categoryId) {
                const category = categories.find(category => category.dataValues.id === logs[i].categoryId);
                logs[i].categoryName = category.dataValues.name;
            }
            if (logs[i].prevCategoryId) {
                const prevCategory = categories.find(category => category.dataValues.id === logs[i].prevCategoryId);
                logs[i].prevCategoryName = prevCategory.dataValues.name;
            }
            logs[i].userId = undefined;
            logs[i].categoryId = undefined;
            logs[i].prevCategoryId = undefined;
            logs[i].familyId = undefined;
            logs[i].expenseId = undefined;
        }

        return logs;
    }

    getLogCount() {
        return this.logs.countDocuments();
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

    addLog(log) {
        try {
            this.logs.insertOne(log);
        }
        catch (e) {
            console.error("[AUDIT_LOG_INSERT_ERROR] " + e.message);
        }
    }
}

module.exports = ExpenseLogic;
