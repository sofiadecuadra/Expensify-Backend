const Router = require("express");
const router = Router({ mergeParams: true });
const categoryController = require("../controllers/categoryController");
const authMiddleware = require("../middleware/auth");
const Roles = require("../library/roles");
const multer = require("multer");
var AWS = require('aws-sdk');
var multerS3 = require('multer-s3');


const s3 = new AWS.S3();
s3.listBuckets(function(err, data) {
    if (err) {
        console.log("Error", err);
    } else {
        console.log("Success", data.Buckets);
    }
});
var upload = multer({
    storage: multerS3({
        s3: s3,
        acl: 'public-read',
        bucket: 'backend-category',
        key: function(req, file, cb) {
            console.log(file);
            cb(null, file.originalname); //use Date.now() for unique file keys
        },

    })
});
//TO DO: changes middleware for uploading images
router.post("/", upload.single('image'), authMiddleware([Roles.Administrator]), categoryController.createCategory);
router.delete("/:categoryId", authMiddleware([Roles.Administrator]), categoryController.deleteCategory);
router.put("/:categoryId", authMiddleware([Roles.Administrator]), categoryController.updateCategory);
router.get("/", authMiddleware([Roles.Member, Roles.Administrator]), categoryController.getCategories);
router.get("/expenses", authMiddleware([Roles.Administrator]), categoryController.getCategoriesWithMoreExpenses);
router.get("/expenses/period", authMiddleware([Roles.Administrator]), categoryController.getCategoriesExpensesByPeriod);

module.exports = router;