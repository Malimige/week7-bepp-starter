const request = require("supertest");
const app = require("../app");
const mongoose = require("mongoose");
const User = require("../models/userModel");

describe("Users API (Signup & Login)", () => {
  beforeEach(async () => {
    await User.deleteMany({});
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  const baseUser = {
    name: "Test User",
    email: "test@example.com",
    password: "123456",
    phone_number: "0771234567",
    gender: "Female",
    date_of_birth: "1998-01-01",
    membership_status: "active",
  };

  // ------------------------
  // SIGNUP TESTS
  // ------------------------
  it("should create a new user when valid signup data is provided", async () => {
    const res = await request(app)
      .post("/api/users/signup")
      .send(baseUser);

    expect(res.status).toBe(201);
    expect(res.body.email).toBe(baseUser.email);
    expect(res.body.token).toBeDefined();
    expect(res.body.password).toBeUndefined();
  });

  it("should return 400 when email is missing", async () => {
    const { email, ...rest } = baseUser;

    const res = await request(app)
      .post("/api/users/signup")
      .send(rest);

    expect(res.status).toBe(400);
  });

  it("should return 400 when password is missing", async () => {
    const { password, ...rest } = baseUser;

    const res = await request(app)
      .post("/api/users/signup")
      .send(rest);

    expect(res.status).toBe(400);
  });

  it("should return 400 for invalid email format", async () => {
    const res = await request(app)
      .post("/api/users/signup")
      .send({
        ...baseUser,
        email: "wrongemail",
      });

    expect(res.status).toBe(400);
  });

  it("should return 400 when password is too short", async () => {
    const res = await request(app)
      .post("/api/users/signup")
      .send({
        ...baseUser,
        password: "123",
      });

    expect(res.status).toBe(400);
  });

  it("should return 400 for duplicate email", async () => {
    // First signup
    await request(app)
      .post("/api/users/signup")
      .send(baseUser);

    // Second signup with same email
    const res = await request(app)
      .post("/api/users/signup")
      .send(baseUser);

    expect(res.status).toBe(400);
  });

  // ------------------------
  // LOGIN TESTS
  // ------------------------
  it("should log in the user with valid credentials", async () => {
    // First signup the user (this will hash password)
    await request(app)
      .post("/api/users/signup")
      .send(baseUser);

    const res = await request(app)
      .post("/api/users/login")
      .send({
        email: baseUser.email,
        password: baseUser.password,
      });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
  });

  it("should return 401 when wrong password is provided", async () => {
    await request(app)
      .post("/api/users/signup")
      .send(baseUser);

    const res = await request(app)
      .post("/api/users/login")
      .send({
        email: baseUser.email,
        password: "wrongpass",
      });

    expect(res.status).toBe(401);
  });

  it("should return 401 for unknown email", async () => {
    const res = await request(app)
      .post("/api/users/login")
      .send({
        email: "unknown@example.com",
        password: "123456",
      });

    expect(res.status).toBe(401);
  });

  it("should return 400 when email is missing during login", async () => {
    const res = await request(app)
      .post("/api/users/login")
      .send({
        password: "123456",
      });

    expect(res.status).toBe(400);
  });

  it("should return 400 when password is missing during login", async () => {
    const res = await request(app)
      .post("/api/users/login")
      .send({
        email: baseUser.email,
      });

    expect(res.status).toBe(400);
  });
});
