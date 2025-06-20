// Mosh教程里原本没有，自己补充
const request = require("supertest");
const mongoose = require("mongoose");
const { User } = require("../../models/user");
const { Customer } = require("../../models/customer");
const app = require("../../app");

describe("/api/customers", () => {
  describe("GET /", () => {
    it("should return all customers", async () => {
      await Customer.insertMany([
        { name: "customer1", phone: "12345" },
        { name: "customer2", phone: "67890" },
      ]);

      const res = await request(app).get("/api/customers");
      expect(res.status).toBe(200);
      expect(res.body.length).toBe(2);
      expect(res.body.some((c) => c.name === "customer1")).toBeTruthy();
      //断言： 返回的数组中至少有一个元素，其 name 属性是 "customer1"。
      expect(res.body.some((c) => c.name === "customer2")).toBeTruthy();
    });
  });

  describe("GET /:id", () => {
    it("should return a customer if valid id is passed", async () => {
      const customer = new Customer({ name: "customer1", phone: "12345" });
      await customer.save();

      const res = await request(app).get("/api/customers/" + customer._id);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("name", customer.name);
    });

    it("should return 404 if invalid id is passed", async () => {
      const res = await request(app).get("/api/customers/1");
      expect(res.status).toBe(404);
    });

    it("should return 404 if no customer with the given id exists", async () => {
      const id = new mongoose.Types.ObjectId();
      const res = await request(app).get("/api/customers/" + id);
      expect(res.status).toBe(404);
    });
  });

  describe("POST /", () => {
    let token;
    let name;
    let phone;
    let isGold;

    beforeEach(() => {
      token = new User().generateAuthToken();
      name = "customer1";
      phone = "12345";
      isGold = true;
    });

    const exec = async () => {
      return await request(app)
        .post("/api/customers")
        .set("x-auth-token", token)
        .send({ name, phone, isGold });
    };

    it("should return 401 if user is not logged in", async () => {
      token = "";
      const res = await exec();
      expect(res.status).toBe(401);
    });

    it("should return 400 if customer name is less than 5 characters", async () => {
      name = "1234";
      const res = await exec();
      expect(res.status).toBe(400);
    });

    it("should return 400 if customer name is more than 50 characters", async () => {
      name = new Array(52).join("a");
      const res = await exec();
      expect(res.status).toBe(400);
    });

    it("should return 400 if phone is less than 5 characters", async () => {
      phone = "1234";
      const res = await exec();
      expect(res.status).toBe(400);
    });

    it("should return 400 if phone is more than 50 characters", async () => {
      phone = new Array(52).join("1");
      const res = await exec();
      expect(res.status).toBe(400);
    });

    it("should save the customer if it is valid", async () => {
      await exec();
      const customer = await Customer.find({ name: "customer1" });
      expect(customer).not.toBeNull();
    });

    it("should return the customer if it is valid", async () => {
      const res = await exec();
      expect(res.body).toHaveProperty("_id");
      expect(res.body).toHaveProperty("name", name);
      expect(res.body).toHaveProperty("phone", phone);
      expect(res.body).toHaveProperty("isGold", isGold);
    });
  });

  describe("PUT /:id", () => {
    let token;
    let newName;
    let newPhone;
    let isGold;
    let customer;
    let id;

    beforeEach(async () => {
      customer = new Customer({
        name: "customer1",
        phone: "12345",
        isGold: false,
      });
      await customer.save();

      token = new User().generateAuthToken();
      id = customer._id;
      newName = "updatedName";
      newPhone = "67890";
      isGold = true;
    });

    const exec = async () => {
      return await request(app) //这行创建了一个 SuperTest 请求实例，用于模拟对你的 Express 应用 app 的 HTTP 请求。
        .put("/api/customers/" + id)
        .set("x-auth-token", token)
        .send({ name: newName, phone: newPhone, isGold });
      /* 链式方法 .put(...).set(...).send(...)
                — .put(...) 指定请求路径和方式；
                — .set(...) 设置请求头（如 x-auth-token）；
                — .send(...) 添加请求体数据。

        这些方法链在一起完成对服务器的模拟 HTTP 调用。 
        这个链式调用最后会发出 HTTP 请求，返回一个 Promise，解析后会得到一个包含以下字段的对象：
        {
            status: ...,    // HTTP 状态码
            body: ...,      // 响应主体
            headers: ...,   // 响应头
            ...
        }

        顺序：没关系，只要包含正确的字段，服务器端解析时不会出问题。
        isGold 是一种 ES6 简写写法，等价于：
        { name: newName, phone: newPhone, isGold: isGold }
        也就是说，当变量名和属性名一样时，可以省略键值对中的“键: 变量”，用简洁方式书写
        */
    };

    it("should return 400 if customer name is less than 5 characters", async () => {
      newName = "1234";
      const res = await exec();
      expect(res.status).toBe(400);
    });

    it("should return 404 if id is invalid", async () => {
      id = "1";
      const res = await exec();
      expect(res.status).toBe(404);
    });

    it("should return 404 if no customer with given id was found", async () => {
      id = new mongoose.Types.ObjectId();
      const res = await exec();
      expect(res.status).toBe(404);
    });

    it("should update the customer if input is valid", async () => {
      const res = await exec();

      const updatedCustomer = await Customer.findById(customer._id);
      //Checking updatedCustomer via the database
      /* This ensures that your database was actually updated by the endpoint.
      It’s not enough for the server to send the correct response—you also need 
      to verify that the change was persisted. */
      expect(updatedCustomer.name).toBe(newName);
      expect(updatedCustomer.phone).toBe(newPhone);
      expect(updatedCustomer.isGold).toBe(isGold);

      //Checking res.body (the API response)
      /* This ensures the response payload your API returned is correct and includes 
      the updated data. This matters because clients depend on the response they 
      receive—for example, to update UI immediately—so it should reflect the change.

 */
      expect(res.body).toHaveProperty("_id");
      expect(res.body).toHaveProperty("name", newName);
      expect(res.body).toHaveProperty("phone", newPhone);
      expect(res.body).toHaveProperty("isGold", isGold);
    });
  });

  describe("DELETE /:id", () => {
    let token;
    let customer;
    let id;

    beforeEach(async () => {
      customer = new Customer({
        name: "customer1",
        phone: "12345",
        isGold: false,
      });
      await customer.save();

      id = customer._id;
      token = new User({ isAdmin: true }).generateAuthToken();
    });

    const exec = async () => {
      return await request(app)
        .delete("/api/customers/" + id)
        .set("x-auth-token", token)
        .send();
    };

    it("should return 401 if user is not logged in", async () => {
      token = "";
      const res = await exec();
      expect(res.status).toBe(401);
    });

    it("should return 403 if user is not an admin", async () => {
      token = new User({ isAdmin: false }).generateAuthToken();
      const res = await exec();
      expect(res.status).toBe(403);
    });

    it("should return 404 if id is invalid", async () => {
      id = "1";
      const res = await exec();
      expect(res.status).toBe(404);
    });

    it("should return 404 if no customer with the given id was found", async () => {
      id = new mongoose.Types.ObjectId();
      const res = await exec();
      expect(res.status).toBe(404);
    });

    it("should delete the customer if input is valid", async () => {
      await exec();
      const customerInDb = await Customer.findById(id);
      expect(customerInDb).toBeNull();
    });

    it("should return the removed customer", async () => {
      const res = await exec();
      expect(res.body).toHaveProperty("_id", customer._id.toHexString());
      expect(res.body).toHaveProperty("name", customer.name);
    });
  });
});
