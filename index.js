require("./startup/logging")();
const winston = require("winston"); //this default logger comes with one transport and that is for log in messages in the console
const app = require("./app");

const port = process.env.PORT || 3000;
const server = app.listen(port, () =>
  winston.info(`Listening on port ${port}...`)
);

module.exports = server;
