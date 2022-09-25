class ExpenseController {
    expenseLogic;

    constructor(expenseLogic) {
        this.expenseLogic = expenseLogic;
    }

    async createNewExpense(req, res, next) {
        try {
            const { userId } = req.user;
            const { amount, producedDate, categoryId } = req.body;
            await this.expenseLogic.createExpense(amount, producedDate, categoryId, userId);
            res.status(201).json({ message: "Expense created successfully" });
        } catch (err) {
            next(err);
        }
    }

    async deleteExpense(req, res, next) {
        try {
            const { expenseId } = req.params;
            await this.expenseLogic.deleteExpense(expenseId);
            res.status(200).json({ message: "Expense deleted successfully" });
        } catch (err) {
            next(err);
        }
    }

    async updateExpense(req, res, next) {
        try {
            const { expenseId } = req.params;
            const { amount, producedDate, categoryId } = req.body;
            await this.expenseLogic.updateExpense(amount, producedDate, categoryId, expenseId);
            res.status(200).json({ message: "Expense updated successfully" });
        } catch (err) {
            next(err);
        }
    }

    async getExpensesByCategory(req, res, next) {
        try {
            const { categoryId } = req.params;
            const { startDate, endDate } = req.query;
            const expenses = await this.expenseLogic.getExpensesByCategory(categoryId, startDate, endDate);
            res.status(200).json(expenses);
        } catch (err) {
            next(err);
        }
    }

    async getExpensesPaginated(req, res, next) {
        try {
            let { startDate, endDate, page, pageSize } = req.query;
            const expenses = await this.expenseLogic.getExpensesPaginated(startDate, endDate, page, pageSize);
            res.status(200).json(expenses);
        } catch (err) {
            next(err);
        }
    }

    async getExpensesCount(req, res, next) {
        try {
            let { startDate, endDate } = req.query;
            const expenses = await this.expenseLogic.getExpensesCount(startDate, endDate);
            res.status(200).json(expenses);
        } catch (err) {
            next(err);
        }
    }
}

module.exports = ExpenseController;
