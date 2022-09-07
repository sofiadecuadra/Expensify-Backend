const CategorySQL = require('../models/categorySQL');
const CategoryDTO = require("../DTO/categoryDTO");
const ExpenseSQL = require('../models/expenseSQL');
const sequelize = require('sequelize');
class CategoryController {

    static async createCategory(req, res, next) {
        try {
            const { name, description, image, monthlyBudget } = req.body;
            const { familyId } = req.user;
            await CategorySQL.instance.create({
                name,
                description,
                image,
                monthlyBudget,
                familyId
            });
            res.status(201).json({ message: "Category created successfully" });
        } catch (err) {
            console.log(err.message);
            next(err);
        }
    }

    static async deleteCategory(req, res, next) {
        try {
            const { categoryId } = req.params;
            const categoryDeleted = await CategorySQL.instance.update({
                active: false
            }, { where: { id: categoryId } });
            if (categoryDeleted[0] === 0) {
                res.status(404).json({ message: 'Category not found' });
            } else {
                res.status(200).json({ message: 'Category deleted successfully' });
            }
        } catch (err) {
            console.log(err.message);
            next(err);
        }
    }

    static async updateCategory(req, res, next) {
        try {
            const { categoryId } = req.params;
            const { name, description, image, monthlyBudget } = req.body;
            const categoryUpdated = await CategorySQL.instance.update({
                name: name,
                description: description,
                image: image,
                monthlyBudget: monthlyBudget
            }, { where: { id: categoryId } });
            if (categoryUpdated[0] === 0) {
                res.status(400).json({ message: 'Failed to update the category' });
            } else {
                res.status(200).json({ message: 'Category updated successfully' });
            }
        } catch (err) {
            console.log(err.message);
            next(err);
        }
    }

    static async getCategories(req, res, next) {
        try {
            const { familyId } = req.user;
            const categories = await CategorySQL.instance.findAll({
                attributes: [
                    'name',
                ],
                where: {
                    familyId: familyId,
                    active: true // only active ones?
                }
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
                attributes: [
                    'categoryId', [sequelize.fn('sum', sequelize.col('amount')), 'total'],
                ],
                include: [{
                    model: CategorySQL.instance,
                    attributes: ['name', 'description', 'image', 'monthlyBudget', 'familyId', 'active'],
                    where: {
                        active: true
                    }
                }],
                group: ['categoryId'],
                order: sequelize.literal('total DESC'),
                limit: 3
            });
            res.json(categories);
        } catch (err) {
            console.log(err.message);
            next(err);
        }
    }

}

module.exports = CategoryController;