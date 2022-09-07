const CategorySQL = require('../models/categorySQL');
const CategoryDTO = require("../DTO/categoryDTO");

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
            console.log(err);
            next(err);
        }
    }

    static async deleteCategory(req, res, next) {
        try {
            const { categoryId } = req.params;
            console.log(categoryId);
            await CategorySQL.instance.update({
                active: false
            }, { where: { id: categoryId } });
            res.status(200).json({ message: 'Category deleted successfully' });
        } catch (err) {
            console.log(err.message);
            next(err);
        }
    }
}

module.exports = CategoryController;