const InputValidationError = require("../../errors/inputValidationError");

class NumberValidator {
    static validate = (input, fieldName, length) => {
        console.log(input);
        const regex = new RegExp(`^(?:(?:[0-9])|(?:[1-9][0-9]{0,${length}}))$`);
        if (!regex.test(input))
            throw new InputValidationError(
                `Please enter a non-empty ${fieldName} containing a maximum of ${length} digits!`
            );
    };
}

module.exports = NumberValidator;