// middleware/auth.js — Token-based auth for monitoring staff
// Tokens are signed JWTs (see routes/auth.js) carrying an expiry, so a
// captured/old token stops working once it expires instead of being valid forever.

const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "tbj-dev-secret-change-me";

/**
 * requireAuth — Express middleware
 * Expects: Authorization: Bearer <token>
 * Also accepts: ?token=<token> (for quick testing)
 */
function requireAuth(req, res, next) {
  const authHeader = req.headers["authorization"] || "";
  const queryToken = req.query.token;

  let token = null;
  if (authHeader.startsWith("Bearer ")) {
    token = authHeader.slice(7).trim();
  } else if (queryToken) {
    token = queryToken;
  }

  if (!token) {
    return res.status(401).json({
      error: "Unauthorized",
      hint:  "Send Authorization: Bearer <token> header"
    });
  }

  try {
    req.staffUser = jwt.verify(token, JWT_SECRET);
    next();
  } catch (err) {
    const reason = err.name === "TokenExpiredError" ? "Token expired" : "Invalid token";
    return res.status(401).json({ error: reason });
  }
}

module.exports = { requireAuth };
