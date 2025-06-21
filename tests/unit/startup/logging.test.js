const winston = require("winston");

describe("startup/logging", () => {
  let capturedHandler;
  let addSpy;
  let formatSpy;

  beforeEach(() => {
    // Intercept process.on to capture the unhandledRejection callback
    jest.spyOn(process, "on").mockImplementation((event, handler) => {
      if (event === "unhandledRejection") capturedHandler = handler;
    });
    /* capturedHandler 是整个测试里最关键的变量之一，它的作用是：
    🔹捕获 process.on("unhandledRejection", handler) 中注册的 handler 函数，方便在测试中手动调用它。

    背景知识：process.on("unhandledRejection", handler)
    Node.js 中，当某个 Promise 被 reject 但没有 .catch() 捕获时，Node 会触发 unhandledRejection 事件。

    process.on("unhandledRejection", (ex) => {
    throw ex;  // 比如这是你在 logging.js 中的逻辑
    });
    这个 (ex) => { throw ex; } 就是一个“事件处理器”，你测试中就叫它 handler。

    这个 mock 的意思是：当你的 logging.js 代码中执行 process.on("unhandledRejection", someFunction) 时，
    它不会真的注册事件处理器，而是把那个 someFunction 存进了 capturedHandler 变量里。
    这样你就可以在测试里直接调用这个函数了。

    const error = new Error("test");
    capturedHandler(error); // 相当于手动触发一个未处理的 Promise 异常
    */

    //mock 所有 winston 的方法，防止真的创建日志文件或向控制台输出。
    jest.spyOn(winston.exceptions, "handle").mockImplementation(() => {}); // 用匿名函数替代原方法
    addSpy = jest.spyOn(winston, "add").mockImplementation(() => {});
    jest.spyOn(winston.transports, "File").mockImplementation(jest.fn()); // 用 jest.fn() 替代原方法
    jest
      .spyOn(winston.transports, "Console")
      .mockImplementation(function (opts) {
        this.format = opts.format;
        return this;
      });
    formatSpy = jest
      .spyOn(winston.format, "simple")
      .mockReturnValue({ mocked: true });

    /* 虽然这两种写法在行为上基本等价，但使用方式略有不同，背后的目的也可能不同。
    jest.fn() 是一个可以追踪调用情况的 mock 函数。
    jest.fn() 返回一个 mock 函数对象，可以记录：
    调用了几次（.mock.calls.length）
    每次调用传了什么参数（.mock.calls）
    返回了什么结果（.mock.results）
    是否被调用过（.toHaveBeenCalled() 等断言）

    而() => {}仅用于避免真实执行、不关心调用细节
 */
  });

  afterEach(() => {
    jest.restoreAllMocks(); // 恢复原始行为
    jest.resetModules(); // 清除 require 缓存，确保下次 require 是干净的
    process.env.NODE_ENV = "test";
  });

  it("should rethrow unhandled promise rejections", () => {
    const loggingInit = require("../../../startup/logging");
    loggingInit(); // 初始化日志系统

    expect(capturedHandler).toBeDefined(); //确保确实注册了 unhandledRejection 的处理器
    const error = new Error("test");
    expect(() => capturedHandler(error)).toThrow(error); //测试重点：验证 capturedHandler 会抛出这个异常
  });

  it("should add console transport when not in production", () => {
    process.env.NODE_ENV = "development";
    const loggingInit = require("../../../startup/logging");
    loggingInit();

    expect(addSpy).toHaveBeenCalledWith(
      expect.objectContaining({ format: { mocked: true } })
    );
  });

  it("should not add console transport in production", () => {
    process.env.NODE_ENV = "production";
    const loggingInit = require("../../../startup/logging");
    loggingInit();

    expect(addSpy).not.toHaveBeenCalledWith(
      expect.objectContaining({ format: { mocked: true } })
    );
  });
});
