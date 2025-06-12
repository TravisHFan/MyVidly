const winston = require("winston");
const mongoose = require("mongoose");
const config = require("config");

module.exports = async function () {
  if (process.env.NODE_ENV !== "test") {
    const db = config.get("db");
    await mongoose
      .connect(db)
      .then(() => winston.info(`Connected to ${db}...`));
  }
}; //info() 是 Winston 的方法之一，表示“普通级别”的日志。
