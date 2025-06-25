console.log("🚀 app.js 开始执行");
const express = require("express");
const app = express();

//require("./startup/logging")();
console.log("✅ 加载 routes...");
require("./startup/routes")(app);
console.log("✅ 加载 db...");
require("./startup/db")();
console.log("✅ 加载 config...");
require("./startup/config")();
console.log("✅ 加载 Joi 扩展...");
require("./startup/addJoiObjIdValidation")();
console.log("✅ 加载 prod 配置...");
require("./startup/prod")(app);

module.exports = app;
