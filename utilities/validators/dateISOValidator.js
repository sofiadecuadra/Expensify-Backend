const InputValidationError = require("../../errors/inputValidationError");

class ISODateValidator {
    static validate = (input, fieldName) => {
        const regex = new RegExp("^\\d{4}-\\d\\d-\\d\\dT\\d\\d:\\d\\d:\\d\\d.\\d\\d\\dZ$");
        if (!regex.test(input)) throw new InputValidationError(`Please enter a valid ${fieldName} in ISO format!`);
    };
}

module.exports = ISODateValidator;