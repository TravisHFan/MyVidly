const { User } = require("../../../models/user");
const jwt = require("jsonwebtoken");
const config = require("config");
const mongoose = require("mongoose");

describe("user.generateAuthToken", () => {
  it("should return a valid JWT", () => {
    const payload = {
      _id: new mongoose.Types.ObjectId(),
      isAdmin: true,
    };
    const user = new User(payload);
    const token = user.generateAuthToken();
    const decoded = jwt.verify(token, config.get("jwtPrivateKey"));
    //expect(decoded).toMatchObject(payload);

    // 因为 token 里保存的是字符串 id，这里做格式统一
    expect(decoded).toMatchObject({
      _id: payload._id.toHexString(),
      isAdmin: payload.isAdmin,
    });
    /* 你的原写法靠 Jest 宽松容忍 勉强能过；
    我的写法是完全类型对齐的 精确匹配，更健壮、可维护、可移植性好。 */
  });
});
