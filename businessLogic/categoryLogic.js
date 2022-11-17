const sequelize = require("sequelize");
const parseDate = require("../utilities/dateUtils");
const DuplicateError = require("../errors/DuplicateCategoryError");
const ValidationError = require("../errors/ValidationError");
const WordValidator = require("../utilities/validators/wordValidator");
const ParagraphValidator = require("../utilities/validators/paragraphValidator");
const NumberValidator = require("../utilities/validators/numberValidator");
const ISODateValidator = require("../utilities/validators/dateISOValidator");
const InvalidApiKeyError = require("../errors/auth/InvalidApiKeyError");
const { uploadImage } = require("../library/imageUploader");
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
                await uploadImage(imageFile, imageKey, name);
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
        await this.categorySQL.update({
            active: false,
        }, {
            where: {
                id: categoryId,
            },
        });
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
                image = await this.uploadImage(imageFile, originalname, name);
            }

            await this.categorySQL.update({
                name: name,
                description: description,
                image: image,
                monthlyBudget: monthlyBudget,
            }, { where: { id: categoryId } });
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
                this.paginate({
                    attributes: ["id", "name", "description", "image", "monthlyBudget"],
                    where: {
                        familyId: familyId,
                        active: true,
                    },
                }, { page, pageSize })
            );
        }
    }

    async getCategoryById(familyId, categoryId) {
        NumberValidator.validate(categoryId, "category id", this.numberLength);
        return await this.categorySQL.findOne({
            attributes: ["id", "name", "description", "image", "monthlyBudget"],
            where: {
                id: categoryId,
                familyId: familyId,
                active: true,
            },
        });
    }

    async getCategoriesCount(familyId) {
        const total = await this.categorySQL.count({
            where: {
                familyId: familyId,
            },
        });
        return { total };
    }

    async getCategoriesWithMoreExpenses(familyName, apiKey) {
        const family = await this.familySQL.findOne({
            attributes: ["id"],
            where: {
                name: familyName,
                apiKey: apiKey,
            },
        });
        if (!family)
            throw new InvalidApiKeyError(familyName);

        const categories = await this.expenseSQL.findAll({
            ...this.groupByCategory(this.categorySQL, family.dataValues.id),
            order: sequelize.literal("total DESC"),
            limit: 3,
        });
        return categories;
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
        return categories;
    }

    groupByCategory = (categoryInstance, familyId) => ({
        attributes: ["categoryId", [sequelize.fn("sum", sequelize.col("amount")), "total"]],

        include: [{
            model: categoryInstance,
            attributes: ["name"],
            where: {
                familyId: familyId,
                //active: true, TODO VER SE ESTO VA
            },
        },],
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