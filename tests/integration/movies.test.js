const request = require("supertest");
const mongoose = require("mongoose");
const { Movie } = require("../../models/movie");
const { Genre } = require("../../models/genre");
const { User } = require("../../models/user");
const app = require("../../app");

describe("/api/movies", () => {
  describe("GET /", () => {
    it("should return all movies", async () => {
      const genre = new Genre({ name: "genre1" });
      await genre.save();
      await Movie.insertMany([
        {
          title: "movie1",
          genre: { _id: genre._id, name: genre.name },
          numberInStock: 1,
          dailyRentalRate: 1,
        },
        {
          title: "movie2",
          genre: { _id: genre._id, name: genre.name },
          numberInStock: 2,
          dailyRentalRate: 2,
        },
      ]);

      const res = await request(app).get("/api/movies");
      expect(res.status).toBe(200);
      expect(res.body.length).toBe(2);
      expect(res.body.some((m) => m.title === "movie1")).toBeTruthy();
      expect(res.body.some((m) => m.title === "movie2")).toBeTruthy();
    });
  });

  describe("GET /:id", () => {
    it("should return a movie if valid id is passed", async () => {
      const genre = new Genre({ name: "genre1" });
      await genre.save();
      const movie = new Movie({
        title: "movie1",
        genre: { _id: genre._id, name: genre.name },
        numberInStock: 1,
        dailyRentalRate: 1,
      });
      await movie.save();

      const res = await request(app).get("/api/movies/" + movie._id);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("title", movie.title);
    });

    it("should return 404 if invalid id is passed", async () => {
      const res = await request(app).get("/api/movies/1");
      expect(res.status).toBe(404);
    });

    it("should return 404 if no movie with the given id exists", async () => {
      const id = new mongoose.Types.ObjectId();
      const res = await request(app).get("/api/movies/" + id);
      expect(res.status).toBe(404);
    });
  });

  describe("POST /", () => {
    let token;
    let title;
    let genreId;
    let numberInStock;
    let dailyRentalRate;
    let genre;

    const exec = async () => {
      return await request(app)
        .post("/api/movies")
        .set("x-auth-token", token)
        .send({ title, genreId, numberInStock, dailyRentalRate });
    };

    beforeEach(async () => {
      genre = new Genre({ name: "genre1" });
      await genre.save();

      token = new User().generateAuthToken();
      title = "movie1";
      genreId = genre._id;
      numberInStock = 5;
      dailyRentalRate = 2;
    });

    it("should return 401 if user is not logged in", async () => {
      token = "";
      const res = await exec();
      expect(res.status).toBe(401);
    });

    it("should return 400 if movie title is less than 5 characters", async () => {
      title = "1234";
      const res = await exec();
      expect(res.status).toBe(400);
    });

    it("should return 400 if movie title is more than 50 characters", async () => {
      title = new Array(52).join("a");
      const res = await exec();
      expect(res.status).toBe(400);
    });

    it("should return 400 if genre is invalid", async () => {
      genreId = new mongoose.Types.ObjectId(); // not existing genre
      const res = await exec();
      expect(res.status).toBe(400);
    });

    it("should save the movie if valid and return it", async () => {
      const res = await exec();
      const movieInDb = await Movie.findOne({ title: "movie1" });
      /* Here we cannot using Movie.find(...), which returns an array of documents—even if 
      there's only one match. Thus:

      const movieInDb = await Movie.find({ title: "movie1" });
      movieInDb is an array, so accessing properties like .dailyRentalRate on it yields
       undefined.*/
      expect(res.status).toBe(200);
      expect(movieInDb).not.toBeNull();
      expect(res.body).toHaveProperty("_id");
      expect(res.body).toHaveProperty("title", title);
      expect(res.body.dailyRentalRate).toBe(movieInDb.dailyRentalRate);
    });
  });

  describe("PUT /:id", () => {
    let token;
    let movie;
    let id;
    let newTitle;
    let newGenreId;
    let newNumberInStock;
    let newDailyRentalRate;
    let genre;
    let genre2;

    beforeEach(async () => {
      genre = new Genre({ name: "genre1" });
      await genre.save();
      genre2 = new Genre({ name: "genre2" });
      await genre2.save();

      movie = new Movie({
        title: "movie1",
        genre: { _id: genre._id, name: genre.name },
        numberInStock: 5,
        dailyRentalRate: 2,
      });
      await movie.save();

      token = new User().generateAuthToken();
      id = movie._id;
      newTitle = "updatedTitle";
      newGenreId = genre2._id;
      newNumberInStock = 10;
      newDailyRentalRate = 3;
    });

    const exec = async () => {
      return await request(app)
        .put("/api/movies/" + id)
        .set("x-auth-token", token)
        .send({
          title: newTitle,
          genreId: newGenreId,
          numberInStock: newNumberInStock,
          dailyRentalRate: newDailyRentalRate,
        });
      /* 为什么在 .send() 的请求体中，只传了 genreId，却没有传 genre.name，而实际上 被测代码中
        却使用了 genre.name？
        因为 genre.name 是由 服务器端逻辑（）自动填充的:
        routes/movies.js:
        const genre = await Genre.findById(req.body.genreId);
        */
    };

    it("should return 400 if movie title is less than 5 characters", async () => {
      newTitle = "1234";
      const res = await exec();
      expect(res.status).toBe(400);
    });

    it("should return 400 if movie title is more than 50 characters", async () => {
      newTitle = new Array(52).join("a");
      const res = await exec();
      expect(res.status).toBe(400);
    });

    it("should return 400 if genre is invalid", async () => {
      newGenreId = new mongoose.Types.ObjectId(); // not existing genre
      const res = await exec();
      expect(res.status).toBe(400);
    });

    it("should return 401 if user is not logged in", async () => {
      token = "";
      const res = await exec();
      expect(res.status).toBe(401);
    });

    it("should return 404 if id is invalid", async () => {
      id = "1";
      const res = await exec();
      expect(res.status).toBe(404);
    });

    it("should return 404 if movie with given id was not found", async () => {
      id = new mongoose.Types.ObjectId();
      const res = await exec();
      expect(res.status).toBe(404);
    });

    it("should update the movie if input is valid", async () => {
      const res = await exec();

      const updatedMovie = await Movie.findById(movie._id);
      expect(updatedMovie.title).toBe(newTitle);
      expect(updatedMovie.genre._id.toHexString()).toBe(
        genre2._id.toHexString()
      );
      expect(updatedMovie.numberInStock).toBe(newNumberInStock);
      expect(updatedMovie.dailyRentalRate).toBe(newDailyRentalRate);

      expect(res.body).toHaveProperty("_id");
      expect(res.body).toHaveProperty("title", newTitle);
      /* 在 Jest 中使用 expect(obj).toHaveProperty() 时，可以提供一个可选的第二个参数用于对属性值进行断言。 */
    });
  });

  describe("DELETE /:id", () => {
    let token;
    let movie;
    let id;
    let genre;

    const exec = async () => {
      return await request(app)
        .delete("/api/movies/" + id)
        .set("x-auth-token", token)
        .send();
    };

    beforeEach(async () => {
      genre = new Genre({ name: "genre1" });
      await genre.save();

      movie = new Movie({
        title: "movie1",
        genre: { _id: genre._id, name: genre.name },
        numberInStock: 5,
        dailyRentalRate: 2,
      });
      await movie.save();

      id = movie._id;
      token = new User({ isAdmin: true }).generateAuthToken();
    });

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

    it("should return 404 if no movie with the given id was found", async () => {
      id = new mongoose.Types.ObjectId();
      const res = await exec();
      expect(res.status).toBe(404);
    });

    it("should delete the movie if input is valid, and return the removed movie", async () => {
      const res = await exec();
      const movieInDb = await Movie.findById(id);
      expect(movieInDb).toBeNull();

      expect(res.body).toHaveProperty("_id", movie._id.toHexString());
      expect(res.body).toHaveProperty("title", movie.title);
    });
  });
});
