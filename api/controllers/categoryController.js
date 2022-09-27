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
            const imageFile = req.file;
            const originalName = req.file.originalName;
            const { categoryId } = req.params;
            const { name, description, monthlyBudget, imageAlreadyUploaded } = req.body;
            await this.categoryLogic.updateCategory(
                imageFile,
                categoryId,
                name,
                description,
                originalName,
                monthlyBudget,
                imageAlreadyUploaded);
            res.status(200).json({ message: "Category updated successfully" });
        } catch (err) {
            next(err);
        }
    }

    async getCategories(req, res, next) {
        try {
            const { familyId } = req.user;
            let { page, pageSize } = req.query;
            const categories = await this.categoryLogic.getCategories(familyId, page, pageSize);
            res.status(200).json(categories);
        } catch (err) {
            next(err);
        }
    }

    async getCategoriesWithMoreExpenses(req, res, next) {
        try {
            const { familyName, apiKey } = req;
            const categories = await this.categoryLogic.getCategoriesWithMoreExpenses(familyName, apiKey);
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

    async getCategoriesCount(req, res, next) {
        try {
            const { familyId } = req.user;
            const categories = await this.categoryLogic.getCategoriesCount(familyId);
            res.status(200).json(categories);
        } catch (err) {
            next(err);
        }
    }
}

module.exports = CategoryController;
