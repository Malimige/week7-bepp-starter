const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const validator = require("validator");

// Generate JWT
const generateToken = (_id) => {
  return jwt.sign({ _id }, process.env.SECRET, { expiresIn: "3d" });
};

// @desc Register user
const signupUser = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      phone_number,
      gender,
      date_of_birth,
      membership_status,
    } = req.body;

    // Validate required fields
    if (
      !name ||
      !email ||
      !password ||
      !phone_number ||
      !gender ||
      !date_of_birth ||
      !membership_status
    ) {
      return res.status(400).json({ error: "Please add all fields" });
    }

    // Email check
    if (!validator.isEmail(email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    // Password length check
    if (password.length < 6) {
      return res.status(400).json({ error: "Password too short" });
    }

    // Check existing user
    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ error: "User already exists" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Convert date string to actual Date → IMPORTANT FIX
    const dob = new Date(date_of_birth);

    // Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      phone_number,
      gender,
      date_of_birth: dob,
      membership_status,
    });

    return res.status(201).json({
      email: user.email,
      token: generateToken(user._id),
    });
  } catch (error) {
    console.log("SIGNUP ERROR:", error.message);
    return res.status(400).json({ error: error.message });
  }
};

// @desc Login user
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ error: "Email and password required" });

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const correct = await bcrypt.compare(password, user.password);
    if (!correct) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    return res.status(200).json({
      email: user.email,
      token: generateToken(user._id),
    });
  } catch (error) {
    console.log("LOGIN ERROR:", error.message);
    return res.status(400).json({ error: error.message });
  }
};

const getMe = async (req, res) => {
  res.status(200).json(req.user);
};

module.exports = { signupUser, loginUser, getMe };
