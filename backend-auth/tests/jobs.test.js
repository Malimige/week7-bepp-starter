const request = require("supertest");
const app = require("../app"); // Make sure your Express app is exported from app.js

describe("Jobs API - Non-Protected Endpoints", () => {
  it("should return all jobs when GET /api/jobs is requested", async () => {
    const res = await request(app).get("/api/jobs");
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});
