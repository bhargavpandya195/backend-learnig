class ApiResponse {
    constructor(statusCode, data, message = "Success") {
        this.statusCode = statusCode;
        this.message = message;
        this.data = data;
        // The success flag should be true if statusCode < 400 (success response), false otherwise
        this.success = statusCode < 400;
    }
}

export { ApiResponse };
