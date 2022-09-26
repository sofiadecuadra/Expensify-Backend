const InputValidationError = require("../../errors/inputValidationError");

class EmailValidator {
    static validate = (input) => {
        const regex = new RegExp(`^[^ ]+@[^ ]+\.[^ ]+$`);
        if (!regex.test(input)) throw new InputValidationError(`Please enter a valid email!`);
    };
}

module.exports = EmailValidator;