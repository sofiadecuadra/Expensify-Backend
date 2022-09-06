const CategorySQL = require('../models/categorySQL');
const CategoryDTO = require("../DTO/categoryDTO");

class CategoryController {

    static async createCategory(req, res, next) {
        try {
            const { name, description, image, monthlyBudget, familyId } = req.body;
            await CategorySQL.instance.create({
                name,
                description,
                image,
                monthlyBudget,
                familyId
            });
            const categoryDTO = new CategoryDTO(name, description, monthlyBudget);
            res.status(201).json(categoryDTO);
        } catch (err) {
            console.log(err);
            next(err);
        }
    }
}

module.exports = CategoryController;