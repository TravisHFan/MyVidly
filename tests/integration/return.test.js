const request = require("supertest");
const { Rental } = require("../../models/rental"); // Ensure the Rental model is loaded
const mongoose = require("mongoose");
const app = require("../../app");

describe("/api/return", () => {
  //务必在 describe() 作用域中用 let 提前声明所有共享变量。
  let customerId;
  let movieId;
  let rental; //如果这里不声明，rental就会变成隐式的全局变量（因为 JS 会自动往 global 对象挂载）；

  beforeEach(async () => {
    customerId = new mongoose.Types.ObjectId();
    movieId = new mongoose.Types.ObjectId();

    rental = new Rental({
      customer: {
        _id: customerId,
        name: "John Doe",
        phone: "1234567890",
      },
      movie: {
        _id: movieId,
        title: "Inception",
        dailyRentalRate: 2,
      },
    });
    await rental.save();
  });

  it("should return 401 if client is not logged in", async () => {
    const res = await request(app)
      .post("/api/returns")
      .send({ customerId, movieId });
    expect(res.status).toBe(401);
  });
});
