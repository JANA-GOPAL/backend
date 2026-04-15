require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require("cors");

const User = require("./models/User");
const sendEmail = require("./sendEmail");

const app = express();

app.use(cors());
app.use(express.json());

/* ===== Test Route ===== */
app.get("/", (req, res) => {
  res.send("API running 🚀");
});

/* ===== Signup ===== */
app.post("/signup", async (req, res) => {
  try {
    console.log("👉 Signup API hit");

    const { email, password } = req.body;
    console.log("Data:", email, password);

    if (!email || !password) {
      return res.status(400).json({ msg: "All fields required" });
    }

    const exist = await User.findOne({ email });
    console.log("User exists:", exist);

    if (exist) {
      return res.status(400).json({ msg: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    console.log("Password hashed");

    await User.create({
      email,
      password: hashedPassword,
    });

    console.log("User created");

    // 🔥 Email (will show error if fails)
    try {
      await sendEmail(email);
      console.log("Email sent ✅");
    } catch (err) {
      console.log("Email Error ❌:", err.message);
    }

    res.json({ msg: "Signup successful ✅" });

  } catch (err) {
    console.log("🔥 FULL ERROR:", err);
    res.status(500).json({ msg: err.message });
  }
});

/* ===== Login ===== */
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ msg: "All fields required" });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: "Invalid creds" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid creds" });

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      msg: "Login successful ✅",
      token
    });

  } catch (err) {
    console.log("🔥 LOGIN ERROR:", err);
    res.status(500).json({ msg: err.message });
  }
});

/* ===== MongoDB + Server Start ===== */
mongoose.connect(process.env.MONGO_URI, {
  family: 4
})
.then(() => {
  console.log("MongoDB Connected ✅");

  app.listen(5000, () => {
    console.log("Server running on port 5000 🚀");
  });
})
.catch(err => {
  console.log("MongoDB Error ❌:", err);
});