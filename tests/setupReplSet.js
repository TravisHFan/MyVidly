const mongoose = require("mongoose");
//const { MongoMemoryServer } = require("mongodb-memory-server");
const { MongoMemoryReplSet } = require("mongodb-memory-server");
const config = require("config");

// 全局 Mongo 内存实例
let mongoServer;

beforeAll(async () => {
  // 启动 mongodb-memory-server
  //mongoServer = await MongoMemoryServer.create();

  // 启动 mongodb-memory-server 的 replSet，以便支持事务
  mongoServer = await MongoMemoryReplSet.create({ replSet: { count: 1 } });
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

/* 原先是通过 MongoMemoryServer.create() 启动一个单节点的内存 MongoDB 实例。
修改后的代码改为使用 MongoMemoryReplSet.create({ replSet: { count: 1 } }) 
启动一个内存副本集，并在注释中强调这是为了支持事务。副本集启动后，得到的连接字符串写入
 config.db，再连接到 Mongoose。

routes/rentals.js 的 POST /api/rentals 路由使用了 mongoose.startSession() 
和 session.startTransaction() 来执行多步数据库更新。MongoDB 只有在副本集或分片
集群中才支持事务。如果在测试环境中仅启动单节点 MongoMemoryServer，在调用 startSession() 
后会报错（例如 “Transactions are not allowed in standalone mode”），导致测试或代码运行失败。

因此，将单节点 MongoMemoryServer 改为 MongoMemoryReplSet 后，测试环境能够模拟
副本集，事务式的路由（如 POST /api/rentals）就能够正常执行，从而解决之前无法在测试
中跑通事务相关逻辑的 Bug。 */
