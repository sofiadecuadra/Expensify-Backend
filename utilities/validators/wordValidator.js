const InputValidationError = require("../../errors/inputValidationError");

class WordValidator {
    static validate = (input, fieldName, length) => {
        const regex = new RegExp(`^[a-zA-Z0-9][a-zA-Z0-9 ]{0,${length - 1}}$`);
        if (!regex.test(input))
            throw new InputValidationError(
                `Please enter a non-empty ${fieldName} containing only letters, numbers or spaces with maximum length of ${length}!`
            );
    };
}

module.exports = WordValidator;