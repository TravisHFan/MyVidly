const request = require("supertest");
const app = require("../../app"); // Adjust the path as necessary
const { User } = require("../../models/user"); // Ensure User model is loaded
const { Genre } = require("../../models/genre"); // Ensure User model is loaded

describe("auth middleware", () => {
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
