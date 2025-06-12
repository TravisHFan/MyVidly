const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const config = require("config");

// 全局 Mongo 内存实例
let mongoServer;

beforeAll(async () => {
  // 启动 mongodb-memory-server
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();

  // 连接 mongoose 到内存数据库
  await mongoose.connect(mongoUri);

  // 强制覆盖 config 里的 db 配置，防止使用真实数据库
  config.db = mongoUri;
});

beforeEach(async () => {
  // 清空所有 collection，确保每个测试完全干净
  const collections = await mongoose.connection.db.collections();
  for (let collection of collections) {
    await collection.deleteMany();
  }
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

/* 👉 说明：

每个测试文件共享一个全新的内存数据库；

所有 collection 每次 beforeEach 自动清空；

所有 deleteMany()、dropDatabase() 逻辑可以全部删掉了；

不会污染你的真实 vidly_test 数据库 ✅ */
