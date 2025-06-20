const winston = require("winston");
const error = require("../../../middleware/error");

describe("error middleware", () => {
  it("should log the error and return 500", () => {
    const err = new Error("my error"); // 模拟一个错误对象
    const req = {}; // req 对象不使用，所以传空对象
    const res = {
      status: jest.fn().mockReturnThis(), // mock res.status() 可链式调用
      send: jest.fn(), // mock res.send()
    };
    const next = jest.fn(); // next 函数虽然传入了，但此测试中不会被调用

    winston.error = jest.fn(); // 替换真实的 winston.error 为 mock 函数

    error(err, req, res, next); //模拟 Express 在发生错误时调用中间件的过程。

    expect(winston.error).toHaveBeenCalledWith(err.message, err);
    //验证日志记录函数是否以正确的参数被调用。
    expect(res.status).toHaveBeenCalledWith(500); //验证是否设置了 500 状态码。
    expect(res.send).toHaveBeenCalledWith("Something failed."); //验证是否发送了预期的通用错误信息。
  });
});
