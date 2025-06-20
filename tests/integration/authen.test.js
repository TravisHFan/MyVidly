const request = require("supertest");
const bcrypt = require("bcrypt");
const app = require("../../app"); // Adjust the path as necessary
const { User } = require("../../models/user"); // Ensure User model is loaded

describe("authen middleware", () => {
  let token;

  const exec = () => {
    return request(app).post("/api/genres").set("x-auth-token", token).send({
      name: "genre1",
    });
  };

  beforeEach(() => {
    token = new User().generateAuthToken();
  });

  it("should return 401 if no token is provided", async () => {
    token = ""; // No token provided
    const res = await exec();
    expect(res.status).toBe(401);
  });

  it("should return 400 if token is invalid", async () => {
    token = "a"; // No token provided
    const res = await exec();
    expect(res.status).toBe(400);
  });

  it("should return 200 if token is valid", async () => {
    const res = await exec();
    expect(res.status).toBe(200);
  });
});

describe("/api/authen", () => {
  let email;
  let password;

  const exec = async () => {
    return await request(app).post("/api/authen").send({ email, password });
  };

  beforeEach(async () => {
    email = "user1@example.com";
    password = "12345";
    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);
    await new User({ name: "user1", email, password: hashed }).save();
  });

  it("should return 400 if email is invalid", async () => {
    email = "1234";
    const res = await exec();
    expect(res.status).toBe(400);
  });

  it("should return 400 if password is less than 5 characters", async () => {
    password = "1234";
    const res = await exec();
    expect(res.status).toBe(400);
  });

  it("should return 400 if user with given email does not exist", async () => {
    email = "notexist@example.com";
    const res = await exec();
    expect(res.status).toBe(400);
  });

  it("should return 400 if password is incorrect", async () => {
    password = "wrongpassword";
    const res = await exec();
    expect(res.status).toBe(400);
  });

  it("should return a token if credentials are valid", async () => {
    const res = await exec();
    expect(res.status).toBe(200);
    expect(res.text).toBeTruthy();
  });
});
