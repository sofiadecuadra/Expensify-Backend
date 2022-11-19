const parseDate = require("../utilities/dateUtils");
const sequelize = require("sequelize");
const NumberValidator = require("../utilities/validators/numberValidator");
const ISODateValidator = require("../utilities/validators/dateISOValidator");
const ParagraphValidator = require("../utilities/validators/paragraphValidator");
const ForeignKeyError = require("../errors/ForeignKeyError");
const { Expo } = require("expo-server-sdk");
const imageUploader = require("../library/imageUploader");
const ValidationError = require("../errors/ValidationError");
const bucketName = process.env.AWS_BUCKET_NAME;

class ExpenseLogic {
    numberLength = 1000000000;
    descriptionLength = 100;
    expenseSQL;
    categorySQL;
    userSQL;
    familySQL;
    expo;
    expenseConnection;

    constructor(expenseSQL, categorySQL, userSQL, familySQL, expenseConnection) {
        this.expenseSQL = expenseSQL;
        this.categorySQL = categorySQL;
        this.userSQL = userSQL;
        this.familySQL = familySQL;
        this.expo = new Expo();
        this.expenseConnection = expenseConnection;
    }

    async createExpense(amount, producedDate, categoryId, userId, description, imageFile, originalName) {
        try {
            NumberValidator.validate(amount, "expense amount", this.numberLength);
            ISODateValidator.validate(producedDate, "produced date");
            NumberValidator.validate(categoryId, "category id", this.numberLength);
            ParagraphValidator.validate(description, "description", this.descriptionLength);

            await this.expenseConnection.transaction(async (t) => {
                const imageKey = userId + "-" + Date.now() + "-" + originalName;
                const image = "https://" + bucketName + ".s3.amazonaws.com/" + imageKey;
                const newExpense = await this.expenseSQL.create(
                    {
                        amount,
                        producedDate: parseDate(producedDate),
                        categoryId,
                        userId,
                        image,
                        registeredDate: parseDate(new Date()),
                        description,
                    },
                    { transaction: t }
                );
                await imageUploader.uploadImage(imageFile, imageKey);
                this.checkMonthlyLimit(categoryId, userId);
                console.info(`[USER_${userId}] [EXPENSE_CREATE] Expense created id: ${newExpense.id}`);
                return newExpense;
            });
        } catch (err) {
            if (err instanceof sequelize.ForeignKeyConstraintError) throw new ForeignKeyError(categoryId, "category");
            else if (err instanceof sequelize.ValidationError) throw new ValidationError(err.errors);
            else throw err;
        }
    }

    async deleteExpense(userId, expenseId, familyId) {
        NumberValidator.validate(expenseId, "expense id", this.numberLength);

        const expense = await this.expenseSQL.findOne({
            where: {
                id: expenseId,
                familyId: familyId,
            },
        });

        if (expense) {
            await this.expenseSQL.destroy({
                where: {
                    id: expenseId,
                },
            });
            console.info(`[USER_${userId}] [EXPENSE_DELETE] Expense deleted id: ${expenseId}`);
        }
    }

    async updateExpense(
        userId,
        amount,
        producedDate,
        categoryId,
        expenseId,
        familyId,
        description,
        imageFile,
        originalName,
        imageAlreadyUploaded
    ) {
        try {
            NumberValidator.validate(expenseId, "expense id", this.numberLength);
            NumberValidator.validate(amount, "expense amount", 1000000000);
            ISODateValidator.validate(producedDate, "produced date");
            ParagraphValidator.validate(description, "description", this.descriptionLength);
            let image = undefined;

            if (!imageAlreadyUploaded) {
                const imageKey = userId + "-" + Date.now() + "-" + originalName;
                image = await imageUploader.uploadImage(imageFile, imageKey);
            }

            const previousExpense = await this.expenseSQL.findOne({
                where: {
                    id: expenseId,
                    //TODO FILTRAR POR FAMILIA JOIN CON CATEGORY
                },
            });
            if (!previousExpense) throw new ForeignKeyError(expenseId, "expense");

            await this.expenseSQL.update(
                {
                    amount,
                    producedDate: parseDate(producedDate),
                    categoryId,
                    description,
                    image,
                },
                { where: { id: expenseId } }
            );
            console.info(`[USER_${userId}] [EXPENSE_UPDATE] Expense updated id: ${expenseId}`);
        } catch (err) {
            if (err instanceof sequelize.ForeignKeyConstraintError) throw new ForeignKeyError(categoryId, "category");
            else if (err instanceof sequelize.ValidationError) throw new ValidationError(err.errors);
            else throw err;
        }
    }

    async getExpenses(familyId, startDate, endDate, page, pageSize) {
        NumberValidator.validate(familyId, "family id", this.numberLength);
        NumberValidator.validate(page, "page", 100000);
        NumberValidator.validate(pageSize, "page size", 50);

        if (startDate && endDate) {
            ISODateValidator.validate(startDate, "start date");
            ISODateValidator.validate(endDate, "end date");
            return await this.expenseSQL.findAll(
                this.paginate(
                    {
                        attributes: ["amount", "id", "producedDate", "image", "registeredDate", "description"],
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
                                where: {
                                    familyId: familyId,
                                },
                            },
                        ],
                    },
                    { page, pageSize }
                )
            );
        } else {
            return await this.expenseSQL.findAll(
                this.paginate(
                    {
                        attributes: ["amount", "id", "producedDate", "image", "registeredDate"],
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
                                },
                            },
                        ],
                    },
                    { page, pageSize }
                )
            );
        }
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
                },
            },
            include: [
                {
                    model: this.userSQL,
                    where: {
                        familyId: familyId,
                    },
                },
            ],
        });
        return { total };
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

    async getExpensesByMonth(familyId, fromDate, toDate) {
        ISODateValidator.validate(fromDate, "from date");
        ISODateValidator.validate(toDate, "to date");

        //if period is smaller than 1 month, return separated by weeks
        const period = Math.abs(parseDate(toDate).getTime() - parseDate(fromDate).getTime());
        const days = Math.ceil(period / (1000 * 60 * 60 * 24));
        if (days < 30) {
            const expenses = await this.expenseSQL.findAll({
                attributes: [
                    [sequelize.fn("sum", sequelize.col("amount")), "amount"],
                    [sequelize.fn("WEEK", sequelize.col("producedDate")), "date"],
                ],
                where: {
                    producedDate: {
                        [sequelize.Op.between]: [parseDate(fromDate), parseDate(toDate)],
                    },
                },
                group: [sequelize.fn("WEEK", sequelize.col("producedDate"))],
                include: [
                    {
                        model: this.userSQL,
                        attributes: [],
                        where: {
                            familyId: familyId,
                        },
                    },
                ],
            });

            return expenses.map((expense) => {
                return {
                    amount: expense.dataValues.amount,
                    week: expense.dataValues.date,
                };
            });
        } else {
            const expenses = await this.expenseSQL.findAll({
                attributes: [
                    [sequelize.fn("sum", sequelize.col("amount")), "amount"],
                    [sequelize.fn("MONTH", sequelize.col("producedDate")), "date"],
                ],
                where: {
                    producedDate: {
                        [sequelize.Op.between]: [parseDate(fromDate), parseDate(toDate)],
                    },
                },
                group: [sequelize.fn("MONTH", sequelize.col("producedDate"))],
                include: [
                    {
                        model: this.userSQL,
                        attributes: [],
                        where: {
                            familyId: familyId,
                        },
                    },
                ],
            });

            return expenses.map((expense) => {
                return {
                    amount: expense.dataValues.amount,
                    month: expense.dataValues.date,
                };
            });
        }
    }

    async checkMonthlyLimit(categoryId, userId) {
        const query = `SELECT SUM(amount) > c.monthlyBudget, SUM(amount) as Total, c.monthlyBudget, c.name  FROM Expenses e, Categories c WHERE categoryId = '${categoryId}' AND e.categoryId = c.id GROUP BY c.id, c.name;`;
        const res = await this.expenseSQL.sequelize.query(query, { type: sequelize.QueryTypes.SELECT });
        if (res[0]["SUM(amount) > c.monthlyBudget"]) {
            const difference = (res[0]["Total"] - res[0]["monthlyBudget"]).toFixed(2);
            console.log("[MONTHLY_BUDGET_ALERT] Monthly limit exceeded by $" + difference + " for category " + categoryId);
            if (difference > 0.5) {
                this.sendPushNotification(categoryId, difference, userId);
            }
        }
    }

    async sendPushNotification(categoryId, difference, userId) {
        const category = await this.categorySQL.findOne({
            attributes: ["name"],
            where: {
                id: categoryId,
            },
        });
        const user = await this.userSQL.findOne({
            attributes: ["expoToken"],
            where: {
                id: userId,
            },
        });
        if (user.dataValues.expoToken) {
            const message = {
                to: user.dataValues.expoToken,
                sound: "default",
                title: "Monthly budget exceeded",
                body: "Monthly budget exceeded by $" + difference + " for category " + category.dataValues.name,
                data: { data: { categoryId } },
                priority: "high",
            };
            const res = await this.expo.sendPushNotificationsAsync([message]);
            console.log("[EXPO_NOTIFICATION_RECEIPT] ", res);
        }
    }
}

module.exports = ExpenseLogic;
