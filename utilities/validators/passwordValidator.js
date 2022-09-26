const InputValidationError = require("../../errors/inputValidationError");

class PasswordValidator {
    static validate = (input) => {
        const regex = new RegExp(`^[^ ]{4,64}$`);
        if (!regex.test(input))
            throw new InputValidationError(
                `Please enter a password between 4 and 64 characters (letters, numbers or symbols)!`
            );
    };
}

module.exports = PasswordValidator; 