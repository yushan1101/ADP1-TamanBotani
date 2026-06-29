// routes/auth.js — POST /api/auth/login
// Simple credential check for lecturer/demo login flow.
// Credentials defined in .env or hardcoded defaults below.

const express = require("express");
const jwt     = require("jsonwebtoken");
const router  = express.Router();

const STAFF_USERS = [
  {
    username: process.env.STAFF_USERNAME || "admin",
    password: process.env.STAFF_PASSWORD || "tbj2026",
    name:     "Taman Botani Staff",
    role:     "staff"
  },
  {
    username: "demo",
    password: "demo123",
    name:     "Demo User",
    role:     "staff"
  }
];

// Secret used to sign tokens. Set JWT_SECRET in .env for production.
const JWT_SECRET  = process.env.JWT_SECRET || "tbj-dev-secret-change-me";
// How long a session stays valid before the user must log in again.
const TOKEN_TTL   = process.env.TOKEN_TTL || "8h";

// POST /api/auth/login
router.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: "username and password required" });
  }

  const user = STAFF_USERS.find(
    u => u.username === username && u.password === password
  );

  if (!user) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  // Token now carries an expiry (TOKEN_TTL) baked in and signed with JWT_SECRET,
  // so it can't just be replayed forever like the old static token.
  const token = jwt.sign(
    { username: user.username, role: user.role, name: user.name },
    JWT_SECRET,
    { expiresIn: TOKEN_TTL }
  );

  res.json({
    success: true,
    token,
    user: {
      name: user.name,
      role: user.role,
      username: user.username
    }
  });
});

// GET /api/auth/verify — Check if token is still valid (signature + expiry)
router.get("/verify", (req, res) => {
  const authHeader = req.headers["authorization"] || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7).trim() : req.query.token;

  if (!token) {
    return res.status(401).json({ valid: false, error: "No token provided" });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    res.json({
      valid: true,
      user: { name: payload.name, role: payload.role, username: payload.username }
    });
  } catch (err) {
    // Covers both expired tokens (TokenExpiredError) and tampered/invalid ones.
    const reason = err.name === "TokenExpiredError" ? "Token expired" : "Invalid token";
    res.status(401).json({ valid: false, error: reason });
  }
});

// POST /api/auth/logout — Client just drops the token, but we confirm
router.post("/logout", (req, res) => {
  res.json({ success: true, message: "Logged out" });
});

module.exports = router;
