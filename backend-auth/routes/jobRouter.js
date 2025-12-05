const express = require("express");
const router = express.Router();
const {
  createJob,
  updateJob,
  deleteJob,
} = require("../controllers/jobControllers");

const requireAuth = require("../middleware/requireAuth");

router.use(requireAuth); // 🔐 Protect ALL routes

router.post("/", createJob);
router.put("/:id", updateJob);
router.delete("/:id", deleteJob);

module.exports = router;
