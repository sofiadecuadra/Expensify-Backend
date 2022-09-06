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
}

module.exports = CategoryController;