import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import fetch from "node-fetch"; // verify Google token
import auth from "../middlewares/auth.js";

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "yoursecret";

// Register (email/password)
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ error: "User already exists" });

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashed });

    res.status(201).json({ message: "User registered", user });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Login (email/password)
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !user.password) return res.status(401).json({ error: "Invalid credentials" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: "Invalid credentials" });

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "7d" });
    res.json({ token, user });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Google Login
router.post("/google", async (req, res) => {
  try {
    const { tokenId } = req.body;

    // Verify Google token
    const googleRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${tokenId}`);
    const googleData = await googleRes.json();

    if (googleData.error_description) {
      return res.status(401).json({ error: "Invalid Google token" });
    }

    let user = await User.findOne({ email: googleData.email });
    if (!user) {
      user = await User.create({
        name: googleData.name,
        email: googleData.email,
        pic: googleData.picture, // Store Google profile pic
        googleId: googleData.sub
      });
    } else if (!user.pic && googleData.picture) {
      // Update profile pic if missing
      user.pic = googleData.picture;
      await user.save();
    }

    const jwtToken = jwt.sign({ _id: user._id }, JWT_SECRET, { expiresIn: "7d" });
    res.json({ token: jwtToken, user });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});


router.get("/me", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("name email pic");
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
