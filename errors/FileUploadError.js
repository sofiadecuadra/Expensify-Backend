const HTTPRequestError = require('./HttpRequestError');

class FileUploadError extends HTTPRequestError {
    StatusCode = 500;

    constructor(category) {
        super();
        this.message = `Could not upload image for category' ${category}'.`;
    }

    body() {
        return {
            ErrorType: `FILE_UPLOAD_ERROR`,
            Message: this.message,
        };
    }
}

module.exports = FileUploadError;