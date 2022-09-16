const Router = require("express");
const router = Router({ mergeParams: true });
const categoryController = require("../controllers/categoryController");
const authMiddleware = require("../middleware/auth");
const Roles = require("../library/roles");
const multer = require("multer");
var AWS = require('aws-sdk');
var multerS3 = require('multer-s3');


AWS.config.update({
    accessKeyId: "ASIASXAD43NDUO5UYFJY", // Access key ID
    secretAccesskey: "zPkl9jTSKCGsXHsz5YBpVW5ImoG3LajQMCV/BP9L", // Secret access key,
    region: 'us-east-1',
    sessionToken: 'FwoGZXIvYXdzEG8aDGHIrnyhywQvJViHSyLBASKOxNxaxFHBAuOf/VOA+oMpEc9NiXam4Emlqa+SZNJXOfu+/+ZRx0meB4Oqpu+y/XV6UMIT7p2/JPKiXnP2GpUIFh1p+JvVVTYLEw9EJ0H7l87IVGFV6ITHK668ZUrXf6GNHAmypHUQE1kUBdvic8wIS0souL8exqUXucjRYDl56deDq0Uz3TkHlO8sG6J6KJoyqC4yJCKkuxJrpsc27nmCSC1sMOPwLdPUQP+e9j60faGAjWArwaWC9Cn/t9pMzgYo2N+TmQYyLSNIfvmJdRpEsIpw++8lQM1yCbH3tubpB1+C+WiEjqdSs8y03kv5GpxVtk0lAA=='

})

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

router.post("/", upload.single('image'), authMiddleware([Roles.Administrator]), categoryController.createCategory);
router.delete("/:categoryId", authMiddleware([Roles.Administrator]), categoryController.deleteCategory);
router.put("/:categoryId", authMiddleware([Roles.Administrator]), categoryController.updateCategory);
router.get("/", authMiddleware([Roles.Member, Roles.Administrator]), categoryController.getCategories);
router.get("/expenses", authMiddleware([Roles.Administrator]), categoryController.getCategoriesWithMoreExpenses);
router.get("/expenses/period", authMiddleware([Roles.Administrator]), categoryController.getCategoriesExpensesByPeriod);

module.exports = router;