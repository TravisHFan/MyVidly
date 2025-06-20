const authen = require("../middleware/authen");
const bcrypt = require("bcrypt");
const _ = require("lodash");
const { User, validateUser } = require("../models/user");
const express = require("express");
const router = express.Router();
const validate = require("../middleware/validate");

router.get("/me", authen, async (req, res) => {
  const user = await User.findById(req.user._id).select("-password");
  res.send(user);
});

router.post("/", [authen, validate(validateUser)], async (req, res) => {
  let user = await User.findOne({ email: req.body.email });
  if (user) return res.status(400).send("User already registered.");

  user = new User(_.pick(req.body, ["name", "email", "password"]));
  /* Lodash 的 _.pick 方法可以从一个对象中抽取指定的一批属性，返回一个只包含这些属性的新对象，
  不会修改原对象，非常适合用在：
  控制 API 返回或存储的数据字段，只暴露必要信息;
  清理包含敏感数据的对象，便于前端使用或记录日志 */

  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(user.password, salt);
  await user.save();

  const token = user.generateAuthToken();
  res
    .header("x-auth-token", token)
    .send(_.pick(user, ["_id", "name", "email"]));
});

module.exports = router;
