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
const region = process.env.AWS_BUCKET_REGION;
const accessKeyId = process.env.AWS_ACCESS_KEY;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
const sessionToken = process.env.AWS_SESSION_TOKEN;

const s3 = new S3Client({
    region: region,
    // credentials: {
    //     accessKeyId: accessKeyId,
    //     secretAccessKey: secretAccessKey,
    //     sessionToken: sessionToken,
    // },
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

    async uploadImage(imageFile, originalName) {
        try {
            const params = {
                Bucket: bucketName,
                Key: Date.now() + "-" + originalName,
                Body: imageFile.buffer,
            };
            const command = new PutObjectCommand(params);
            await s3.send(command);
            const image = "https://" + bucketName + ".s3.amazonaws.com/" + params.Key;
            return image;
        } catch (err) {
            throw err;
        }
    }

    async createCategory(imageFile, name, description, monthlyBudget, originalname, familyId) {
        try {
            WordValidator.validate(name, "name", this.nameLength);
            ParagraphValidator.validate(description, "description", this.descriptionLength);

            const image = await this.uploadImage(imageFile, originalname);

            console.info("[S3] Uploaded: " + image);

            await this.categorySQL.create({
                name,
                description,
                image,
                monthlyBudget,
                familyId,
            });
        } catch (err) {
            if (err instanceof sequelize.UniqueConstraintError) throw new DuplicateError(name);
            else if (err instanceof sequelize.ValidationError) throw new ValidationError(err.errors);
            throw err;
        }
    }

    async deleteCategory(categoryId) {
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
    }

    async updateCategory(imageFile, categoryId, name, description, originalname, monthlyBudget) {
        try {
            NumberValidator.validate(categoryId, "category id", this.numberLength);
            WordValidator.validate(name, "name", this.nameLength);
            ParagraphValidator.validate(description, "description", this.descriptionLength);

            const image = await this.uploadImage(imageFile, originalname);

            console.info("[S3] Uploaded: " + image);

            await this.categorySQL.update(
                {
                    name: name,
                    description: description,
                    image: image,
                    monthlyBudget: monthlyBudget,
                },
                { where: { id: categoryId } }
            );
        } catch (err) {
            if (err instanceof sequelize.UniqueConstraintError) throw new DuplicateError(name);
            else if (err instanceof sequelize.ValidationError) throw new ValidationError(err.errors);
            throw err;
        }
    }

    async getCategories(familyId) {
        NumberValidator.validate(familyId, "family id", this.numberLength);
        const categories = await this.categorySQL.findAll({
            attributes: ["id", "name", "description", "image", "monthlyBudget"],
            where: {
                familyId: familyId,
                active: true, // only active ones?
            },
        });
        return categories;
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
}

module.exports = CategoryLogic;
