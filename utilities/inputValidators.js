const InputValidationError = require("../utilities/InputValidationError");

class WordValidator {
    static validate = (input, fieldName, length) => {
        const regex = new RegExp(`^[a-zA-Z0-9][a-zA-Z0-9 ]{0,${length - 1}}$`);
        if (!regex.test(input))
            throw new InputValidationError(`Please enter a non-empty ${fieldName} containing only letters, numbers or spaces with maximum length of ${length}!`);
    }
}

class ParagraphValidator {
    static validate = (input, fieldName, length) => {
        const regex = new RegExp(`^[a-zA-Z0-9][a-zA-Z0-9 .,]{0,${length - 1}}$`);
        if (!regex.test(input))
            throw new InputValidationError(`Please enter a non-empty ${fieldName} containing only letters, numbers, spaces or (","/".") with maximum length of ${length}!`);
    }
}

class NumberValidator {
    static validate = (input, fieldName, length) => {
        const regex = new RegExp(`^(?:(?:[0-9])|(?:[1-9][0-9]{0,4}))$`);
        if (!regex.test(input))
            throw new InputValidationError(`Please enter a non-empty ${fieldName} containing only ${length} digits!`);
    }
}

class EmailValidator {
    static validate = (input) => {
        const regex = new RegExp(`^[^ ]+@[^ ]+\.[^ ]+$`);
        console.log(input, regex)
        if (!regex.test(input))
            throw new InputValidationError(`Please enter a valid email!`);
    }
}

class PasswordValidator {
    static validate = (input) => {
        const regex = new RegExp(`^[^ ]{4,64}$`);
        if (!regex.test(input))
            throw new InputValidationError(`Please enter a password between 4 and 64 characters (letters, numbers or symbols)!`);
    }
}
module.exports = { WordValidator, ParagraphValidator, NumberValidator, EmailValidator, PasswordValidator };