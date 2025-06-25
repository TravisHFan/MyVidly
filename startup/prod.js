const helmet = require("helmet");
const compression = require("compression");

module.exports = function (app) {
  // 使用 Helmet 中间件来设置 HTTP 头部，增强安全性
  app.use(helmet());

  // 使用 compression 中间件来压缩响应体，提高性能
  app.use(compression());

  // 可以在这里添加其他生产环境特有的中间件或配置
};
