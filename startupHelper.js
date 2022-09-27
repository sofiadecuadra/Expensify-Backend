const config = require("config");
const dbPort = config.get("MYSQL_DB.port");
const { FamilySQL, CategorySQL, ExpenseSQL, UserSQL } = require("./dataAccess/models");

const { Router } = require("express");
const routes = Router({ mergeParams: true });
const authMiddleware = require("./api/middleware/auth");
const Roles = require("./library/roles");

module.exports = routes;

const Server = require("./server");
const SignInLogic = require("./businessLogic/signInLogic");
const SignInController = require("./api/controllers/signInController");
const CategoryLogic = require("./businessLogic/categoryLogic");
const ExpenseLogic = require("./businessLogic/expenseLogic");
const FamilyLogic = require("./businessLogic/familyLogic");
const UserLogic = require("./businessLogic/userLogic");
const HealthCheckLogic = require("./businessLogic/healthCheckLogic");
const CategoryController = require("./api/controllers/categoryController");
const ExpenseController = require("./api/controllers/expenseController");
const FamilyController = require("./api/controllers/familyController");
const UserController = require("./api/controllers/userController");
const HealthCheckController = require("./api/controllers/healthCheckController");

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
        const signInLogic = new SignInLogic(userSQL.instance);
        const categoryLogic = new CategoryLogic(categorySQL.instance, expenseSQL.instance);
        const expenseLogic = new ExpenseLogic(expenseSQL.instance, categorySQL.instance, userSQL.instance);
        const familyLogic = new FamilyLogic(familySQL.instance);
        const healthCheckLogic = new HealthCheckLogic(sequelizeContext.connection);
        const userLogic = new UserLogic(userSQL.instance, sequelizeContext.connection, familyLogic);
        return { signInLogic, categoryLogic, expenseLogic, familyLogic, healthCheckLogic, userLogic };
    }

    async initializeControllers() {
        const { signInLogic, categoryLogic, expenseLogic, familyLogic, healthCheckLogic, userLogic } =
            await this.initializeLogic();
        const signInController = new SignInController(signInLogic);
        const categoryController = new CategoryController(categoryLogic);
        const expenseController = new ExpenseController(expenseLogic);
        const familyController = new FamilyController(familyLogic);
        const healthCheckController = new HealthCheckController(healthCheckLogic);
        const userController = new UserController(userLogic);
        return {
            signInController,
            categoryController,
            expenseController,
            familyController,
            healthCheckController,
            userController,
        };
    }

    async initializeRoutes() {
        const {
            signInController,
            categoryController,
            expenseController,
            familyController,
            healthCheckController,
            userController,
        } = await this.initializeControllers();
        const signInRoutes = this.createSignInRoutes(signInController);
        routes.use("/auth", signInRoutes);
        const categoryRoutes = this.createCategoryRoutes(categoryController);
        routes.use("/categories", categoryRoutes);
        const expenseRoutes = this.createExpenseRoutes(expenseController);
        routes.use("/expenses", expenseRoutes);
        const familyRoutes = this.createFamilyRoutes(familyController);
        routes.use("/families", familyRoutes);
        const healthCheckRoutes = this.createHealthCheckRoutes(healthCheckController);
        routes.use("/healthCheck", healthCheckRoutes);
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

    createSignInRoutes(signInController) {
        const routes = Router({ mergeParams: true });
        routes.post("/", signInController.signIn.bind(signInController));
        return routes;
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
        routes.delete(
            "/:categoryId",
            authMiddleware([Roles.Administrator]),
            categoryController.deleteCategory.bind(categoryController)
        );
        routes.put(
            "/:categoryId",
            authMiddleware([Roles.Administrator]),
            upload.single("image"),
            categoryController.updateCategory.bind(categoryController)
        );
        routes.get(
            "/",
            authMiddleware([Roles.Member, Roles.Administrator]),
            categoryController.getCategories.bind(categoryController)
        );
        routes.get(
            "/expenses",
            authMiddleware([Roles.Administrator]),
            categoryController.getCategoriesWithMoreExpenses.bind(categoryController)
        );
        routes.get(
            "/count",
            authMiddleware([Roles.Member, Roles.Administrator]),
            categoryController.getCategoriesCount.bind(categoryController)
        );
        routes.get(
            "/expenses/period",
            authMiddleware([Roles.Administrator]),
            categoryController.getCategoriesExpensesByPeriod.bind(categoryController)
        );
        return routes;
    }

    createExpenseRoutes(expenseController) {
        const routes = Router({ mergeParams: true });
        routes.post(
            "/",
            authMiddleware([Roles.Member, Roles.Administrator]),
            expenseController.createNewExpense.bind(expenseController)
        );
        routes.delete(
            "/:expenseId",
            authMiddleware([Roles.Administrator]),
            expenseController.deleteExpense.bind(expenseController)
        );
        routes.put(
            "/:expenseId",
            authMiddleware([Roles.Administrator]),
            expenseController.updateExpense.bind(expenseController)
        );
        routes.get(
            "/",
            authMiddleware([Roles.Member, Roles.Administrator]),
            expenseController.getExpensesPaginated.bind(expenseController)
        );
        routes.get(
            "/count",
            authMiddleware([Roles.Member, Roles.Administrator]),
            expenseController.getExpensesCount.bind(expenseController)
        );
        routes.get(
            "/:categoryId",
            authMiddleware([Roles.Administrator]),
            expenseController.getExpensesByCategory.bind(expenseController)
        );
        return routes;
    }

    createFamilyRoutes(familyController) {
        const routes = Router({ mergeParams: true });
        routes.get(
            "/apiKey/",
            authMiddleware([Roles.Administrator]),
            familyController.getApiKey.bind(familyController)
        );
        routes.patch(
            "/apiKey/",
            authMiddleware([Roles.Administrator]),
            familyController.updateApiKey.bind(familyController)
        );
        routes.post(
            "/invitations/",
            authMiddleware([Roles.Administrator]),
            familyController.createInvite.bind(familyController)
        );
        routes.get("/:inviteToken/", familyController.validateInviteToken.bind(familyController));
        return routes;
    }

    createHealthCheckRoutes(healthCheckController) {
        const routes = Router({ mergeParams: true });
        routes.get("/", healthCheckController.healthCheck.bind(healthCheckController));
        return routes;
    }

    createUserRoutes(userController) {
        const routes = Router({ mergeParams: true });
        routes.post("/", userController.createNewUser.bind(userController));
        routes.post("/invitations", userController.createUserFromInvite.bind(userController));
        return routes;
    }
}

module.exports = StartupHelper;
