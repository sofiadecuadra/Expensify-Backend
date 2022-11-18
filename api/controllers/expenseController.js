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
            const { amount, producedDate, categoryId } = req.body;
            console.log(req.body);
            await this.expenseLogic.createExpense(amount, producedDate, categoryId, userId);
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
            const { expenseId } = req.params;
            const { amount, producedDate, categoryId } = req.body;
            const { userId, familyId } = req.user;
            await this.expenseLogic.updateExpense(userId, amount, producedDate, categoryId, expenseId, familyId);
            res.status(200).json({ message: "Expense updated successfully" });
        } catch (err) {
            next(err);
        }
    }

    async getExpensesByCategory(req, res, next) {
        try {
            const { categoryId } = req.params;
            const { startDate, endDate } = req.query;
            const { familyName, apiKey } = req;
            const expenses = await this.expenseLogic.getExpensesByCategory(categoryId, startDate, endDate, familyName, apiKey);
            res.status(200).json(expenses);
        } catch (err) {
            next(err);
        }
    }

    async getExpensesPaginated(req, res, next) {
        try {
            let { startDate, endDate, page, pageSize } = req.query;
            const { familyId } = req.user;
            const expenses = await this.expenseLogic.getExpensesPaginated(familyId, startDate, endDate, page, pageSize);
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

    async getLogs(req, res, next) {
        try {
            const { familyId } = req.user;
            let { page, pageSize } = req.query;
            const logs = await this.expenseLogic.getLogs(familyId, page, pageSize);
            res.status(200).json(logs);
        } catch (err) {
            next(err);
        }
    }

    async getLogCount(req, res, next) {
        try {
            const logCount = await this.expenseLogic.getLogCount();
            res.status(200).json({ total: logCount });
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
