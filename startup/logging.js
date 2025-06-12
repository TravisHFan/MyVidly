const winston = require("winston");
//require("winston-mongodb"); //副作用导入（side-effect import）
require("express-async-errors");

module.exports = function () {
  winston.exceptions.handle(
    new winston.transports.File({ filename: "uncaughtExceptions.log" })
  );

  process.on("unhandledRejection", (ex) => {
    throw ex;
  });

  winston.add(new winston.transports.File({ filename: "logfile.log" }));
  if (process.env.NODE_ENV !== "production") {
    winston.add(
      new winston.transports.Console({ format: winston.format.simple() })
    );
  }
  // winston.add(new winston.transports.MongoDB, {
  //   db: "mongodb://localhost/vidly",
  //   level: "info",
  // });
};

/* 典型的 Node.js 项目中的日志系统初始化文件，通常位于 startup/logging.js，
用于统一配置 Winston 日志记录器，并处理未捕获的异常和未处理的 Promise 拒绝。

代码解释：

require('express-async-errors');
  这是一个非常实用的库，让你可以在 Express 的 async 路由中直接抛错：

  app.get('/', async (req, res) => {
    throw new Error('Something failed');  // 无需 try/catch
  });
  这个模块会自动捕获 async 错误并传给 Express 的错误处理中间件。
  logger.js 中的主体逻辑并不使用 express-async-errors，但通过 
  require('express-async-errors') 的副作用，确保你抛出的 async 错误
  会进入 Winston 的记录流程 —— 所以它们是协同工作的，但不直接耦合。

    logger.js 中的 require('express-async-errors') 是 副作用导入；
    它并不为 logger.js 提供任何导出的变量或函数；
    它不是为 logger.js 服务，而是为整个 Express 应用服务；
    放在 logger.js 是一种习惯：因为它跟“错误处理”逻辑有关系，和 Winston 配套放置逻辑上更合理。


✅ 核心部分：
module.exports = function() { ... }
  这是一个初始化函数，通常在 index.js 中通过如下方式调用：
  require('./startup/logging')();

winston.handleExceptions(
  new winston.transports.File({ filename: 'uncaughtExceptions.log' })
);
  捕获 未被 try/catch 包裹的同步异常（如 throw new Error()）
  并将其记录到本地文件：uncaughtExceptions.log

  注意：这只处理同步代码中的异常

process.on('unhandledRejection', (ex) => {
  throw ex;
});
  捕获未被 catch 的 Promise 错误（即 unhandledRejection）
  将其 手动 re-throw，让 winston.handleExceptions 也能捕捉到
  这是一种技巧性的写法，让同步和异步错误都统一交由 Winston 处理。

winston.add(winston.transports.File, { filename: 'logfile.log' });
  将日志记录到本地文件 logfile.log 中，用于常规 info/error 等日志：

  winston.info('Something happened...');
  winston.error(err.message, err);

winston.add(winston.transports.MongoDB, { 
  db: 'mongodb://localhost/vidly',
  level: 'info'
});
  把日志也保存到 MongoDB 中：

  保存等级为 info 及以上的日志

  存储在指定数据库的 log 集合中（默认集合名是 log，可以自定义）




*/
