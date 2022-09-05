const Router = require("express");
const router = Router({ mergeParams: true });
const loginController = require("../auth/controllers/loginController");

router.post("/", loginController.logIn);

module.exports = router;