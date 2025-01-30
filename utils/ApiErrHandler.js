// Custom Error class that extends the built-in Error class
class ApiError extends Error {
  
    // Constructor for initializing the custom error with specific properties
    constructor(
      statusCode,           // The HTTP status code (e.g., 400, 500)
      message = "An error occurred",  // Default error message
      errors = [],          // Optional array of specific error details (e.g., validation errors)
      slack = ""            // Optional string for sending additional info to Slack or elsewhere
    ) {
      super(message);  // Call the parent class's constructor (Error) to set the error message
  
      // Set custom properties on the error object
      this.statusCode = statusCode;  // Set the HTTP status code (e.g., 404 for not found)
      this.errors = errors;          // Store any specific error details (useful for validation errors)
      this.success = false;          // Default success property is false (indicates failure)
      this.slack = slack;            // Store additional info to be used for debugging or sending to Slack
  
      // If there is a stack trace, include it; otherwise, create one using Error.captureStackTrace
      if (Error.captureStackTrace) {
        Error.captureStackTrace(this, this.constructor); // This adds a stack trace specific to the error
      }
    }
  }
  
  // Export the ApiError class so it can be used elsewhere in the application
  module.exports = ApiError;
  