class CategoryController {
    categoryLogic;

    constructor(categoryLogic) {
        this.categoryLogic = categoryLogic;
    }

    async createCategory(req, res, next) {
        try {
            const imageFile = req.file;
            const originalName = req.file.originalName ? req.file.originalName : req.file.originalname;
            const { name, description, monthlyBudget } = req.body;
            const { familyId, userId } = req.user;
            await this.categoryLogic.createCategory(userId, imageFile, name, description, monthlyBudget, originalName, familyId);
            res.status(201).json({ message: "Category created successfully" });
        } catch (err) {
            next(err);
        }
    }

    async deleteCategory(req, res, next) {
        try {
            const { userId } = req.user;
            const { categoryId } = req.params;
            await this.categoryLogic.deleteCategory(userId, categoryId);
            res.status(200).json({ message: "Category deleted successfully" });
        } catch (err) {
            next(err);
        }
    }

    async updateCategory(req, res, next) {
        try {
            const { name, description, monthlyBudget, imageAlreadyUploaded } = req.body;
            let imageFile = undefined;
            let originalName = undefined;

            if (!imageAlreadyUploaded) {
                imageFile = req.file;
                originalName = req.file?.originalName ? req.file.originalName : req.file.originalname;
            }
            const { userId } = req.user;
            const { categoryId } = req.params;
            await this.categoryLogic.updateCategory(
                userId,
                imageFile,
                categoryId,
                name,
                description,
                originalName,
                monthlyBudget,
                imageAlreadyUploaded
            );
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

    async getCategoryExpensesByMonth(req, res, next) {
        try {
            const { familyId } = req.user;
            const { categoryId } = req.params;
            const categories = await this.categoryLogic.getCategoryExpensesByMonth(categoryId, familyId);
            res.status(200).json(categories);
        } catch (err) {
            next(err);
        }
    }
}

module.exports = CategoryController;
