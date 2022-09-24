const Router = require("express");
const router = Router({ mergeParams: true });
const signInController = require("../controllers/signInController");

router.post("/", signInController.signIn);

module.exports = router;
