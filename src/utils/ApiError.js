class ApiError extends Error {
   constructor(
    statusCode,
    message = "someething went wrong",
    errors = [],
    stack = "" //stack answers -> When something breaks, what error happened, which file and line caused it and which function
    //we called before it creashed//
   ){
     super(message)
     this.statusCode = statusCode
     this.data = null
     this.message = message
     this.success = false
     this.errors = errors

     if(stack)
     {
        this.stack = stack  // if there is a custom stack, use it
     } else {
        Error.captureStackTrace(this, this.constructor); // else automatically create the current stack trace for error objext
 
     }
   }
}

export {ApiError}