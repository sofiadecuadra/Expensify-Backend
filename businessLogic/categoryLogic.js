const CategorySQL = require("../dataAccess/models/categorySQL");
const ExpenseSQL = require("../dataAccess/models/expenseSQL");
const sequelize = require("sequelize");
const parseDate = require("../utilities/dateUtils");
const DuplicateError = require("../errors/DuplicateCategoryError");
const ValidationError = require("../errors/ValidationError");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const { WordValidator, ParagraphValidator, NumberValidator, ISODateValidator } = require("../errors/inputValidators");
const dotenv = require("dotenv");
const FileUploadError = require("../errors/FileUploadError");

dotenv.config();

const bucketName = process.env.AWS_BUCKET_NAME;
const region = process.env.AWS_BUCKET_REGION;
const accessKeyId = process.env.AWS_ACCESS_KEY;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
const sessionToken = process.env.AWS_SESSION_TOKEN;

const s3 = new S3Client({
    region: region,
    credentials: {
        accessKeyId: accessKeyId,
        secretAccessKey: secretAccessKey,
        sessionToken: sessionToken,
    },
});

class CategoryLogic {
    static nameLength = 20;
    static descriptionLength = 100;
    static numberLength = 1000000000;

    static async createCategory(imageFile, name, description, monthlyBudget, originalname, familyId) {
        try {
            WordValidator.validate(name, "name", CategoryLogic.nameLength);
            ParagraphValidator.validate(description, "description", CategoryLogic.descriptionLength);
            NumberValidator.validate(monthlyBudget, "monthly budget", CategoryLogic.numberLength);

            const params = {
                Bucket: bucketName,
                Key: Date.now() + "-" + originalname,
                Body: imageFile.buffer,
            };

            const command = new PutObjectCommand(params);

            await s3.send(command);
            const image = "https://" + bucketName + ".s3.amazonaws.com/" + params.Key;

            console.info("[S3] Uploaded: " + image);

            await CategorySQL.instance.create({
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

    static async deleteCategory(categoryId) {
        NumberValidator.validate(categoryId, "category id", CategoryLogic.numberLength);
        await CategorySQL.instance.update(
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

    static async updateCategory(categoryId, name, description, image, monthlyBudget) {
        try {
            NumberValidator.validate(categoryId, "category id", CategoryLogic.numberLength);
            WordValidator.validate(name, "name", CategoryLogic.nameLength);
            ParagraphValidator.validate(description, "description", CategoryLogic.descriptionLength);
            NumberValidator.validate(monthlyBudget, "monthly budget", CategoryLogic.nameLength);
            //TODO Ver si validar imagen
            await CategorySQL.instance.update(
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

    static async getCategories(familyId) {
        NumberValidator.validate(familyId, "family id", CategoryLogic.numberLength);
        const categories = await CategorySQL.instance.findAll({
            attributes: ["id", "name", "description", "image", "monthlyBudget"],
            where: {
                familyId: familyId,
                active: true, // only active ones?
            },
        });
        return categories;
    }

    static async getCategoriesWithMoreExpenses(familyId) {
        const categories = await ExpenseSQL.instance.findAll({
            ...CategoryLogic.groupByCategory(CategorySQL.instance, familyId),
            order: sequelize.literal("total DESC"),
            limit: 3,
        });
        return categories;
    }

    static async getCategoriesExpensesByPeriod(familyId, startDate, endDate) {
        ISODateValidator.validate(startDate, "start date");
        ISODateValidator.validate(endDate, "end date");
        const categories = await ExpenseSQL.instance.findAll({
            ...CategoryLogic.groupByCategory(CategorySQL.instance, familyId),
            where: {
                producedDate: {
                    [sequelize.Op.between]: [parseDate(startDate), parseDate(endDate)],
                },
            },
        });
        return categories;
    }

    static groupByCategory = (categoryInstance, familyId) => ({
        attributes: ["categoryId", [sequelize.fn("sum", sequelize.col("amount")), "total"]],

        include: [
            {
                model: categoryInstance,
                attributes: ["name"],
                where: {
                    familyId: familyId,
                    active: true,
                },
            },
        ],
        group: ["categoryId"],
    });
}

module.exports = CategoryLogic;
