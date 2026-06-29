const express = require("express");
const router = express.Router();
const pool = require("../db/connection");

const TABLE_SQL = `
  CREATE TABLE IF NOT EXISTS visitor_feedback (
    feedback_id VARCHAR(20) PRIMARY KEY,
    visitor_name VARCHAR(100) NOT NULL DEFAULT 'Anonymous Visitor',
    rating INT NOT NULL,
    category VARCHAR(50) NOT NULL,
    feedback_text TEXT NOT NULL,
    is_anonymous BOOLEAN NOT NULL DEFAULT FALSE,
    status ENUM('New','Reviewed','Responded') NOT NULL DEFAULT 'New',
    sentiment_label ENUM('Positive','Neutral','Negative') NOT NULL DEFAULT 'Neutral',
    sentiment_score DECIMAL(4,2) NOT NULL DEFAULT 0.00,
    keywords_extracted JSON,
    staff_response TEXT,
    responded_by VARCHAR(100),
    responded_at DATETIME,
    submitted_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  )
`;

let tableReadyPromise;

function ensureTable() {
  if (!tableReadyPromise) {
    tableReadyPromise = pool.execute(TABLE_SQL);
  }
  return tableReadyPromise;
}

function createFeedbackId() {
  return `FB-${Date.now().toString().slice(-6)}${Math.floor(Math.random() * 90 + 10)}`;
}

function analyseSentiment(text, rating) {
  const lowerText = text.toLowerCase();
  const negativeWords = ["bad", "dirty", "slow", "crowded", "angry", "rude", "poor", "problem", "issue", "hate", "unhappy", "disappointed", "unsafe", "long queue"];
  const positiveWords = ["good", "great", "nice", "clean", "helpful", "beautiful", "excellent", "happy", "love", "friendly", "enjoy"];

  const negativeScore = negativeWords.filter((word) => lowerText.includes(word)).length;
  const positiveScore = positiveWords.filter((word) => lowerText.includes(word)).length;

  if (rating >= 4 && positiveScore >= negativeScore) {
    return { label: "Positive", score: 0.91 };
  }

  if (rating <= 2 || negativeScore > positiveScore) {
    return { label: "Negative", score: 0.86 };
  }

  return { label: "Neutral", score: 0.78 };
}

function extractKeywords(text, category) {
  const lowerText = text.toLowerCase();
  const keywords = category ? [category] : [];
  const keywordMap = {
    Facilities: ["facility", "facilities", "surau", "toilet", "cafeteria", "playground", "bench"],
    Cleanliness: ["clean", "dirty", "rubbish", "trash", "toilet"],
    Crowding: ["crowd", "crowded", "queue", "busy", "people"],
    Staff: ["staff", "guard", "helpful", "rude", "service"],
    Parking: ["parking", "car", "vehicle"],
    Safety: ["danger", "injury", "unsafe", "emergency"],
  };

  Object.entries(keywordMap).forEach(([label, words]) => {
    if (words.some((word) => lowerText.includes(word))) {
      keywords.push(label);
    }
  });

  return [...new Set(keywords)].slice(0, 6);
}

function parseKeywords(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  try {
    return JSON.parse(value);
  } catch {
    return [];
  }
}

function toFeedbackRecord(row) {
  return {
    ...row,
    rating: Number(row.rating),
    is_anonymous: Boolean(row.is_anonymous),
    sentiment_score: Number(row.sentiment_score),
    keywords_extracted: parseKeywords(row.keywords_extracted),
  };
}

router.post("/", async (req, res) => {
  const rating = Number(req.body.rating);
  const category = String(req.body.category || "").trim();
  const isAnonymous = Boolean(req.body.is_anonymous ?? req.body.isAnonymous);
  const visitorName = isAnonymous
    ? "Anonymous Visitor"
    : String(req.body.visitor_name || req.body.visitorName || "Visitor").trim();
  const feedbackText = String(req.body.feedback_text || req.body.feedbackText || "").trim() || "No written comment provided.";

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return res.status(400).json({ error: "Rating is required and must be between 1 and 5" });
  }

  if (!category) {
    return res.status(400).json({ error: "Category is required" });
  }

  const feedbackId = createFeedbackId();
  const sentiment = analyseSentiment(feedbackText, rating);
  const keywords = extractKeywords(feedbackText, category);

  try {
    await ensureTable();
    await pool.execute(
      `INSERT INTO visitor_feedback
        (feedback_id, visitor_name, rating, category, feedback_text, is_anonymous,
         status, sentiment_label, sentiment_score, keywords_extracted)
       VALUES (?, ?, ?, ?, ?, ?, 'New', ?, ?, ?)`,
      [
        feedbackId,
        visitorName || "Visitor",
        rating,
        category,
        feedbackText,
        isAnonymous,
        sentiment.label,
        sentiment.score,
        JSON.stringify(keywords),
      ]
    );

    const [[row]] = await pool.execute(
      "SELECT * FROM visitor_feedback WHERE feedback_id = ?",
      [feedbackId]
    );

    res.status(201).json({ feedback: toFeedbackRecord(row) });
  } catch (err) {
    console.error("POST /feedback:", err.message);
    res.status(500).json({ error: "Failed to save feedback" });
  }
});

router.get("/", async (req, res) => {
  try {
    await ensureTable();
    const [rows] = await pool.execute(
      "SELECT * FROM visitor_feedback ORDER BY submitted_at DESC"
    );

    res.json({ feedback: rows.map(toFeedbackRecord) });
  } catch (err) {
    console.error("GET /feedback:", err.message);
    res.status(500).json({ error: "Failed to fetch feedback records" });
  }
});

router.patch("/:id/status", async (req, res) => {
  const { id } = req.params;
  const { status, staff_response, staffResponse, responded_by, respondedBy } = req.body;
  const allowedStatuses = ["New", "Reviewed", "Responded"];

  if (!allowedStatuses.includes(status)) {
    return res.status(400).json({ error: "Status must be New, Reviewed, or Responded" });
  }

  try {
    await ensureTable();
    await pool.execute(
      `UPDATE visitor_feedback
       SET status = ?,
           staff_response = COALESCE(?, staff_response),
           responded_by = COALESCE(?, responded_by),
           responded_at = CASE WHEN ? = 'Responded' THEN NOW() ELSE responded_at END
       WHERE feedback_id = ?`,
      [
        status,
        staff_response ?? staffResponse ?? null,
        responded_by ?? respondedBy ?? null,
        status,
        id,
      ]
    );

    const [[row]] = await pool.execute(
      "SELECT * FROM visitor_feedback WHERE feedback_id = ?",
      [id]
    );

    if (!row) {
      return res.status(404).json({ error: "Feedback record not found" });
    }

    res.json({ feedback: toFeedbackRecord(row) });
  } catch (err) {
    console.error("PATCH /feedback/:id/status:", err.message);
    res.status(500).json({ error: "Failed to update feedback status" });
  }
});

module.exports = router;
