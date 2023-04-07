class ExpenseController {
    expenseLogic;

    constructor(expenseLogic) {
        this.expenseLogic = expenseLogic;
    }

    async createNewExpense(req, res, next) {
        try {
            const imageFile = req.file;
            const originalName = req.file.originalName ? req.file.originalName : req.file.originalname;
            const { userId } = req.user;
            const { amount, producedDate, categoryId, description } = req.body;
            await this.expenseLogic.createExpense(amount, producedDate, categoryId, userId, description, imageFile, originalName);
            res.status(201).json({ message: "Expense created successfully" });
        } catch (err) {
            next(err);
        }
    }

    async deleteExpense(req, res, next) {
        try {
            const { expenseId } = req.params;
            const { userId, familyId } = req.user;
            await this.expenseLogic.deleteExpense(userId, expenseId, familyId);
            res.status(200).json({ message: "Expense deleted successfully" });
        } catch (err) {
            next(err);
        }
    }

    async updateExpense(req, res, next) {
        try {
            const { amount, producedDate, categoryId, description, imageAlreadyUploaded } = req.body;
            let imageFile = undefined;
            let originalName = undefined;

            if (!imageAlreadyUploaded) {
                imageFile = req.file;
                originalName = req.file?.originalName ? req.file.originalName : req.file.originalname;
            }
            const { expenseId } = req.params;
            const { userId, familyId } = req.user;
            await this.expenseLogic.updateExpense(
                userId,
                amount,
                producedDate,
                categoryId,
                expenseId,
                familyId,
                description,
                imageFile,
                originalName,
                imageAlreadyUploaded
            );
            res.status(200).json({ message: "Expense updated successfully" });
        } catch (err) {
            next(err);
        }
    }

    async getExpenses(req, res, next) {
        try {
            let { startDate, endDate, page, pageSize } = req.query;
            const { familyId } = req.user;
            const expenses = await this.expenseLogic.getExpenses(familyId, startDate, endDate, page, pageSize);
            res.status(200).json(expenses);
        } catch (err) {
            next(err);
        }
    }

    async getExpensesCount(req, res, next) {
        try {
            const { familyId } = req.user;
            let { startDate, endDate } = req.query;
            const expenses = await this.expenseLogic.getExpensesCount(familyId, startDate, endDate);
            res.status(200).json(expenses);
        } catch (err) {
            next(err);
        }
    }

    async getExpensesByMonth(req, res, next) {
        try {
            const { familyId } = req.user;
            let { startDate, endDate } = req.query;
            const expenses = await this.expenseLogic.getExpensesByMonth(familyId, startDate, endDate);
            res.status(200).json(expenses);
        } catch (err) {
            next(err);
        }
    }
}

module.exports = ExpenseController;
