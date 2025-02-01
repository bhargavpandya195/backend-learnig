// Custom Error class that extends the built-in Error class
class ApiError extends Error {
  
 
  constructor(
    statusCode,          
    message = "An error occurred",  
    errors = [],         
    stack = ""         
  ) {
    super(message);  

  
    this.statusCode = statusCode; 
    this.errors = errors;          
    this.success = false;          
    this.stack = stack;            
   
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor); 
    }
  }
}

export { ApiError };
