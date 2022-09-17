const CategorySQL = require("../models/categorySQL");
const ExpenseSQL = require("../models/expenseSQL");
const sequelize = require("sequelize");
const parseDate = require("../utilities/dateUtils");
const DuplicateError = require("../errors/DuplicateCategoryError");
const ValidationError = require("../errors/ValidationError");
const multer = require("multer");
var AWS = require('aws-sdk');
var multerS3 = require('multer-s3');
const multiparty = require('multiparty');


const s3 = new AWS.S3();
const {
    WordValidator,
    ParagraphValidator,
    NumberValidator,
    ISODateValidator,
} = require("../utilities/inputValidators");
const FileUploadError = require("../errors/FileUploadError");

class CategoryController {

    static nameLength = 20;
    static descriptionLength = 100;
    static numberLength = 1000000000;



    static async createCategory(req, res, next) {
        try {

            let form = new multiparty.Form();
            let name = '';
            let description = '';
            let monthlyBudget = -1;
            form.parse(req, async function(err, fields, files) {
                name = fields['name'][0];
                description = fields['description'][0];
                monthlyBudget = fields['monthlyBudget'][0];
                console.log(name);
                // Object.keys(fields).forEach(function(name) {

                //     console.log('got field named ' + fields[name]);
                // });
                console.log('info', name);
                const upload = multer({
                    storage: multerS3({
                        s3: s3,
                        acl: 'public-read',
                        bucket: 'backend-category',
                        key: function(req, file, cb) {
                            console.log(file);
                            //cb(null, file.originalname); //use Date.now() for unique file keys
                        },

                    })
                });
                let image = '';
                const singleUpload = upload.single('image');

                singleUpload(req, res, async function(err) {
                    if (err) {
                        console.log(err.message);
                        throw new FileUploadError(name);
                    } else {
                        image = req.file.location;
                        WordValidator.validate(name, "name", CategoryController.nameLength);
                        ParagraphValidator.validate(description, "description", CategoryController.descriptionLength);
                        NumberValidator.validate(monthlyBudget, "monthly budget", CategoryController.numberLength);

                        const { familyId } = req.user;
                        await CategorySQL.instance.create({
                            name,
                            description,
                            image,
                            monthlyBudget,
                            familyId,
                        });

                        res.status(201).json({ message: "Category created successfully" });
                    };
                });


            });

        } catch (err) {
            console.log(err);
            const { name } = req.body;
            if (err instanceof sequelize.UniqueConstraintError) next(new DuplicateError(name));
            else if (err instanceof sequelize.ValidationError) next(new ValidationError(err.errors));
            else next(err);
        }
    }

    static async deleteCategory(req, res, next) {
        try {
            const { categoryId } = req.params;

            NumberValidator.validate(categoryId, "category id", CategoryController.numberLength);
            await CategorySQL.instance.update({
                active: false,
            }, {
                where: {
                    id: categoryId,
                },
            });
            res.status(200).json({ message: "Category deleted successfully" });
        } catch (err) {
            console.log(err.message);
            next(err);
        }
    }

    static async updateCategory(req, res, next) {
        try {
            const { categoryId } = req.params;
            NumberValidator.validate(categoryId, "category id", CategoryController.numberLength);
            const { name, description, image, monthlyBudget } = req.body;
            WordValidator.validate(name, "name", CategoryController.nameLength);
            ParagraphValidator.validate(description, "description", CategoryController.descriptionLength);
            NumberValidator.validate(monthlyBudget, "monthly budget", CategoryController.nameLength);
            //TODO Ver si validar imagen
            await CategorySQL.instance.update({
                name: name,
                description: description,
                image: image,
                monthlyBudget: monthlyBudget,
            }, { where: { id: categoryId } });
            res.status(200).json({ message: "Category updated successfully" });
        } catch (err) {
            console.log(err);
            const { name } = req.body;
            if (err instanceof sequelize.UniqueConstraintError) next(new DuplicateError(name));
            else if (err instanceof sequelize.ValidationError) next(new ValidationError(err.errors));
            else next(err);
        }
    }

    static async getCategories(req, res, next) {
        try {
            const { familyId } = req.user;

            NumberValidator.validate(familyId, "family id", CategoryController.numberLength);
            const categories = await CategorySQL.instance.findAll({
                attributes: ["name", "description", "image", "monthlyBudget"],
                where: {
                    familyId: familyId,
                    active: true, // only active ones?
                },
            });
            res.json(categories);
        } catch (err) {
            console.log(err.message);
            next(err);
        }
    }

    static async getCategoriesWithMoreExpenses(req, res, next) {
        try {
            const categories = await ExpenseSQL.instance.findAll({
                ...CategoryController.groupByCategory(CategorySQL.instance),
                order: sequelize.literal("total DESC"),
                limit: 3,
            });
            res.json(categories);
        } catch (err) {
            console.log(err.message);
            next(err);
        }
    }

    static async getCategoriesExpensesByPeriod(req, res, next) {
        try {
            let { startDate, endDate } = req.query;
            ISODateValidator.validate(startDate, "start date");
            ISODateValidator.validate(endDate, "end date");
            const categories = await ExpenseSQL.instance.findAll({
                ...CategoryController.groupByCategory(CategorySQL.instance),
                where: {
                    producedDate: {
                        [sequelize.Op.between]: [parseDate(startDate), parseDate(endDate)],
                    },
                },
            });
            res.json(categories);
        } catch (err) {
            console.log(err.message);
            next(err);
        }
    }

    static groupByCategory = (categoryInstance) => ({
        attributes: ["categoryId", [sequelize.fn("sum", sequelize.col("amount")), "total"]],

        include: [{
            model: categoryInstance,
            attributes: [
                "name",
                /*, "description", "image", "monthlyBudget", "familyId", "active"*/
            ],
            where: {
                active: true,
            },
        }, ],
        group: ["categoryId"],
    });
}

module.exports = CategoryController;