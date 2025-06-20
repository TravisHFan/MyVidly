// rentals.test.js
jest.resetModules();
require("../setupReplSet"); // 注意路径根据项目结构

const request = require("supertest");
const mongoose = require("mongoose");
const { Rental } = require("../../models/rental");
const { Movie } = require("../../models/movie");
const { Customer } = require("../../models/customer");
const { Genre } = require("../../models/genre");
const { User } = require("../../models/user");
const app = require("../../app");

describe("/api/rentals", () => {
  describe("GET /", () => {
    it("should return all rentals", async () => {
      const genre = new Genre({ name: "genre1" });
      await genre.save();
      const movie = new Movie({
        title: "movie1",
        genre: { _id: genre._id, name: genre.name },
        numberInStock: 1,
        dailyRentalRate: 1,
      });
      await movie.save();
      const customer = new Customer({ name: "customer1", phone: "12345" });
      await customer.save();

      await Rental.insertMany([
        {
          customer: {
            _id: customer._id,
            name: customer.name,
            phone: customer.phone,
          },
          movie: {
            _id: movie._id,
            title: movie.title,
            dailyRentalRate: movie.dailyRentalRate,
          },
        },
        {
          customer: {
            _id: customer._id,
            name: customer.name,
            phone: customer.phone,
          },
          movie: {
            _id: movie._id,
            title: movie.title,
            dailyRentalRate: movie.dailyRentalRate,
          },
        },
      ]);
      /* Model.insertMany(docs) 接受一个文档数组，将它们一次性提交到 MongoDB 
        与逐个调用 .save() 不同，它省去了多个网络往返和额外的 Mongoose 层验证开销，更高效、更适合批量操作。 */

      const res = await request(app).get("/api/rentals");
      expect(res.status).toBe(200);
      expect(res.body.length).toBe(2);
    });
  });

  describe("GET /:id", () => {
    it("should return a rental if valid id is passed", async () => {
      const genre = new Genre({ name: "genre1" });
      await genre.save();
      const movie = new Movie({
        title: "movie1",
        genre: { _id: genre._id, name: genre.name },
        numberInStock: 1,
        dailyRentalRate: 1,
      });
      await movie.save();
      const customer = new Customer({ name: "customer1", phone: "12345" });
      await customer.save();

      const rental = new Rental({
        customer: {
          _id: customer._id,
          name: customer.name,
          phone: customer.phone,
        },
        movie: {
          _id: movie._id,
          title: movie.title,
          dailyRentalRate: movie.dailyRentalRate,
        },
      });
      await rental.save();

      const res = await request(app).get("/api/rentals/" + rental._id);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("_id", rental._id.toHexString());
    });

    it("should return 404 if invalid id is passed", async () => {
      const res = await request(app).get("/api/rentals/1");
      expect(res.status).toBe(404);
    });

    it("should return 404 if no rental with the given id exists", async () => {
      const id = new mongoose.Types.ObjectId();
      const res = await request(app).get("/api/rentals/" + id);
      expect(res.status).toBe(404);
    });
  });

  describe("POST /", () => {
    let token;
    let customerId;
    let movieId;
    let customer;
    let movie;
    let genre;

    beforeEach(async () => {
      genre = new Genre({ name: "genre1" });
      await genre.save();
      movie = new Movie({
        title: "movie1",
        genre: { _id: genre._id, name: genre.name },
        numberInStock: 2,
        dailyRentalRate: 2,
      });
      await movie.save();
      customer = new Customer({ name: "customer1", phone: "12345" });
      await customer.save();

      token = new User().generateAuthToken();
      customerId = customer._id;
      movieId = movie._id;
    });

    const exec = async () => {
      return await request(app)
        .post("/api/rentals")
        .set("x-auth-token", token)
        .send({ customerId, movieId });
    };

    it("should return 401 if user is not logged in", async () => {
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

    it("should return 400 if customer does not exist", async () => {
      customerId = new mongoose.Types.ObjectId();
      const res = await exec();
      expect(res.status).toBe(400);
    });

    it("should return 400 if movie does not exist", async () => {
      movieId = new mongoose.Types.ObjectId();
      const res = await exec();
      expect(res.status).toBe(400);
    });

    it("should return 400 if movie is out of stock", async () => {
      movie.numberInStock = 0;
      await movie.save();
      const res = await exec();
      expect(res.status).toBe(400);
    });

    it("should save the rental and return it if input is valid", async () => {
      const res = await exec();
      const rentalInDb = await Rental.findOne({ "customer._id": customerId });
      expect(rentalInDb).not.toBeNull();

      expect(res.body).toHaveProperty("_id");
      expect(res.body).toHaveProperty("customer");
      expect(res.body).toHaveProperty("movie");
    });

    it("should decrease the movie stock if input is valid", async () => {
      await exec();
      const movieInDb = await Movie.findById(movieId);
      expect(movieInDb.numberInStock).toBe(movie.numberInStock - 1);
    });
  });
});
