const mongoose = require("mongoose");
const supertest = require("supertest");
const app = require("../app"); 
const api = supertest(app);
const Job = require("../models/jobModel");


const jobs = [
  {
    title: "Software Engineer",
    type: "Full-time",
    description: "Develop and maintain software applications.",
    company: {
      name: "Tech Corp",
      contactEmail: "hr@techcorp.com",
      contactPhone: "+1234567890",
    },
  },
  {
    title: "Product Manager",
    type: "Full-time",
    description: "Lead product development and strategy.",
    company: {
      name: "Innovate Inc",
      contactEmail: "careers@innovate.com",
      contactPhone: "+0987654321",
    },
  },
];


beforeEach(async () => {
  await Job.deleteMany({});
  await Job.insertMany(jobs);
});


describe("GET /api/jobs", () => {
  it("should return all jobs when GET /api/jobs is requested", async () => {
    const response = await api
      .get("/api/jobs")
      .expect(200)
      .expect("Content-Type", /application\/json/);

    expect(response.body).toHaveLength(jobs.length);
    expect(Array.isArray(response.body)).toBe(true);
    

    response.body.forEach((job) => {
      expect(job).toHaveProperty("id");
      expect(job).toHaveProperty("title");
      expect(job).toHaveProperty("type");
      expect(job).toHaveProperty("description");
      expect(job).toHaveProperty("company");
      expect(job.company).toHaveProperty("name");
      expect(job.company).toHaveProperty("contactEmail");
      expect(job.company).toHaveProperty("contactPhone");
    });
  });

  it("should return an empty array when database is empty", async () => {
    await Job.deleteMany({});
    const response = await api
      .get("/api/jobs")
      .expect(200)
      .expect("Content-Type", /application\/json/);

    expect(response.body).toHaveLength(0);
    expect(Array.isArray(response.body)).toBe(true);
  });
});

describe("GET /api/jobs/:id", () => {
  it("should return a single job with the correct ID when GET /api/jobs/:id is requested", async () => {
    const job = await Job.findOne();
    const response = await api
      .get(`/api/jobs/${job._id}`)
      .expect(200)
      .expect("Content-Type", /application\/json/);

    expect(response.body.id).toBe(job._id.toString());
    expect(response.body.title).toBe(job.title);
    expect(response.body.company.name).toBe(job.company.name);
  });

  it("should return 404 for a non-existing job ID", async () => {
    const nonExistentId = new mongoose.Types.ObjectId();
    await api.get(`/api/jobs/${nonExistentId}`).expect(404);
  });

  it("should return 404 when GET /api/jobs/:id is requested with an invalid ID", async () => {
    await api.get("/api/jobs/invalid-id-12345").expect(404);
  });
});


describe("POST /api/jobs", () => {
  it("should create a new job with valid data", async () => {
    const newJob = {
      title: "Data Scientist",
      type: "Full-time",
      description: "Analyze data and build machine learning models.",
      company: {
        name: "Data Corp",
        contactEmail: "jobs@datacorp.com",
        contactPhone: "+1122334455",
      },
    };

    const response = await api
      .post("/api/jobs")
      .send(newJob)
      .expect(201)
      .expect("Content-Type", /application\/json/);

    expect(response.body.title).toBe(newJob.title);
    expect(response.body.company.name).toBe(newJob.company.name);
    expect(response.body).toHaveProperty("id");

    const jobsAfterPost = await Job.find({});
    expect(jobsAfterPost).toHaveLength(jobs.length + 1);
  });

  it("should return 400 when creating a job with missing required fields (title)", async () => {
    const invalidJob = {
      type: "Full-time",
      description: "Some description",
      company: {
        name: "Test Corp",
        contactEmail: "test@test.com",
        contactPhone: "+1234567890",
      },
    };

    await api.post("/api/jobs").send(invalidJob).expect(400);
  });

  it("should return 400 when creating a job with missing required fields (company)", async () => {
    const invalidJob = {
      title: "Test Job",
      type: "Full-time",
      description: "Some description",
    };

    await api.post("/api/jobs").send(invalidJob).expect(400);
  });

  it("should return 400 when creating a job with missing required fields (company.name)", async () => {
    const invalidJob = {
      title: "Test Job",
      type: "Full-time",
      description: "Some description",
      company: {
        contactEmail: "test@test.com",
        contactPhone: "+1234567890",
      },
    };

    await api.post("/api/jobs").send(invalidJob).expect(400);
  });
});


describe("PUT /api/jobs/:id", () => {
  it("should update a job with valid update data", async () => {
    const job = await Job.findOne();
    const updatedData = {
      title: "Senior Software Engineer",
      description: "Updated description",
    };

    const response = await api
      .put(`/api/jobs/${job._id}`)
      .send(updatedData)
      .expect(200)
      .expect("Content-Type", /application\/json/);

    expect(response.body.title).toBe(updatedData.title);
    expect(response.body.description).toBe(updatedData.description);

    const updatedJobCheck = await Job.findById(job._id);
    expect(updatedJobCheck.title).toBe(updatedData.title);
    expect(updatedJobCheck.description).toBe(updatedData.description);
  });

  it("should update a job with partial data", async () => {
    const job = await Job.findOne();
    const originalTitle = job.title;
    const updatedData = { description: "New description only" };

    const response = await api
      .put(`/api/jobs/${job._id}`)
      .send(updatedData)
      .expect(200)
      .expect("Content-Type", /application\/json/);

    expect(response.body.description).toBe(updatedData.description);
    expect(response.body.title).toBe(originalTitle); 

    const updatedJobCheck = await Job.findById(job._id);
    expect(updatedJobCheck.description).toBe(updatedData.description);
    expect(updatedJobCheck.title).toBe(originalTitle);
  });

  it("should return 404 for a non-existing job ID", async () => {
    const nonExistentId = new mongoose.Types.ObjectId();
    await api
      .put(`/api/jobs/${nonExistentId}`)
      .send({ title: "Updated Title" })
      .expect(404);
  });

  it("should return 404 when updating a job with invalid ID format", async () => {
    const invalidId = "12345"; // invalid format, not a valid ObjectId
    await api.put(`/api/jobs/${invalidId}`).send({ title: "Test" }).expect(404);
  });
});


describe("DELETE /api/jobs/:id", () => {
  it("should delete a job by ID", async () => {
    const job = await Job.findOne();
    await api.delete(`/api/jobs/${job._id}`).expect(204);

    // Verify job is removed from database
    const deletedJobCheck = await Job.findById(job._id);
    expect(deletedJobCheck).toBeNull();
  });

  it("should return 404 for a non-existing job ID", async () => {
    const nonExistentId = new mongoose.Types.ObjectId();
    await api.delete(`/api/jobs/${nonExistentId}`).expect(404);
  });

  it("should return 404 when deleting a job with invalid ID format", async () => {
    const invalidId = "12345"; // invalid format
    await api.delete(`/api/jobs/${invalidId}`).expect(404);
  });
});

// Close DB connection once after all tests in this file
afterAll(async () => {
  await mongoose.connection.close();
});
