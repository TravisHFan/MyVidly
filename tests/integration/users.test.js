const request = require("supertest");
const bcrypt = require("bcrypt");
const { User } = require("../../models/user");
const app = require("../../app");

describe("/api/users", () => {
  describe("GET /me", () => {
    it("should return 401 if client is not logged in", async () => {
      const res = await request(app).get("/api/users/me");
      expect(res.status).toBe(401);
    });

    it("should return the current user", async () => {
      const user = new User({
        name: "user1",
        email: "user1@example.com",
        password: "12345",
      });
      await user.save();

      const token = user.generateAuthToken();

      const res = await request(app)
        .get("/api/users/me")
        .set("x-auth-token", token);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("_id", user._id.toHexString());
      expect(res.body).toHaveProperty("name", user.name);
      expect(res.body).toHaveProperty("email", user.email);
      expect(res.body).not.toHaveProperty("password");
    });
  });

  describe("POST /", () => {
    let token;
    let name;
    let email;
    let password;

    beforeEach(() => {
      token = new User().generateAuthToken();
      name = "user1";
      email = "user1@example.com";
      password = "12345";
    });

    const exec = async () => {
      return await request(app)
        .post("/api/users")
        .set("x-auth-token", token)
        .send({ name, email, password });
    };

    it("should return 401 if client is not logged in", async () => {
      token = "";
      const res = await exec();
      expect(res.status).toBe(401);
    });

    it("should return 400 if name is less than 5 characters", async () => {
      name = "1234";
      const res = await exec();
      expect(res.status).toBe(400);
    });

    it("should return 400 if name is more than 50 characters", async () => {
      name = new Array(52).join("a"); // 51 characters
      const res = await exec();
      expect(res.status).toBe(400);
    });

    it("should return 400 if user already registered", async () => {
      await new User({ name, email, password }).save();
      const res = await exec();
      expect(res.status).toBe(400);
    });

    it("should save the user if input is valid", async () => {
      await exec();
      const userInDb = await User.findOne({ email });
      expect(userInDb).not.toBeNull();
      const validPassword = await bcrypt.compare(password, userInDb.password);
      expect(validPassword).toBe(true);
    });

    it("should return the user and auth token if input is valid", async () => {
      const res = await exec();
      expect(res.header).toHaveProperty("x-auth-token");
      expect(res.body).toHaveProperty("_id");
      expect(res.body).toHaveProperty("name", name);
      expect(res.body).toHaveProperty("email", email);
    });
  });
});
