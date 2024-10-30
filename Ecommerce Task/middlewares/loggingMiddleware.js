const morgan = require('morgan');
const logger = require("../utils/logger"); 
// Morgan format for HTTP requests
const morganFormat = ":method :url :status :response-time ms";

const loggingMiddleware = (app) => {
  // Log HTTP requests using morgan and Winston
  app.use(
    morgan(morganFormat, {
      stream: {
        write: (message) => {
          // Parse log message and structure it as an object
          const logObject = {
            method: message.split(" ")[0],
            url: message.split(" ")[1],
            status: message.split(" ")[2],
            responseTime: message.split(" ")[3],
          };
          logger.info(JSON.stringify(logObject));
        },
      },
    })
  );
};

module.exports = loggingMiddleware;
