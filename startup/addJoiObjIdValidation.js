const Joi = require("joi");

module.exports = function () {
  Joi.objectId = require("joi-objectid")(Joi);
};

/* 这段代码的作用是：给 Joi 增加对 MongoDB ObjectId 的验证支持。

const Joi = require('joi');
引入 joi 模块 —— 一个常用于 Node.js 中的 对象验证库。
Joi 本身支持常见类型验证：string、number、boolean、array 等。

require('joi-objectid')(Joi);
引入第三方扩展包 joi-objectid，用于验证 MongoDB 的 ObjectId。

它是一个函数，接收 Joi 作为参数，并返回一个可以用来验证 ObjectId 的函数。

Joi.objectId = ...;
把 joi-objectid 注册成 Joi.objectId，添加一个新的验证类型。
目的：让你之后可以这样写验证规则：

const schema = Joi.object({
  customerId: Joi.objectId().required(),
  movieId: Joi.objectId().required()
});
否则 Joi 默认是没有 objectId() 这个方法的。


✅ 为什么要这样写在一个函数里？
因为这是一个初始化行为，你可以在项目启动阶段执行一次，例如：

// 在 index.js 中使用
require('./startup/validation')();  // 让 Joi 增加 objectId 支持
这样你在项目其他地方就可以放心用 Joi.objectId() 了。
*/
