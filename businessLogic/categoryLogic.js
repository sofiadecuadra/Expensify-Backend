const sequelize = require("sequelize");
const parseDate = require("../utilities/dateUtils");
const DuplicateError = require("../errors/DuplicateCategoryError");
const ValidationError = require("../errors/ValidationError");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const dotenv = require("dotenv");
const FileUploadError = require("../errors/FileUploadError");
const WordValidator = require("../utilities/validators/wordValidator");
const ParagraphValidator = require("../utilities/validators/paragraphValidator");
const NumberValidator = require("../utilities/validators/numberValidator");
const ISODateValidator = require("../utilities/validators/dateISOValidator");
const InvalidApiKeyError = require("../errors/auth/InvalidApiKeyError");


dotenv.config();

const bucketName = process.env.AWS_BUCKET_NAME;
const region = 'us-east-1';
const accessKeyId = process.env.AWS_ACCESS_KEY;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
const sessionToken = process.env.AWS_SESSION_TOKEN;
const insideVPC = process.env.INSIDE_VPC;

const credentials = insideVPC ? undefined : {
    accessKeyId: accessKeyId,
    secretAccessKey: secretAccessKey,
    sessionToken: sessionToken,
};

const s3 = new S3Client({
    region: region,
    credentials
});

class CategoryLogic {
    nameLength = 20;
    descriptionLength = 100;
    numberLength = 1000000000;
    categorySQL;
    expenseSQL;
    familySQL;

    constructor(categorySQL, expenseSQL, familySQL) {
        this.categorySQL = categorySQL;
        this.expenseSQL = expenseSQL;
        this.familySQL = familySQL;
    }

    async uploadImage(imageFile, originalName, categoryName) {
        try {
            const params = {
                Bucket: bucketName,
                Key: Date.now() + "-" + originalName,
                Body: imageFile.buffer,
            };
            const command = new PutObjectCommand(params);
            await s3.send(command);
            const image = "https://" + bucketName + ".s3.amazonaws.com/" + params.Key;
            console.info("[S3] Uploaded: " + image);
            return image;
        } catch (err) {
            throw new FileUploadError(categoryName);
        }
    }

    async createCategory(userId, imageFile, name, description, monthlyBudget, originalname, familyId) {
        try {
            if (monthlyBudget == "") monthlyBudget = 0;
            WordValidator.validate(name, "name", this.nameLength);
            ParagraphValidator.validate(description, "description", this.descriptionLength);

            const image = await this.uploadImage(imageFile, originalname, name);

            const newCategory = await this.categorySQL.create({
                name,
                description,
                image,
                monthlyBudget,
                familyId,
            });
            console.info(`[USER_${userId}] [CATEGORY_CREATE] Category created id: ${newCategory.id}`);
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