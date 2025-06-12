const config = require("config");

module.exports = function () {
  if (!config.get("jwtPrivateKey")) {
    throw new Error("FATAL ERROR: jwtPrivateKey is not defined.");
  }
};

/* 这个文件是用来验证配置是否完整、关键项是否存在的。 
它的作用是：
在项目启动时检查某些关键配置项是否已经设置（如 jwtPrivateKey），如果没有设置，
则立刻抛出错误，防止项目运行在不安全或未配置的状态下。*/
