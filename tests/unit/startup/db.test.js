// Unit tests for startup/db.js

const mongoose = require("mongoose");
const winston = require("winston");
const config = require("config");
const dbInit = require("../../../startup/db");

describe("startup/db", () => {
  let connectMock;
  let getMock;
  let infoMock;

  beforeEach(() => {
    //模拟依赖行为
    connectMock = jest.spyOn(mongoose, "connect").mockResolvedValue();
    getMock = jest
      .spyOn(config, "get")
      .mockReturnValue("mongodb://localhost/testdb");
    infoMock = jest.spyOn(winston, "info").mockImplementation(() => {});
    /* spyOn(mongoose, "connect")：监听并替换 mongoose.connect，模拟它成功连接且不实际访问数据库。
    spyOn(config, "get")：拦截 config.get()，始终返回 "mongodb://localhost/testdb"。
    spyOn(winston, "info")：监听日志输出并禁止实际打印。 
    这样就隔离了外部依赖，测试变得可控。
    */
  });

  afterEach(() => {
    jest.restoreAllMocks(); //撤销你在测试中做的这些“假替身”。恢复所有通过 jest.spyOn() 或
    // jest.mock() 创建的 mock，对象和方法将被还原至初始状态，防止一个测试的 mock 干扰下一个测试。
    process.env.NODE_ENV = "test";
    //测试可能在中途修改了 NODE_ENV（如将其设置为 "development"），这行代码确保在每个测试结束后，
    // 都将环境变量重置回 "test"，保证其它测试逻辑基于统一环境进行。
  });

  it("should connect and log when NODE_ENV is not test", async () => {
    process.env.NODE_ENV = "development";
    await dbInit();
    expect(connectMock).toHaveBeenCalledWith("mongodb://localhost/testdb");
    expect(infoMock).toHaveBeenCalledWith(
      "Connected to mongodb://localhost/testdb..."
    );
  });

  it("should not connect when NODE_ENV is test", async () => {
    process.env.NODE_ENV = "test";
    await dbInit();
    expect(connectMock).not.toHaveBeenCalled();
    expect(infoMock).not.toHaveBeenCalled();
  });
});
