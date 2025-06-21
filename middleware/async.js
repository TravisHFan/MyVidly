/* module.exports = function (handler) {
  return async (req, res, next) => {
    try {
      await handler(req, res);
    }
    catch(ex) {
      next(ex);
    }
  };  
} */

/* middleware/async.js exports a helper that wraps an async route handler in a try/catch block
However, none of the route files require or use this helper. Instead, the project imports 
express-async-errors in startup/logging.js, which automatically forwards any uncaught async 
errors to Express’s error handler:

const winston = require("winston");
//require("winston-mongodb"); // side-effect import
require("express-async-errors");

Because express-async-errors already intercepts asynchronous exceptions, the custom wrapper 
in middleware/async.js is redundant and unused. Thus, in the current codebase, 
middleware/async.js is effectively useless. */
