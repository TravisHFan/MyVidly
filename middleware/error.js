const winston = require("winston");

module.exports = function (err, req, res, next) {
  winston.error(err.message, err);

  // error
  // warn
  // info
  // verbose
  // debug
  // silly

  res.status(500).send("Something failed.");
};

/* 
我们在routes.js中注册了这个中间件，所以会被“自动运行”

这个中间件的特征是参数有 4 个（err, req, res, next），Express 会自动识别这是一个“错误处理中间件”。
*/
