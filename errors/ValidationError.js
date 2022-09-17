const HTTPRequestError = require('./HttpRequestError');

class ValidationError extends HTTPRequestError {
    StatusCode = 400;

    constructor(missingFieldsArray) {
        super();
        let missingFields = '';
        missingFieldsArray.forEach(element => {
            missingFields += element.path + ', ';
        });
        if (missingFields.length > 0) {
            missingFields = missingFields.substring(0, missingFields.length - 2);
        }
        this.message = `Missing fields: ${missingFields}. Please fill all and try again.`;
    }

    body() {
        return {
            errorType: `Validation error`,
            message: this.message,
        };
    }
}

module.exports = ValidationError;