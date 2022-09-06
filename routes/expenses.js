const Router = require("express");
const router = Router({ mergeParams: true });
const expenseController = require("../controllers/expenseController");
const authMiddleware = require('../middleware/auth');
const Roles = require('../library/roles');

router.post('/', authMiddleware([Roles.Member, Roles.Administrator]), expenseController.createNewExpense);
router.delete('/:expenseId', authMiddleware([Roles.Administrator]), expenseController.deleteExpense);
router.put('/:expenseId', authMiddleware([Roles.Administrator]), expenseController.updateExpense);

module.exports = router;