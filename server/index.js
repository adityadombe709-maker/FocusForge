import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import bcrypt from "bcryptjs";
import { User } from "./models/User.js";
import { Session } from "./models/Session.js";

dotenv.config();

const app = express();

app.use(express.json());
app.use(cors());

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "server running" });
});

app.post("/api/signup", async (req, res) => {
  try {
    const { email, password } = req.body;

    //checking if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res
        .status(400)
        .json({ message: "Email already exists. Please login." });
    }

    //hashing the password
    const hashedPassword = await bcrypt.hash(password, 10);

    //create and save the user
    const newUser = await User.create({
      email,
      password: hashedPassword,
    });
    return res
      .status(201)
      .json({ message: "User registered successfully.", userId: newUser._id });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Server error during signup.", error: error.message });
  }
});

app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    //find user email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid Credentials" });
    }

    //check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid Credentials" });
    }

    //success
    res.status(200).json({ message: "Login Successful", userId: user._id });
  } catch (error) {
    res.status(500).json({ message: "Server error during login" });
  }
});

//Route to store a new study session
app.post("/api/sessions", async (req, res) => {
  try {
    const { userId, startTime, endTime, duration } = req.body;

    const newSession = await Session.create({
      userId,
      startTime,
      endTime,
      duration,
    });
    return res.status(201).json(newSession);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Failed to save session.", error: error.message });
  }
});

//Route to fetch all sessions for the logged in user
app.get("/api/sessions/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const sessions = await Session.find({ userId }).sort({ createdAt: -1 });
    res.status(200).json(sessions);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch sessions.", error: error.message });
  }
});

//Route to delete single session
app.delete("/api/session/:sessionId", async (req, res) => {
  try {
    const { sessionId } = req.params;
    await Session.findByIdAndDelete(sessionId);
    return res.status(200).json({ message: "Session deleted." });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Failed to delete session.", error: error.message });
  }
});

app.delete("/api/sessions/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    await Session.deleteMany({ userId });
    return res
      .status(200)
      .json({ message: "Session history deleted successfully." });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete session history.",
      error: error.message,
    });
  }
});

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/focusforge";
const PORT = process.env.PORT || 5050;

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(PORT, () => {
      console.log(`App listening on port ${PORT}...`);
    });
  })
  .catch((error) => {
    console.log(`Connection failed due to ${error}`);
  });
