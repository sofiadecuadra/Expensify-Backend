const InputValidationError = require("../../errors/inputValidationError");

class InArrayValidator {
    static validate = (input, fieldName, array) => {
        if (!array.includes(input))
            throw new InputValidationError(`Please enter a valid ${fieldName} from the list [${array}]!`);
    };
}

module.exports = InArrayValidator;