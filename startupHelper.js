const dotenv = require("dotenv");
dotenv.config();
const dbPort = process.env.MYSQL_DB_PORT;
const { FamilySQL, CategorySQL, ExpenseSQL, UserSQL } = require("./dataAccess/models");

const { Router } = require("express");
const routes = Router({ mergeParams: true });
const authMiddleware = require("./api/middleware/auth");
const Roles = require("./library/roles");

module.exports = routes;

const Server = require("./server");
const CategoryLogic = require("./businessLogic/categoryLogic");
const ExpenseLogic = require("./businessLogic/expenseLogic");
const FamilyLogic = require("./businessLogic/familyLogic");
const UserLogic = require("./businessLogic/userLogic");
const CategoryController = require("./api/controllers/categoryController");
const ExpenseController = require("./api/controllers/expenseController");
const FamilyController = require("./api/controllers/familyController");
const UserController = require("./api/controllers/userController");

class StartupHelper {
    databaseConnection;

    async initializeDatabase() {
        const SequelizeContext = require("./dataAccess/startup/SequelizeContext");
        const sequelizeContext = new SequelizeContext(dbPort);
        const familySQL = await new FamilySQL(sequelizeContext);
        const userSQL = await new UserSQL(sequelizeContext, familySQL.instance);
        const categorySQL = await new CategorySQL(sequelizeContext, familySQL.instance);
        const expenseSQL = await new ExpenseSQL(sequelizeContext, categorySQL.instance, userSQL.instance);
        await sequelizeContext.connection
            .sync()
            .then(() => console.log("Database is connected!"))
            .catch((err) => console.error(err, "Something went wrong, database is not connected!"));
        return { sequelizeContext, familySQL, userSQL, categorySQL, expenseSQL };
    }

    async initializeLogic() {
        const { sequelizeContext, familySQL, userSQL, categorySQL, expenseSQL } = await this.initializeDatabase();
        const categoryLogic = new CategoryLogic(categorySQL.instance, expenseSQL.instance, familySQL.instance, sequelizeContext.connection);
        const expenseLogic = new ExpenseLogic(
            expenseSQL.instance,
            categorySQL.instance,
            userSQL.instance,
            familySQL.instance,
            sequelizeContext.connection
        );
        const familyLogic = new FamilyLogic(familySQL.instance);
        const userLogic = new UserLogic(userSQL.instance, sequelizeContext.connection, familyLogic);
        return { categoryLogic, expenseLogic, familyLogic, userLogic };
    }

    async initializeControllers() {
        const { categoryLogic, expenseLogic, familyLogic, userLogic } = await this.initializeLogic();
        const categoryController = new CategoryController(categoryLogic);
        const expenseController = new ExpenseController(expenseLogic);
        const familyController = new FamilyController(familyLogic);
        const userController = new UserController(userLogic);
        return {
            categoryController,
            expenseController,
            familyController,
            userController,
        };
    }

    async initializeRoutes() {
        const { categoryController, expenseController, familyController, userController } = await this.initializeControllers();
        const categoryRoutes = this.createCategoryRoutes(categoryController);
        routes.use("/categories", categoryRoutes);
        const expenseRoutes = this.createExpenseRoutes(expenseController);
        routes.use("/expenses", expenseRoutes);
        const familyRoutes = this.createFamilyRoutes(familyController);
        routes.use("/families", familyRoutes);
        const userRoutes = this.createUserRoutes(userController);
        routes.use("/users", userRoutes);
        return routes;
    }

    async startServer() {
        const server = new Server();
        const routes = await this.initializeRoutes();
        server.start();
        server.config(routes);
    }

    createCategoryRoutes(categoryController) {
        const routes = Router({ mergeParams: true });
        const multer = require("multer");

        const storage = multer.memoryStorage();
        const upload = multer({ storage: storage });

        routes.post(
            "/",
            authMiddleware([Roles.Administrator]),
            upload.single("image"),
            categoryController.createCategory.bind(categoryController)
        );
        routes.delete("/:categoryId", authMiddleware([Roles.Administrator]), categoryController.deleteCategory.bind(categoryController));
        routes.put(
            "/:categoryId",
            authMiddleware([Roles.Administrator]),
            upload.single("image"),
            categoryController.updateCategory.bind(categoryController)
        );
        routes.get("/", authMiddleware([Roles.Member, Roles.Administrator]), categoryController.getCategories.bind(categoryController));
        routes.get(
            "/count",
            authMiddleware([Roles.Member, Roles.Administrator]),
            categoryController.getCategoriesCount.bind(categoryController)
        );
        routes.get(
            "/:categoryId/expenses",
            authMiddleware([Roles.Member, Roles.Administrator]),
            categoryController.getCategoryExpensesByMonth.bind(categoryController)
        );
        routes.get(
            "/expenses/period",
            authMiddleware([Roles.Administrator, Roles.Member]),
            categoryController.getCategoriesExpensesByPeriod.bind(categoryController)
        );
        return routes;
    }

    createExpenseRoutes(expenseController) {
        const routes = Router({ mergeParams: true });
        const multer = require("multer");

        const storage = multer.memoryStorage();
        const upload = multer({ storage: storage });
        routes.post(
            "/",
            authMiddleware([Roles.Member, Roles.Administrator]),
            upload.single("image"),
            expenseController.createNewExpense.bind(expenseController)
        );
        routes.delete("/:expenseId", authMiddleware([Roles.Administrator]), expenseController.deleteExpense.bind(expenseController));
        routes.put(
            "/:expenseId",
            authMiddleware([Roles.Member, Roles.Administrator]),
            upload.single("image"),
            expenseController.updateExpense.bind(expenseController)
        );
        routes.get("/", authMiddleware([Roles.Member, Roles.Administrator]), expenseController.getExpenses.bind(expenseController));
        routes.get(
            "/count",
            authMiddleware([Roles.Member, Roles.Administrator]),
            expenseController.getExpensesCount.bind(expenseController)
        );
        routes.get(
            "/month",
            authMiddleware([Roles.Member, Roles.Administrator]),
            expenseController.getExpensesByMonth.bind(expenseController)
        );

        return routes;
    }

    createFamilyRoutes(familyController) {
        const routes = Router({ mergeParams: true });
        routes.post("/invitations/", authMiddleware([Roles.Administrator]), familyController.createInvite.bind(familyController));
        routes.get("/:inviteToken/", familyController.validateInviteToken.bind(familyController));
        return routes;
    }

    createUserRoutes(userController) {
        const routes = Router({ mergeParams: true });
        routes.post("/", userController.createNewUser.bind(userController));
        routes.post("/invitations", userController.createUserFromInvite.bind(userController));
        routes.post("/sign-in", userController.signIn.bind(userController));
        routes.post("/log-out", userController.logOut.bind(userController));
        routes.put("/token", authMiddleware([Roles.Member, Roles.Administrator]), userController.updateToken.bind(userController));
        return routes;
    }
}

module.exports = StartupHelper;
