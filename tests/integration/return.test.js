const moment = require("moment");
const request = require("supertest");
const { Rental } = require("../../models/rental"); // Ensure the Rental model is loaded
const mongoose = require("mongoose");
const { User } = require("../../models/user"); // Ensure the User model is loaded
const app = require("../../app");

describe("/api/return", () => {
  //务必在 describe() 作用域中用 let 提前声明所有共享变量。
  let customerId;
  let movieId;
  let rental; //如果这里不声明，rental就会变成隐式的全局变量（因为 JS 会自动往 global 对象挂载）；
  let token;

  const exec = async () => {
    return request(app)
      .post("/api/returns")
      .set("x-auth-token", token)
      .send({ customerId, movieId });
  };

  beforeEach(async () => {
    customerId = new mongoose.Types.ObjectId();
    movieId = new mongoose.Types.ObjectId();
    token = new User().generateAuthToken();

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
    token = "";
    const res = await exec();
    expect(res.status).toBe(401);
  });

  it("should return 400 if customerId is not provided", async () => {
    customerId = "";
    const res = await exec();
    expect(res.status).toBe(400);
  });

  it("should return 400 if movieId is not provided", async () => {
    movieId = "";
    const res = await exec();
    expect(res.status).toBe(400);
  });

  it("should return 404 if no rental found for the customer/movie", async () => {
    await Rental.deleteMany(); // 清空所有租赁记录
    const res = await exec();
    expect(res.status).toBe(404);
  });

  it("should return 400 if return is already processed", async () => {
    rental.dateReturned = new Date();
    await rental.save();

    const res = await exec();
    expect(res.status).toBe(400);
  });

  it("should return 200 if we have a valid request", async () => {
    const res = await exec();
    expect(res.status).toBe(200);
  });

  it("should set the returnDate if input is valid", async () => {
    const res = await exec();
    const rentalInDb = await Rental.findById(rental._id);
    const diff = new Date() - rentalInDb.dateReturned;
    expect(diff).toBeLessThan(10 * 1000); // 确保返回时间在10秒内
  });

  it("should set the rentalFee if input is valid", async () => {
    rental.dateOut = moment().add(-7, "days").toDate(); // 设置租赁时间为7天前
    await rental.save();
    const res = await exec();
    const rentalInDb = await Rental.findById(rental._id);
    expect(rentalInDb.rentalFee).toBe(14); // 7天 * 2元/天 = 14元
  });
});
