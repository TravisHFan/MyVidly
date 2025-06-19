const { User } = require("../../../models/user"); // Ensure User model is loaded
const authen = require("../../../middleware/authen"); // Adjust the path as necessary
const mongoose = require("mongoose");

//你造一个合法 token，塞进 mock request，调用 middleware，验证 middleware 是否把 token 正确 decode
// 并写入 req.user。这就是标准的 Express middleware 单元测试模式。
describe("authen middleware", () => {
  //创建一个测试套件，名字叫 autho middleware。
  it("should populate req.user with the payload of a valid JWT", async () => {
    const user = {
      //创建一个模拟用户。创建这个 user 是为了模拟 payload。
      _id: new mongoose.Types.ObjectId().toHexString(),
      //因为 jwt.sign() 通常会把 _id 存为字符串，所以用 .toHexString() 预先格式化成字符串，避免类型不匹配。
      isAdmin: true,
    };
    const token = new User(user).generateAuthToken();
    //new User(user) 不是从数据库取数据，而是你直接手动构造一个模拟 Mongoose document，拿来调用实例方法。

    const req = {
      /* ✅ 伪造 Express 的 req 对象：
        autho 中的代码会调用：req.header('x-auth-token')
        所以你 mock 了 req.header() 函数：
        jest.fn()：创建一个可监控的 mock 函数；
        .mockReturnValue(token)：告诉它永远返回你生成的 token。
        👉 这一段非常经典，是单元测试中 req mock 的标准写法。 */

      header: jest.fn().mockReturnValue(token),
    };

    //const res = {};
    /* ✅ 伪造 res：
    因为你这次测试只关注 "token 正确时" 的逻辑，所以：
    根本不会进入 res.status() 逻辑；
    你暂时不需要 mock res，空对象足够。
    （但严格来说，真实工程中最好统一 mock res，防止其他测试报错） */

    // 更健壮一点的 res mock，防止未来中间件逻辑扩展
    const res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };

    const next = jest.fn();
    /* ✅ 伪造 next() 函数：
    Express 中间件最后会调用 next()；
    你用 jest.fn() 伪造一个可观察的 next，但你这次测试里其实没用上 next 断言。 */

    authen(req, res, next);
    /* 执行你要测试的中间件：
    直接调用 authen()；
    传入你伪造好的 req、res、next；
    中间件逻辑会从 req.header() 取出 token，验证解码，设置 req.user。 */

    expect(req.user).toMatchObject(user);
  });
});
