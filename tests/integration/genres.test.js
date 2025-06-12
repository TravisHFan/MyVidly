const request = require("supertest");
const mongoose = require("mongoose");
const { Genre } = require("../../models/genre"); // Adjust the path as necessary
const { User } = require("../../models/user"); // Adjust the path as necessary
const app = require("../../app");

describe("/api/genres", () => {
  describe("GET /", () => {
    it("should return all genres", async () => {
      await Genre.insertMany([
        { name: "genre1" },
        { name: "genre2" },
        { name: "genre3" },
      ]);

      const res = await request(app).get("/api/genres");
      expect(res.status).toBe(200);
      expect(res.body.length).toBe(3);
      expect(res.body.some((g) => g.name === "genre1")).toBeTruthy();
      expect(res.body.some((g) => g.name === "genre2")).toBeTruthy();
      expect(res.body.some((g) => g.name === "genre3")).toBeTruthy();
    });
  });

  describe("GET /:id", () => {
    it("should return a genre if valid id is passed", async () => {
      const genre = new Genre({ name: "genre1" });
      await genre.save();

      const res = await request(app).get("/api/genres/" + genre._id);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("name", genre.name);
    });

    it("should return 404 if invalid id is passed", async () => {
      const res = await request(app).get("/api/genres/1");
      expect(res.status).toBe(404);
    });

    it("should return 404 if no genre with the given id exists", async () => {
      const id = new mongoose.Types.ObjectId();
      const res = await request(app).get("/api/genres/" + id);
      expect(res.status).toBe(404);
    });
  });

  describe("POST /", () => {
    //Define the happy path, and then in each test, we change
    //one parameter that clearly aligns with the name of the test.

    let token;
    let name;

    const exec = async () => {
      return await request(app)
        .post("/api/genres")
        .set("x-auth-token", token)
        .send({ name });
    };

    beforeEach(() => {
      token = new User().generateAuthToken(); // Generate a token for a user
      name = "genre1"; // Default genre name
    });

    it("should return 401 if user is not logged in", async () => {
      token = ""; // No token provided
      const res = await exec();
      expect(res.status).toBe(401);
    });

    it("should return 400 if genre is less than 5 characters", async () => {
      name = "1234";
      const res = await exec();
      expect(res.status).toBe(400);
    });

    it("should return 400 if genre is more than 50 characters", async () => {
      name = new Array(52).join("a"); // Create a string with 52 'a's
      const res = await exec();
      expect(res.status).toBe(400);
    });

    it("should save the genre if it is valid", async () => {
      await exec();
      const genre = await Genre.find({ name: "genre1" });
      expect(genre).not.toBeNull();
    });

    it("should return the genre if it is valid", async () => {
      const res = await exec();
      expect(res.body).toHaveProperty("_id");
      expect(res.body).toHaveProperty("name", "genre1");
    });
  });

  describe("PUT /:id", () => {
    let token;
    let newName;
    let genre;
    let id;

    const exec = async () => {
      return await request(app)
        .put("/api/genres/" + id)
        .set("x-auth-token", token)
        .send({ name: newName });
    };

    beforeEach(async () => {
      // 先插入一个 genre 供后续更新使用
      genre = new Genre({ name: "genre1" });
      await genre.save();

      token = new User().generateAuthToken();
      id = genre._id;
      newName = "updatedName";
    });

    it("should return 400 if genre is less than 5 characters", async () => {
      newName = "1234";
      const res = await exec();
      expect(res.status).toBe(400);
    });

    it("should return 404 if id is invalid", async () => {
      id = "1";
      const res = await exec();
      expect(res.status).toBe(404);
    });

    it("should return 404 if genre with given id was not found", async () => {
      id = new mongoose.Types.ObjectId();
      const res = await exec();
      expect(res.status).toBe(404);
    });

    it("should update the genre if input is valid", async () => {
      const res = await exec();

      const updatedGenre = await Genre.findById(genre._id);
      expect(updatedGenre.name).toBe(newName);

      expect(res.body).toHaveProperty("_id");
      expect(res.body).toHaveProperty("name", newName);
    });
  });

  describe("DELETE /:id", () => {
    let token;
    let genre;
    let id;

    const exec = async () => {
      return await request(app)
        .delete("/api/genres/" + id)
        .set("x-auth-token", token)
        .send();
    };

    beforeEach(async () => {
      genre = new Genre({ name: "genre1" });
      await genre.save();

      id = genre._id;
      token = new User({ isAdmin: true }).generateAuthToken(); // 这里需要 isAdmin: true
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

    it("should return 404 if no genre with the given id was found", async () => {
      id = new mongoose.Types.ObjectId();
      const res = await exec();
      expect(res.status).toBe(404);
    });

    it("should delete the genre if input is valid", async () => {
      await exec();
      const genreInDb = await Genre.findById(id);
      expect(genreInDb).toBeNull();
    });

    it("should return the removed genre", async () => {
      const res = await exec();
      expect(res.body).toHaveProperty("_id", genre._id.toHexString());
      expect(res.body).toHaveProperty("name", genre.name);
    });
  });
});
