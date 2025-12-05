const Job = require("../models/jobModel");

// --------------------------------------
// CREATE JOB (Protected)
// --------------------------------------
const createJob = async (req, res) => {
  try {
    const { title, type, description, company, user_id } = req.body;

    // Validate required fields
    if (!title || !type || !description || !company || !user_id) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const newJob = await Job.create({
      title,
      type,
      description,
      company,
      user_id,
    });

    return res.status(201).json(newJob);
  } catch (error) {
    console.error("Job Create Error:", error);
    return res.status(500).json({ error: "Server Error" });
  }
};

// --------------------------------------
// UPDATE JOB (Protected + Ownership Check)
// --------------------------------------
const updateJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ error: "Job not found" });
    }

    // Authorization check — only owner can update
    if (String(job.user_id) !== String(req.user._id)) {
      return res
        .status(403)
        .json({ error: "Unauthorized to update this job" });
    }

    const updatedJob = await Job.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    return res.status(200).json(updatedJob);
  } catch (error) {
    console.error("Job Update Error:", error);
    return res.status(500).json({ error: "Server Error" });
  }
};

// --------------------------------------
// DELETE JOB (Protected + Ownership Check)
// --------------------------------------
const deleteJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ error: "Job not found" });
    }

    // Authorization check — only owner can delete
    if (String(job.user_id) !== String(req.user._id)) {
      return res
        .status(403)
        .json({ error: "Unauthorized to delete this job" });
    }

    await Job.findByIdAndDelete(req.params.id);

    return res.status(200).json({ message: "Job deleted" });
  } catch (error) {
    console.error("Job Delete Error:", error);
    return res.status(500).json({ error: "Server Error" });
  }
};

module.exports = {
  createJob,
  updateJob,
  deleteJob,
};
