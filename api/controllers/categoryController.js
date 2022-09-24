const CategoryLogic = require("../../businessLogic/categoryLogic");

class CategoryController {
    static async createCategory(req, res, next) {
        try {
            const imageFile = req.file;
            const originalName = req.file.originalName;
            const { name, description, monthlyBudget } = req.body;
            const { familyId } = req.user;
            await CategoryLogic.createCategory(imageFile, name, description, monthlyBudget, originalName, familyId);
            res.status(201).json({ message: "Category created successfully" });
        } catch (err) {
            next(err);
        }
    }

    static async deleteCategory(req, res, next) {
        try {
            const { categoryId } = req.params;
            await CategoryLogic.deleteCategory(categoryId);
            res.status(200).json({ message: "Category deleted successfully" });
        } catch (err) {
            next(err);
        }
    }

    static async updateCategory(req, res, next) {
        try {
            const { categoryId } = req.params;
            const { name, description, image, monthlyBudget } = req.body;
            await CategoryLogic.updateCategory(categoryId, name, description, image, monthlyBudget);
            res.status(200).json({ message: "Category updated successfully" });
        } catch (err) {
            next(err);
        }
    }

    static async getCategories(req, res, next) {
        try {
            const { familyId } = req.user;
            const categories = await CategoryLogic.getCategories(familyId);
            res.status(200).json(categories);
        } catch (err) {
            next(err);
        }
    }

    static async getCategoriesWithMoreExpenses(req, res, next) {
        try {
            const { familyId } = req.user;
            const categories = await CategoryLogic.getCategoriesWithMoreExpenses(familyId);
            res.json(categories);
        } catch (err) {
            next(err);
        }
    }

    static async getCategoriesExpensesByPeriod(req, res, next) {
        try {
            const { familyId } = req.user;
            let { startDate, endDate } = req.query;
            const categories = await CategoryLogic.getCategoriesExpensesByPeriod(familyId, startDate, endDate);
            res.json(categories);
        } catch (err) {
            next(err);
        }
    }
}

module.exports = CategoryController;
