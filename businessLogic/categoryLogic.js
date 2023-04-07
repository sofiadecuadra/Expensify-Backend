const sequelize = require("sequelize");
const parseDate = require("../utilities/dateUtils");
const DuplicateError = require("../errors/DuplicateCategoryError");
const ValidationError = require("../errors/ValidationError");
const WordValidator = require("../utilities/validators/wordValidator");
const ParagraphValidator = require("../utilities/validators/paragraphValidator");
const NumberValidator = require("../utilities/validators/numberValidator");
const ISODateValidator = require("../utilities/validators/dateISOValidator");
const imageUploader = require("../library/imageUploader");
const dotenv = require("dotenv");
dotenv.config();
const bucketName = process.env.AWS_BUCKET_NAME;

class CategoryLogic {
    nameLength = 20;
    descriptionLength = 100;
    numberLength = 1000000000;
    categorySQL;
    expenseSQL;
    familySQL;
    categoryConnection;

    constructor(categorySQL, expenseSQL, familySQL, categoryConnection) {
        this.categorySQL = categorySQL;
        this.expenseSQL = expenseSQL;
        this.familySQL = familySQL;
        this.categoryConnection = categoryConnection;
    }

    async createCategory(userId, imageFile, name, description, monthlyBudget, originalName, familyId) {
        try {
            if (monthlyBudget == "") monthlyBudget = 0;
            WordValidator.validate(name, "name", this.nameLength);
            ParagraphValidator.validate(description, "description", this.descriptionLength);

            await this.categoryConnection.transaction(async (t) => {
                const imageKey = name + "-" + Date.now() + "-" + originalName;
                const image = "https://" + bucketName + ".s3.amazonaws.com/" + imageKey;
                const newCategory = await this.categorySQL.create(
                    {
                        name,
                        description,
                        image,
                        monthlyBudget,
                        familyId,
                    },
                    { transaction: t }
                );
                await imageUploader.uploadImage(imageFile, imageKey);
                console.info(`[USER_${userId}] [CATEGORY_CREATE] Category created id: ${newCategory.id}`);
                return newCategory;
            });
        } catch (err) {
            if (err instanceof sequelize.UniqueConstraintError) throw new DuplicateError(name);
            else if (err instanceof sequelize.ValidationError) throw new ValidationError(err.errors);
            throw err;
        }
    }

    async deleteCategory(userId, categoryId) {
        NumberValidator.validate(categoryId, "category id", this.numberLength);
        await this.categorySQL.update(
            {
                active: false,
            },
            {
                where: {
                    id: categoryId,
                },
            }
        );
        console.info(`[USER_${userId}] [CATEGORY_DELETE] Category deleted id: ${categoryId}`);
    }

    async updateCategory(userId, imageFile, categoryId, name, description, originalname, monthlyBudget, imageAlreadyUploaded) {
        try {
            if (monthlyBudget == "") monthlyBudget = 0;

            NumberValidator.validate(categoryId, "category id", this.numberLength);
            WordValidator.validate(name, "name", this.nameLength);
            ParagraphValidator.validate(description, "description", this.descriptionLength);
            let image = undefined;
            if (!imageAlreadyUploaded) {
                const imageKey = name + "-" + Date.now() + "-" + originalname;
                console.log(name, originalname, name);
                image = await imageUploader.uploadImage(imageFile, imageKey);
            }

            await this.categorySQL.update(
                {
                    name: name,
                    description: description,
                    image: image,
                    monthlyBudget: monthlyBudget,
                },
                { where: { id: categoryId } }
            );
            console.info(`[USER_${userId}] [CATEGORY_UPDATE] Category updated id: ${categoryId}`);
        } catch (err) {
            if (err instanceof sequelize.UniqueConstraintError) throw new DuplicateError(name);
            else if (err instanceof sequelize.ValidationError) throw new ValidationError(err.errors);
            throw err;
        }
    }

    async getCategories(familyId, page, pageSize) {
        NumberValidator.validate(familyId, "family id", this.numberLength);
        if (page == null || pageSize == null) {
            return await this.categorySQL.findAll({
                attributes: ["id", "name", "description", "image", "monthlyBudget"],
                where: {
                    familyId: familyId,
                    active: true,
                },
            });
        } else {
            NumberValidator.validate(page, "page", 100000);
            NumberValidator.validate(pageSize, "page size", 50);

            return await this.categorySQL.findAll(
                this.paginate(
                    {
                        attributes: ["id", "name", "description", "image", "monthlyBudget"],
                        where: {
                            familyId: familyId,
                            active: true,
                        },
                    },
                    { page, pageSize }
                )
            );
        }
    }

    async getCategoryExpensesByMonth(categoryId, familyId) {
        NumberValidator.validate(categoryId, "category id", this.numberLength);
        NumberValidator.validate(familyId, "family id", this.numberLength);
        const expenses = await this.expenseSQL.findAll({
            attributes: [
                [sequelize.fn("MONTH", sequelize.col("producedDate")), "month"],
                [sequelize.fn("sum", sequelize.col("amount")), "total"],
            ],
            where: {
                categoryId: categoryId,
            },
            group: [sequelize.fn("MONTH", sequelize.col("producedDate"))],
        });
        return expenses;
    }

    async getCategoriesCount(familyId) {
        const total = await this.categorySQL.count({
            where: {
                familyId: familyId,
            },
        });
        return { total };
    }

    async getCategoriesExpensesByPeriod(familyId, startDate, endDate) {
        ISODateValidator.validate(startDate, "start date");
        ISODateValidator.validate(endDate, "end date");
        const categories = await this.expenseSQL.findAll({
            ...this.groupByCategory(this.categorySQL, familyId),
            where: {
                producedDate: {
                    [sequelize.Op.between]: [parseDate(startDate), parseDate(endDate)],
                },
            },
        });
        console.log(familyId);
        return categories;
    }

    groupByCategory = (categoryInstance, familyId) => ({
        attributes: ["categoryId", [sequelize.fn("sum", sequelize.col("amount")), "total"]],

        include: [
            {
                model: categoryInstance,
                attributes: ["name"],
                where: {
                    familyId: familyId,
                    //active: true, TODO VER SE ESTO VA
                },
            },
        ],
        group: ["categoryId"],
    });

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

module.exports = CategoryLogic;
