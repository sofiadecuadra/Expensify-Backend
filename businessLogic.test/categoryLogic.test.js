const imageUploader = require("../library/imageUploader");
const CategoryLogic = require("../businessLogic/categoryLogic");
const sequelize = require("sequelize");
const parseDate = require("../utilities/dateUtils");
const DuplicateCategoryError = require("../errors/DuplicateCategoryError");
const FileUploadError = require("../errors/FileUploadError");

describe("Update category", () => {
    let categorySQL;
    let expenseSQL;
    let familySQL;
    let categoryConnection;
    let categoryMock;

    beforeEach(() => {
        jest.resetModules();
        jest.spyOn(imageUploader, "uploadImage").mockResolvedValue("image");
        categoryMock = {
            id: 1,
        };
        categorySQL = {
            getCategoryById: jest.fn().mockResolvedValue(categoryMock),
            update: jest.fn().mockResolvedValue(categoryMock),
        };
        expenseSQL = {
            getUserById: jest.fn(),
        };
        familySQL = {};
        categoryConnection = {
            transaction: jest.fn().mockImplementation((callback) => callback()),
        };
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    test("should update a category without image", async () => {
        const userId = 1;
        const imageFile = "image";
        const categoryId = 1;
        const name = "name";
        const description = "description";
        const monthlyBudget = 100;
        const originalName = "originalName";
        const imageAlreadyUploaded = true;

        const categoryLogic = new CategoryLogic(categorySQL, expenseSQL, familySQL, categoryConnection);
        await categoryLogic.updateCategory(
            userId,
            imageFile,
            categoryId,
            name,
            description,
            originalName,
            monthlyBudget,
            imageAlreadyUploaded
        );
        expect(categorySQL.update).toHaveBeenCalledWith(
            {
                name,
                description,
                image: undefined,
                monthlyBudget,
            },
            { where: { id: categoryId } }
        );
        expect(imageUploader.uploadImage).not.toHaveBeenCalled();
    });

    test("should update a category", async () => {
        const userId = 1;
        const imageFile = "image";
        const categoryId = 1;
        const name = "name";
        const description = "description";
        const monthlyBudget = 100;
        const originalName = "originalName";
        const imageAlreadyUploaded = false;

        const categoryLogic = new CategoryLogic(categorySQL, expenseSQL, familySQL, categoryConnection);
        await categoryLogic.updateCategory(
            userId,
            imageFile,
            categoryId,
            name,
            description,
            originalName,
            monthlyBudget,
            imageAlreadyUploaded
        );
        expect(categorySQL.update).toHaveBeenCalledWith(
            {
                name,
                description,
                image: expect.any(String),
                monthlyBudget,
            },
            { where: { id: categoryId } }
        );
        expect(imageUploader.uploadImage).toHaveBeenCalledWith(imageFile, expect.any(String));
    });

    test("should update a category without monthlyBudget", async () => {
        const userId = 1;
        const imageFile = "image";
        const categoryId = 1;
        const name = "name";
        const description = "description";
        const originalName = "originalName";
        const imageAlreadyUploaded = false;

        const categoryLogic = new CategoryLogic(categorySQL, expenseSQL, familySQL, categoryConnection);
        await categoryLogic.updateCategory(userId, imageFile, categoryId, name, description, originalName, "", imageAlreadyUploaded);
        expect(categorySQL.update).toHaveBeenCalledWith(
            {
                name,
                description,
                image: expect.any(String),
                monthlyBudget: 0,
            },
            { where: { id: categoryId } }
        );
        expect(imageUploader.uploadImage).toHaveBeenCalledWith(imageFile, expect.any(String));
    });

    test("should throw duplicateError", async () => {
        const userId = 1;
        const imageFile = "image";
        const categoryId = 1;
        const name = "name";
        const description = "description";
        const monthlyBudget = 100;
        const originalName = "originalName";
        const imageAlreadyUploaded = false;

        categorySQL.update.mockRejectedValue(new sequelize.UniqueConstraintError());
        const categoryLogic = new CategoryLogic(categorySQL, expenseSQL, familySQL, categoryConnection);
        await expect(
            categoryLogic.updateCategory(
                userId,
                imageFile,
                categoryId,
                name,
                description,
                monthlyBudget,
                originalName,
                imageAlreadyUploaded
            )
        ).rejects.toThrowError("A category named 'name' already exists. Please try again.");
    });

    test("should throw validationError", async () => {
        const userId = 1;
        const imageFile = "image";
        const categoryId = 1;
        const name = "name";
        const description = "description";
        const monthlyBudget = 100;
        const originalName = "originalName";
        const imageAlreadyUploaded = false;

        categorySQL.update.mockRejectedValue(new sequelize.ValidationError());
        const categoryLogic = new CategoryLogic(categorySQL, expenseSQL, familySQL, categoryConnection);
        await expect(
            categoryLogic.updateCategory(
                userId,
                imageFile,
                categoryId,
                name,
                description,
                monthlyBudget,
                originalName,
                imageAlreadyUploaded
            )
        ).rejects.toThrowError();
    });

    test("should throw error", async () => {
        const userId = 1;
        const imageFile = "image";
        const categoryId = 1;
        const name = "name";
        const description = "description";
        const monthlyBudget = 100;
        const originalName = "originalName";
        const imageAlreadyUploaded = false;

        categorySQL.update.mockRejectedValue(new FileUploadError());
        const categoryLogic = new CategoryLogic(categorySQL, expenseSQL, familySQL, categoryConnection);
        await expect(
            categoryLogic.updateCategory(
                userId,
                imageFile,
                categoryId,
                name,
                description,
                monthlyBudget,
                originalName,
                imageAlreadyUploaded
            )
        ).rejects.toThrowError();

        try {
            throw new FileUploadError();
        } catch (error) {
            expect(error).toBeInstanceOf(FileUploadError);
            expect(error.body()).toStrictEqual({
                errorType: `FILE_UPLOAD_ERROR`,
                message: "Could not upload image",
            });
        }
    });
});

describe("Add category", () => {
    let categorySQL;
    let expenseSQL;
    let familySQL;
    let categoryConnection;
    let categoryMock;

    beforeEach(() => {
        jest.resetModules();
        jest.spyOn(imageUploader, "uploadImage").mockImplementation(() => {});
        categoryMock = {
            id: 1,
        };
        categorySQL = {
            create: jest.fn().mockResolvedValue(categoryMock),
            getCategoryById: jest.fn(),
        };
        expenseSQL = {
            getUserById: jest.fn(),
        };
        familySQL = {};
        categoryConnection = {
            transaction: jest.fn().mockImplementation((callback) => callback()),
        };
    });

    test("should add a category", async () => {
        const userId = 1;
        const imageFile = "image";
        const name = "name";
        const description = "description";
        const monthlyBudget = 100;
        const originalName = "originalName";
        const familyId = 1;

        const categoryLogic = new CategoryLogic(categorySQL, expenseSQL, familySQL, categoryConnection);
        await categoryLogic.createCategory(userId, imageFile, name, description, monthlyBudget, originalName, familyId);
        expect(categorySQL.create).toHaveBeenCalledWith(
            {
                name,
                description,
                image: expect.any(String),
                monthlyBudget,
                familyId,
            },
            { transaction: undefined }
        );
        expect(imageUploader.uploadImage).toHaveBeenCalledWith(imageFile, expect.any(String));
    });

    test("should add a category with no monthly budget", async () => {
        const userId = 1;
        const imageFile = "image";
        const name = "name";
        const description = "description";
        const monthlyBudget = "";
        const originalName = "originalName";
        const familyId = 1;

        const categoryLogic = new CategoryLogic(categorySQL, expenseSQL, familySQL, categoryConnection);
        await categoryLogic.createCategory(userId, imageFile, name, description, monthlyBudget, originalName, familyId);
        expect(categorySQL.create).toHaveBeenCalledWith(
            {
                name,
                description,
                image: expect.any(String),

                monthlyBudget: 0,
                familyId,
            },
            { transaction: undefined }
        );
        expect(imageUploader.uploadImage).toHaveBeenCalledWith(imageFile, expect.any(String));
    });

    test("should throw duplicateError", async () => {
        const userId = 1;
        const imageFile = "image";
        const name = "name";
        const description = "description";
        const monthlyBudget = 100;
        const originalName = "originalName";
        const familyId = 1;

        categorySQL.create.mockRejectedValue(new sequelize.UniqueConstraintError());
        const categoryLogic = new CategoryLogic(categorySQL, expenseSQL, familySQL, categoryConnection);
        await expect(
            categoryLogic.createCategory(userId, imageFile, name, description, monthlyBudget, originalName, familyId)
        ).rejects.toThrowError("A category named 'name' already exists. Please try again.");
        try {
            throw new DuplicateCategoryError("name");
        } catch (e) {
            expect(e.body()).toStrictEqual({
                errorType: `DUPLICATE_CATEGORY_ERROR`,
                message: "A category named 'name' already exists. Please try again.",
            });
        }
    });

    test("should throw validationError", async () => {
        const userId = 1;
        const imageFile = "image";
        const name = "name";
        const description = "description";
        const monthlyBudget = 100;
        const originalName = "originalName";
        const familyId = 1;

        categorySQL.create.mockRejectedValue(new sequelize.ValidationError());
        const categoryLogic = new CategoryLogic(categorySQL, expenseSQL, familySQL, categoryConnection);
        await expect(
            categoryLogic.createCategory(userId, imageFile, name, description, monthlyBudget, originalName, familyId)
        ).rejects.toThrowError("Missing fields: . Please fill all and try again.");
    });

    test("should throw error", async () => {
        const userId = 1;
        const imageFile = "image";
        const name = "name";
        const description = "description";
        const monthlyBudget = 100;
        const originalName = "originalName";
        const familyId = 1;

        categorySQL.create.mockRejectedValue(new Error());
        const categoryLogic = new CategoryLogic(categorySQL, expenseSQL, familySQL, categoryConnection);
        await expect(
            categoryLogic.createCategory(userId, imageFile, name, description, monthlyBudget, originalName, familyId)
        ).rejects.toThrowError();
    });
});

describe("Delete category", () => {
    let categorySQL;
    let expenseSQL;
    let familySQL;
    let categoryConnection;
    let categoryMock;

    beforeEach(() => {
        jest.resetModules();
        categoryMock = {
            id: 1,
        };
        categorySQL = {
            getCategoryById: jest.fn().mockResolvedValue(categoryMock),
            update: jest.fn().mockResolvedValue(categoryMock),
        };
        expenseSQL = {
            getUserById: jest.fn(),
        };
        familySQL = {};
        categoryConnection = {
            transaction: jest.fn().mockImplementation((callback) => callback()),
        };
    });

    test("should delete a category", async () => {
        const userId = 1;
        const categoryId = 1;

        const categoryLogic = new CategoryLogic(categorySQL, expenseSQL, familySQL, categoryConnection);
        await categoryLogic.deleteCategory(userId, categoryId);
        expect(categorySQL.update).toHaveBeenCalledWith({ active: false }, { where: { id: categoryId } });
    });

    test("should throw error", async () => {
        const userId = 1;
        const categoryId = 1;

        categorySQL.update.mockRejectedValue(new Error());
        const categoryLogic = new CategoryLogic(categorySQL, expenseSQL, familySQL, categoryConnection);
        await expect(categoryLogic.deleteCategory(userId, categoryId)).rejects.toThrowError();
    });
});

describe("Get categories", () => {
    let categorySQL;
    let expenseSQL;
    let familySQL;
    let categoryConnection;
    let categoryMock;

    beforeEach(() => {
        jest.resetModules();
        categoryMock = {
            id: 1,
        };
        categorySQL = {
            findAll: jest.fn().mockResolvedValue(categoryMock),
        };
        expenseSQL = {
            getUserById: jest.fn(),
        };
        familySQL = {};
        categoryConnection = {
            transaction: jest.fn().mockImplementation((callback) => callback()),
        };
    });

    test("should get categories", async () => {
        const familyId = 1;
        const page = 1;
        const pageSize = 10;

        const categoryLogic = new CategoryLogic(categorySQL, expenseSQL, familySQL, categoryConnection);
        await categoryLogic.getCategories(familyId, page, pageSize);
        expect(categorySQL.findAll).toHaveBeenCalledWith(
            expect.objectContaining({
                attributes: ["id", "name", "description", "image", "monthlyBudget"],
                where: { familyId, active: true },
                limit: 10,
                offset: 10,
            })
        );
    });

    test("should get categories without pagination", async () => {
        const familyId = 1;

        const categoryLogic = new CategoryLogic(categorySQL, expenseSQL, familySQL, categoryConnection);
        await categoryLogic.getCategories(familyId);
        expect(categorySQL.findAll).toHaveBeenCalledWith(
            expect.objectContaining({
                where: { familyId, active: true },
            })
        );
    });

    test("should throw error", async () => {
        const familyId = 1;
        const page = 1;
        const pageSize = 10;

        categorySQL.findAll.mockRejectedValue(new Error());
        const categoryLogic = new CategoryLogic(categorySQL, expenseSQL, familySQL, categoryConnection);
        await expect(categoryLogic.getCategories(familyId, page, pageSize)).rejects.toThrowError();
    });
});

describe("Get category expenses by month", () => {
    let categorySQL;
    let expenseSQL;
    let familySQL;
    let categoryConnection;
    let expenseMock;

    beforeEach(() => {
        jest.resetModules();
        expenseMock = {
            id: 1,
        };
        categorySQL = {};
        expenseSQL = {
            findAll: jest.fn().mockResolvedValue(expenseMock),
        };
        familySQL = {};
        categoryConnection = {
            transaction: jest.fn().mockImplementation((callback) => callback()),
        };
    });

    test("should get category expenses by month", async () => {
        const categoryId = 1;
        const familyId = 1;

        const categoryLogic = new CategoryLogic(categorySQL, expenseSQL, familySQL, categoryConnection);
        await categoryLogic.getCategoryExpensesByMonth(categoryId, familyId);
        expect(expenseSQL.findAll).toHaveBeenCalledWith(
            expect.objectContaining({
                attributes: [
                    [sequelize.fn("MONTH", sequelize.col("producedDate")), "month"],
                    [sequelize.fn("sum", sequelize.col("amount")), "total"],
                ],
                where: { categoryId },
                group: [sequelize.fn("MONTH", sequelize.col("producedDate"))],
            })
        );
    });

    test("should throw error", async () => {
        const categoryId = 1;
        const familyId = 1;

        expenseSQL.findAll.mockRejectedValue(new Error());
        const categoryLogic = new CategoryLogic(categorySQL, expenseSQL, familySQL, categoryConnection);
        await expect(categoryLogic.getCategoryExpensesByMonth(categoryId, familyId)).rejects.toThrowError();
    });
});

describe("Get categories count", () => {
    let categorySQL;
    let expenseSQL;
    let familySQL;
    let categoryConnection;
    let categoryMock;

    beforeEach(() => {
        jest.resetModules();
        categoryMock = {
            id: 1,
        };
        categorySQL = {
            count: jest.fn().mockResolvedValue(categoryMock),
        };
        expenseSQL = {
            getUserById: jest.fn(),
        };
        familySQL = {};
        categoryConnection = {
            transaction: jest.fn().mockImplementation((callback) => callback()),
        };
    });

    test("should get categories count", async () => {
        const familyId = 1;

        const categoryLogic = new CategoryLogic(categorySQL, expenseSQL, familySQL, categoryConnection);
        await categoryLogic.getCategoriesCount(familyId);
        expect(categorySQL.count).toHaveBeenCalledWith(
            expect.objectContaining({
                where: { familyId },
            })
        );
    });

    test("should throw error", async () => {
        const familyId = 1;

        categorySQL.count.mockRejectedValue(new Error());
        const categoryLogic = new CategoryLogic(categorySQL, expenseSQL, familySQL, categoryConnection);
        await expect(categoryLogic.getCategoriesCount(familyId)).rejects.toThrowError();
    });
});

describe("Get categories expenses by period", () => {
    let categorySQL;
    let expenseSQL;
    let familySQL;
    let categoryConnection;
    let expenseMock;

    beforeEach(() => {
        jest.resetModules();
        expenseMock = {
            id: 1,
        };
        categorySQL = {};
        expenseSQL = {
            findAll: jest.fn().mockResolvedValue(expenseMock),
        };
        familySQL = {};
        categoryConnection = {
            transaction: jest.fn().mockImplementation((callback) => callback()),
        };
    });

    test("should get categories expenses by period", async () => {
        const familyId = 1;
        const startDate = new Date().toISOString();
        const endDate = new Date().toISOString();

        const categoryLogic = new CategoryLogic(categorySQL, expenseSQL, familySQL, categoryConnection);
        await categoryLogic.getCategoriesExpensesByPeriod(familyId, startDate, endDate);
        expect(expenseSQL.findAll).toHaveBeenCalledWith(
            expect.objectContaining({
                attributes: ["categoryId", [sequelize.fn("sum", sequelize.col("amount")), "total"]],
                include: [
                    {
                        model: categorySQL,
                        attributes: ["name"],
                        where: { familyId },
                    },
                ],
                group: ["categoryId"],
                where: {
                    producedDate: {
                        [sequelize.Op.between]: [parseDate(startDate), parseDate(endDate)],
                    },
                },
            })
        );
    });

    test("should throw error", async () => {
        const familyId = 1;
        const startDate = "2020-01-01";
        const endDate = "2020-01-01";

        expenseSQL.findAll.mockRejectedValue(new Error());
        const categoryLogic = new CategoryLogic(categorySQL, expenseSQL, familySQL, categoryConnection);
        await expect(categoryLogic.getCategoriesExpensesByPeriod(familyId, startDate, endDate)).rejects.toThrowError();
    });
});
