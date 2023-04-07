const CategoryController = require("../controllers/categoryController");

describe("Add category", () => {
    let req;
    let res;
    let next;
    let categoryLogic;
    let categoryController;

    beforeEach(() => {
        req = {
            file: {
                originalName: "test.jpg",
                originalname: "test.jpg",
            },
            body: {
                name: "test",
                description: "test",
                monthlyBudget: 100,
            },
            user: {
                familyId: 1,
                userId: 1,
            },
        };
        res = {
            status: jest.fn(() => res),
            json: jest.fn(),
        };
        next = jest.fn();
        categoryLogic = {
            createCategory: jest.fn(),
        };
        categoryController = new CategoryController(categoryLogic);
    });

    test("should return 201 status code", async () => {
        req = {
            file: {
                originalName: "test.jpg",
            },
            body: {
                name: "test",
                description: "test",
                monthlyBudget: 100,
            },
            user: {
                familyId: 1,
                userId: 1,
            },
        };
        await categoryController.createCategory(req, res, next);
        expect(res.status).toHaveBeenCalledWith(201);
    });

    test("should return 201 status code", async () => {
        req = {
            file: {
                originalname: "test.jpg",
            },
            body: {
                name: "test",
                description: "test",
                monthlyBudget: 100,
            },
            user: {
                familyId: 1,
                userId: 1,
            },
        };
        await categoryController.createCategory(req, res, next);
        expect(res.status).toHaveBeenCalledWith(201);
    });

    test("should return json with message", async () => {
        await categoryController.createCategory(req, res, next);
        expect(res.json).toHaveBeenCalledWith({ message: "Category created successfully" });
    });

    test("should call next with error", async () => {
        categoryLogic.createCategory.mockRejectedValue("Error");
        await categoryController.createCategory(req, res, next);
        expect(next).toHaveBeenCalledWith("Error");
    });
});

describe("Delete category", () => {
    let req;
    let res;
    let next;
    let categoryLogic;
    let categoryController;

    beforeEach(() => {
        req = {
            user: {
                userId: 1,
            },
            params: {
                categoryId: 1,
            },
        };
        res = {
            status: jest.fn(() => res),
            json: jest.fn(),
        };
        next = jest.fn();
        categoryLogic = {
            deleteCategory: jest.fn(),
        };
        categoryController = new CategoryController(categoryLogic);
    });

    test("should return 200 status code", async () => {
        await categoryController.deleteCategory(req, res, next);
        expect(res.status).toHaveBeenCalledWith(200);
    });

    test("should return json with message", async () => {
        await categoryController.deleteCategory(req, res, next);
        expect(res.json).toHaveBeenCalledWith({ message: "Category deleted successfully" });
    });

    test("should call next with error", async () => {
        categoryLogic.deleteCategory.mockRejectedValue("Error");
        await categoryController.deleteCategory(req, res, next);
        expect(next).toHaveBeenCalledWith("Error");
    });
});

describe("Update category", () => {
    let req;
    let res;
    let next;
    let categoryLogic;
    let categoryController;

    beforeEach(() => {
        req = {
            file: {
                originalName: "test.jpg",
                originalname: "test.jpg",
            },
            body: {
                name: "test",
                description: "test",
                monthlyBudget: 100,
            },
            user: {
                userId: 1,
            },
            params: {
                categoryId: 1,
            },
        };
        res = {
            status: jest.fn(() => res),
            json: jest.fn(),
        };
        next = jest.fn();
        categoryLogic = {
            updateCategory: jest.fn(),
        };
        categoryController = new CategoryController(categoryLogic);
    });

    test("should return 200 status code", async () => {
        req = {
            file: {
                originalname: "test.jpg",
            },
            body: {
                name: "test",
                description: "test",
                monthlyBudget: 100,
            },
            user: {
                userId: 1,
            },
            params: {
                categoryId: 1,
            },
        };
        await categoryController.updateCategory(req, res, next);
        expect(res.status).toHaveBeenCalledWith(200);
    });

    test("should return 200 status code", async () => {
        req = {
            file: {
                originalname: "test.jpg",
            },
            body: {
                name: "test",
                description: "test",
                monthlyBudget: 100,
            },
            user: {
                userId: 1,
            },
            params: {
                categoryId: 1,
            },
        };
        await categoryController.updateCategory(req, res, next);
        expect(res.status).toHaveBeenCalledWith(200);
    });

    test("should return 200 status code", async () => {
        req = {
            body: {
                name: "test",
                description: "test",
                monthlyBudget: 100,
                imageAlreadyUploaded: true,
            },
            user: {
                userId: 1,
            },
            params: {
                categoryId: 1,
            },
        };
        await categoryController.updateCategory(req, res, next);
        expect(res.status).toHaveBeenCalledWith(200);
    });

    test("should return json with message", async () => {
        await categoryController.updateCategory(req, res, next);
        expect(res.json).toHaveBeenCalledWith({ message: "Category updated successfully" });
    });

    test("should call next with error", async () => {
        categoryLogic.updateCategory.mockRejectedValue("Error");
        await categoryController.updateCategory(req, res, next);
        expect(next).toHaveBeenCalledWith("Error");
    });
});

describe("Get categories", () => {
    let req;
    let res;
    let next;
    let categoryLogic;
    let categoryController;

    beforeEach(() => {
        req = {
            user: {
                familyId: 1,
            },
            query: {
                page: 1,
                pageSize: 10,
            },
        };
        res = {
            status: jest.fn(() => res),
            json: jest.fn(),
        };
        next = jest.fn();
        categoryLogic = {
            getCategories: jest.fn(),
        };
        categoryController = new CategoryController(categoryLogic);
    });

    test("should return 200 status code", async () => {
        await categoryController.getCategories(req, res, next);
        expect(res.status).toHaveBeenCalledWith(200);
    });

    test("should return json with categories", async () => {
        categoryLogic.getCategories.mockResolvedValue([{ name: "test" }]);
        await categoryController.getCategories(req, res, next);
        expect(res.json).toHaveBeenCalledWith([{ name: "test" }]);
    });

    test("should call next with error", async () => {
        categoryLogic.getCategories.mockRejectedValue("Error");
        await categoryController.getCategories(req, res, next);
        expect(next).toHaveBeenCalledWith("Error");
    });
});

describe("Get categories expenses by period", () => {
    let req;
    let res;
    let next;
    let categoryLogic;
    let categoryController;

    beforeEach(() => {
        req = {
            user: {
                familyId: 1,
            },
            query: {
                startDate: "2020-01-01",
                endDate: "2020-01-31",
            },
        };
        res = {
            status: jest.fn(() => res),
            json: jest.fn(),
        };
        next = jest.fn();
        categoryLogic = {
            getCategoriesExpensesByPeriod: jest.fn(),
        };
        categoryController = new CategoryController(categoryLogic);
    });

    test("should return json with categories", async () => {
        categoryLogic.getCategoriesExpensesByPeriod.mockResolvedValue([{ name: "test" }]);
        await categoryController.getCategoriesExpensesByPeriod(req, res, next);
        expect(res.json).toHaveBeenCalledWith([{ name: "test" }]);
    });

    test("should call next with error", async () => {
        categoryLogic.getCategoriesExpensesByPeriod.mockRejectedValue("Error");
        await categoryController.getCategoriesExpensesByPeriod(req, res, next);
        expect(next).toHaveBeenCalledWith("Error");
    });
});

describe("Get categories count", () => {
    let req;
    let res;
    let next;
    let categoryLogic;
    let categoryController;

    beforeEach(() => {
        req = {
            user: {
                familyId: 1,
            },
        };
        res = {
            status: jest.fn(() => res),
            json: jest.fn(),
        };
        next = jest.fn();
        categoryLogic = {
            getCategoriesCount: jest.fn(),
        };
        categoryController = new CategoryController(categoryLogic);
    });

    test("should return json with categories count", async () => {
        categoryLogic.getCategoriesCount.mockResolvedValue(1);
        await categoryController.getCategoriesCount(req, res, next);
        expect(res.json).toHaveBeenCalledWith(1);
    });

    test("should call next with error", async () => {
        categoryLogic.getCategoriesCount.mockRejectedValue("Error");
        await categoryController.getCategoriesCount(req, res, next);
        expect(next).toHaveBeenCalledWith("Error");
    });
});

describe("Get category expenses by month", () => {
    let req;
    let res;
    let next;
    let categoryLogic;
    let categoryController;

    beforeEach(() => {
        req = {
            user: {
                familyId: 1,
            },
            params: {
                categoryId: 1,
            },
            query: {
                month: "2020-01-01",
            },
        };
        res = {
            status: jest.fn(() => res),
            json: jest.fn(),
        };
        next = jest.fn();
        categoryLogic = {
            getCategoryExpensesByMonth: jest.fn(),
        };
        categoryController = new CategoryController(categoryLogic);
    });

    test("should return json with category expenses", async () => {
        categoryLogic.getCategoryExpensesByMonth.mockResolvedValue([{ name: "test" }]);
        await categoryController.getCategoryExpensesByMonth(req, res, next);
        expect(res.json).toHaveBeenCalledWith([{ name: "test" }]);
    });

    test("should call next with error", async () => {
        categoryLogic.getCategoryExpensesByMonth.mockRejectedValue("Error");
        await categoryController.getCategoryExpensesByMonth(req, res, next);
        expect(next).toHaveBeenCalledWith("Error");
    });
});
