const InputValidationError = require("../../errors/inputValidationError");

class ParagraphValidator {
    static validate = (input, fieldName, length) => {
        const regex = new RegExp(`^[a-zA-Z0-9][a-zA-Z0-9 .,]{0,${length - 1}}$`);
        if (!regex.test(input))
            throw new InputValidationError(
                `Please enter a non-empty ${fieldName} containing only letters, numbers, spaces or (","/".") with maximum length of ${length}!`
            );
    };
}

module.exports = ParagraphValidator;