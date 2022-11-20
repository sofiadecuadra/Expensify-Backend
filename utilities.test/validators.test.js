const NumberValidator = require("../utilities/validators/numberValidator");
const ISODateValidator = require("../utilities/validators/dateISOValidator");
const WordValidator = require("../utilities/validators/wordValidator");
const ParagraphValidator = require("../utilities/validators/paragraphValidator");
const InputValidationError = require("../errors/inputValidationError");
const PasswordValidator = require("../utilities/validators/passwordValidator");
const EmailValidator = require("../utilities/validators/emailValidator");

describe("numberValidator", () => {
    describe("validate", () => {
        test("should return", () => {
            NumberValidator.validate("1", "test", 1);
        });

        test("should throw", () => {
            expect(() => NumberValidator.validate("test", "test", 1)).toThrow();
        });
    });
});

describe("isoDateValidator", () => {
    describe("validate", () => {
        test("should return", () => {
            ISODateValidator.validate("2021-10-10T10:10:10.000Z", "test");
        });

        test("should throw", () => {
            expect(() => ISODateValidator.validate("test", "test")).toThrow();
        });
    });
});

describe("wordValidator", () => {
    describe("validate", () => {
        test("should return", () => {
            WordValidator.validate("test", "test", 10);
        });

        test("should throw", () => {
            expect(() => WordValidator.validate("te*(&#$)st test", "test", 1)).toThrow();
        });
    });
});

describe("paragraphValidator", () => {
    describe("validate", () => {
        test("should return", () => {
            ParagraphValidator.validate("test", "test", 100);
        });

        test("should throw", () => {
            expect(() => ParagraphValidator.validate("test test", "test", 1)).toThrow();
        });
    });
});

describe("passwordValidator", () => {
    describe("validate", () => {
        test("should return", () => {
            PasswordValidator.validate("test");
        });

        test("should throw", () => {
            expect(() => PasswordValidator.validate("test test")).toThrow();
        });
    });
});

describe("emailValidator", () => {
    describe("validate", () => {
        test("should return", () => {
            EmailValidator.validate("test@test.com");
        });

        test("should throw", () => {
            expect(() => EmailValidator.validate("test")).toThrow();
        });
    });
});
