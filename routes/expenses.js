const Router = require("express");
const router = Router({ mergeParams: true });
const exenseController = require("../controllers/expenseController");

router.post("/", exenseController.createNewExpense);

module.exports = router;