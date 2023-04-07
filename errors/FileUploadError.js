const HTTPRequestError = require('./HttpRequestError');

class FileUploadError extends HTTPRequestError {
    StatusCode = 500;

    constructor() {
        super();
        this.message = `Could not upload image`;
    }

    body() {
        return {
            errorType: `FILE_UPLOAD_ERROR`,
            message: this.message,
        };
    }
}

module.exports = FileUploadError;