class CategoryController {
    categoryLogic;

    constructor(categoryLogic) {
        this.categoryLogic = categoryLogic;
    }

    async createCategory(req, res, next) {
        try {
            const imageFile = req.file;
            const originalName = req.file.originalName;
            const { name, description, monthlyBudget } = req.body;
            const { familyId } = req.user;
            await this.categoryLogic.createCategory(
                imageFile,
                name,
                description,
                monthlyBudget,
                originalName,
                familyId
            );
            res.status(201).json({ message: "Category created successfully" });
        } catch (err) {
            next(err);
        }
    }

    async deleteCategory(req, res, next) {
        try {
            const { categoryId } = req.params;
            await this.categoryLogic.deleteCategory(categoryId);
            res.status(200).json({ message: "Category deleted successfully" });
        } catch (err) {
            next(err);
        }
    }

    async updateCategory(req, res, next) {
        try {
            const { categoryId } = req.params;
            const { name, description, image, monthlyBudget } = req.body;
            await this.categoryLogic.updateCategory(categoryId, name, description, image, monthlyBudget);
            res.status(200).json({ message: "Category updated successfully" });
        } catch (err) {
            next(err);
        }
    }

    async getCategories(req, res, next) {
        try {
            const { familyId } = req.user;
            const categories = await this.categoryLogic.getCategories(familyId);
            res.status(200).json(categories);
        } catch (err) {
            next(err);
        }
    }

    async getCategoriesWithMoreExpenses(req, res, next) {
        try {
            const { familyId } = req.user;
            const categories = await this.categoryLogic.getCategoriesWithMoreExpenses(familyId);
            res.json(categories);
        } catch (err) {
            next(err);
        }
    }

    async getCategoriesExpensesByPeriod(req, res, next) {
        try {
            const { familyId } = req.user;
            let { startDate, endDate } = req.query;
            const categories = await this.categoryLogic.getCategoriesExpensesByPeriod(familyId, startDate, endDate);
            res.json(categories);
        } catch (err) {
            next(err);
        }
    }
}

module.exports = CategoryController;