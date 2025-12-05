const request = require("supertest");
const app = require("../app");
const mongoose = require("mongoose");
const User = require("../models/userModel");
const Job = require("../models/jobModel");

describe("Protected Jobs API", () => {
  let token1;
  let userId1;
  let token2;
  let userId2;

  const userA = {
    name: "User A",
    email: "userA@example.com",
    password: "123456",
    phone_number: "0771234567",
    gender: "Female",
    date_of_birth: "1998-01-01",
    membership_status: "active",
  };

  const userB = {
    name: "User B",
    email: "userB@example.com",
    password: "123456",
    phone_number: "0775555555",
    gender: "Male",
    date_of_birth: "1995-01-01",
    membership_status: "active",
  };

  const baseJob = {
    title: "Protected Job",
    type: "Full-time",
    description: "A secured job test",
    company: {
      name: "CompanyX",
      contactEmail: "companyx@test.com",
      contactPhone: "0771234567",
    },
  };

  beforeAll(async () => {
    await User.deleteMany({});
    await Job.deleteMany({});

    // Create User A
    let res = await request(app).post("/api/users/signup").send(userA);
    token1 = res.body.token;
    userId1 = (await User.findOne({ email: userA.email }))._id;

    // Create User B
    res = await request(app).post("/api/users/signup").send(userB);
    token2 = res.body.token;
    userId2 = (await User.findOne({ email: userB.email }))._id;
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  // --------------------------
  // UNAUTHORIZED REQUESTS
  // --------------------------
  it("should return 401 when creating job without token", async () => {
    const res = await request(app)
      .post("/api/jobs")
      .send({ ...baseJob, user_id: userId1 });

    expect(res.status).toBe(401);
  });

  it("should return 401 when updating job without token", async () => {
    const res = await request(app).put("/api/jobs/123456");
    expect(res.status).toBe(401);
  });

  it("should return 401 when deleting job without token", async () => {
    const res = await request(app).delete("/api/jobs/123456");
    expect(res.status).toBe(401);
  });

  // INVALID TOKEN
  it("should return 401 when using an invalid token", async () => {
    const res = await request(app)
      .post("/api/jobs")
      .set("Authorization", "Bearer invalid-token")
      .send({ ...baseJob, user_id: userId1 });

    expect(res.status).toBe(401);
  });

  // --------------------------
  // AUTHORIZED REQUESTS
  // --------------------------
  let jobId;

  it("should create a job when valid token is provided", async () => {
    const res = await request(app)
      .post("/api/jobs")
      .set("Authorization", `Bearer ${token1}`)
      .send({ ...baseJob, user_id: userId1 });

    expect(res.status).toBe(201);
    expect(res.body.user_id).toBe(String(userId1));

    jobId = res.body.id;
  });

  it("should update the job with valid token", async () => {
    const res = await request(app)
      .put(`/api/jobs/${jobId}`)
      .set("Authorization", `Bearer ${token1}`)
      .send({
        ...baseJob,
        title: "Updated Job",
        user_id: userId1,
      });

    expect(res.status).toBe(200);
    expect(res.body.title).toBe("Updated Job");
  });

  it("should delete the job with valid token", async () => {
    const res = await request(app)
      .delete(`/api/jobs/${jobId}`)
      .set("Authorization", `Bearer ${token1}`);

    expect(res.status).toBe(200);
  });

  // --------------------------
  // USER CANNOT MODIFY ANOTHER USER'S JOB
  // --------------------------
  let jobUser1;

  it("should create a job for user1", async () => {
    const res = await request(app)
      .post("/api/jobs")
      .set("Authorization", `Bearer ${token1}`)
      .send({ ...baseJob, user_id: userId1 });

    jobUser1 = res.body.id;

    expect(res.status).toBe(201);
  });

  it("should return 403 when user2 tries to update user1's job", async () => {
    const res = await request(app)
      .put(`/api/jobs/${jobUser1}`)
      .set("Authorization", `Bearer ${token2}`) // wrong user
      .send({
        ...baseJob,
        title: "Hacked Title",
        user_id: userId2,
      });

    expect(res.status).toBe(403);
  });

  it("should return 403 when user2 tries to delete user1's job", async () => {
    const res = await request(app)
      .delete(`/api/jobs/${jobUser1}`)
      .set("Authorization", `Bearer ${token2}`);

    expect(res.status).toBe(403);
  });
});
