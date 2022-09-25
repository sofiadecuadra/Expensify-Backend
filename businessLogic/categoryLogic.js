const sequelize = require("sequelize");
const parseDate = require("../utilities/dateUtils");
const DuplicateError = require("../errors/DuplicateCategoryError");
const ValidationError = require("../errors/ValidationError");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const {
    WordValidator,
    ParagraphValidator,
    NumberValidator,
    ISODateValidator,
} = require("../utilities/inputValidators");
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

    constructor(categorySQL, expenseSQL) {
        this.categorySQL = categorySQL;
        this.expenseSQL = expenseSQL;
    }

    async createCategory(imageFile, name, description, monthlyBudget, originalname, familyId) {
        try {
            WordValidator.validate(name, "name", this.nameLength);
            ParagraphValidator.validate(description, "description", this.descriptionLength);
            NumberValidator.validate(monthlyBudget, "monthly budget", this.numberLength);

            const params = {
                Bucket: bucketName,
                Key: Date.now() + "-" + originalname,
                Body: imageFile.buffer,
            };

            const command = new PutObjectCommand(params);

            await s3.send(command);
            const image = "https://" + bucketName + ".s3.amazonaws.com/" + params.Key;

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

    static async deleteCategory(categoryId) {
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

    async updateCategory(categoryId, name, description, image, monthlyBudget) {
        try {
            NumberValidator.validate(categoryId, "category id", this.numberLength);
            WordValidator.validate(name, "name", this.nameLength);
            ParagraphValidator.validate(description, "description", this.descriptionLength);
            NumberValidator.validate(monthlyBudget, "monthly budget", this.nameLength);
            //TODO Ver si validar imagen
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

    async getCategoriesWithMoreExpenses(familyId) {
        const categories = await this.expenseSQL.findAll({
            ...this.groupByCategory(this.categorySQL, familyId),
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
                    active: true,
                },
            },
        ],
        group: ["categoryId"],
    });
}

module.exports = CategoryLogic;
