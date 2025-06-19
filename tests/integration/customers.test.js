const request = require("supertest");
const mongoose = require("mongoose");
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
});
