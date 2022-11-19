const ExpenseLogic = require("../businessLogic/expenseLogic");
const imageUploader = require("../library/imageUploader");

describe("Create new expense", () => {
    test("Should create new expense", async () => {
        let receivedImageFile = undefined;
        let receivedImageKey = undefined;
        jest.spyOn(imageUploader, "uploadImage").mockImplementation((imageFile, imageKey) => {
            receivedImageFile = imageFile;
            receivedImageKey = imageKey;
        });
        const userId = 1;
        const amount = 100;
        const producedDate = new Date().toISOString();
        const registeredDate = producedDate;
        const categoryId = 1;
        const description = "Test description";
        const imageFile = "Test image file";
        const originalName = "Test original name";
        const newExpense = {
            id: 1,
            amount,
            producedDate,
            description,
            imageKey: "Test original name",
        };
        const expenseSQL = {
            create: jest.fn().mockResolvedValue(newExpense),
            sequelize: {
                query: jest.fn().mockResolvedValue([[{ id: 1 }]]),
            },
        };
        const categorySQL = {
            getCategoryById: jest.fn(),
        };
        const userSQL = {
            getUserById: jest.fn(),
        };
        const familySQL = {};
        let transactionFun = undefined;
        const expenseConnection = {
            transaction: jest.fn().mockImplementation((fun) => {
                transactionFun = fun;
                return newExpense;
            }),
        };
        const expenseLogic = new ExpenseLogic(expenseSQL, categorySQL, userSQL, familySQL, expenseConnection);

        await expenseLogic.createExpense(amount, producedDate, categoryId, userId, description, imageFile, originalName);
        await transactionFun();
        expect(receivedImageFile).toBe(imageFile);
        expect(receivedImageKey.includes("Test original name")).toBe(true);
        const imageLink = "https://undefined.s3.amazonaws.com/" + receivedImageKey;
        expect(expenseSQL.create).toHaveBeenCalledWith(
            expect.objectContaining({
                amount,
                producedDate: new Date(producedDate),
                categoryId,
                userId,
                description,
                image: imageLink,
            }),
            { transaction: undefined }
        );
    });
});
