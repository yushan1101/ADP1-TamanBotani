// routes/registration.js — public visitor/kiosk registration endpoints
const crypto = require("crypto");
const express = require("express");
const router = express.Router();
const pool = require("../db/connection");

const PURPOSES = new Set([
  "Jogging or Recreation",
  "Event or Activity",
  "Education or Research",
  "Homestay",
  "Tree-Planting Course",
  "Recreation",
  "Jogging"
]);

const ACTIVITIES = new Set(["Walking Trail", "Photography", "Picnic", "Study", "Others"]);
const RACES = new Set(["Malay", "Chinese", "Indian", "Mixed", "Others"]);

function pad2(value) {
  return String(value).padStart(2, "0");
}

function sqlDateTime(date = new Date()) {
  return [
    date.getFullYear(),
    pad2(date.getMonth() + 1),
    pad2(date.getDate())
  ].join("-") + " " + [
    pad2(date.getHours()),
    pad2(date.getMinutes()),
    pad2(date.getSeconds())
  ].join(":");
}

function cleanText(value) {
  return String(value || "").trim();
}

function normalizeGender(value) {
  return value === "Male" || value === "Female" ? value : "Other";
}

function normalizePurpose(value) {
  const purpose = cleanText(value);
  return PURPOSES.has(purpose) ? purpose : "Recreation";
}

function normalizeActivity(value) {
  const activity = cleanText(value);
  return ACTIVITIES.has(activity) ? activity : "Others";
}

function normalizeRace(value, fallback = "Others") {
  const race = cleanText(value);
  return RACES.has(race) ? race : fallback;
}

function requireAge(value) {
  const age = Number(value);
  if (!Number.isInteger(age) || age < 1 || age > 120) {
    return null;
  }
  return age;
}

async function createUniqueId(conn, table, prefix) {
  for (let attempt = 0; attempt < 8; attempt += 1) {
    const id = `${prefix}-${crypto.randomInt(100000, 999999)}`;
    const [[existing]] = await conn.execute(`SELECT id FROM ${table} WHERE id = ?`, [id]);
    if (!existing) return id;
  }
  throw new Error(`Could not allocate ${prefix} id`);
}

async function createUniqueHash(conn) {
  for (let attempt = 0; attempt < 8; attempt += 1) {
    const securityHash = crypto.randomBytes(4).toString("hex").toUpperCase();
    const [[existing]] = await conn.execute(
      "SELECT id FROM qr_passes WHERE security_hash = ?",
      [securityHash]
    );
    if (!existing) return securityHash;
  }
  throw new Error("Could not allocate QR security hash");
}

async function getEntryZoneId(conn) {
  const [[zone]] = await conn.execute("SELECT id FROM zones ORDER BY id LIMIT 1");
  if (zone) return zone.id;

  const [result] = await conn.execute(
    "INSERT INTO zones (name, capacity) VALUES (?, ?)",
    ["Main Gate", 500]
  );
  return result.insertId;
}

function badRequest(res, message) {
  return res.status(400).json({ error: message });
}

function parseImageDataUrl(imageData) {
  const match = cleanText(imageData).match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);
  if (!match) return null;
  return {
    mimeType: match[1],
    bytes: Buffer.from(match[2], "base64")
  };
}

function mapVisitorRow(row, createdAt) {
  return {
    id: row.id,
    name: row.name,
    phone: row.phone || "",
    age: row.age || "",
    gender: row.gender === "Other" ? "Prefer not to say" : row.gender,
    nationality: row.nationality,
    race: row.race,
    purpose: row.purpose,
    activity: row.activity,
    faceId: Boolean(row.face_id),
    status: "active",
    noPhoneVisitor: Boolean(row.no_phone_visitor),
    createdAt
  };
}

function normalizeFacePayload(body) {
  const imageData = cleanText(body.faceImageData);
  const liveness = body.liveness && typeof body.liveness === "object" ? body.liveness : {};
  const colorSequence = Array.isArray(liveness.colorSequence) ? liveness.colorSequence : [];
  const embedding = Array.isArray(body.embedding) ? body.embedding : [];

  if (!imageData || !imageData.startsWith("data:image/")) {
    return null;
  }
  if (imageData.length > 750000) {
    return null;
  }
  if (liveness.passed !== true || colorSequence.length < 8) {
    return null;
  }

  return {
    imageData,
    embeddingJson: JSON.stringify(embedding),
    livenessJson: JSON.stringify(liveness),
    colorSequence: colorSequence.join(", "),
    confidence: Number(body.confidence) || 0.96
  };
}

async function saveFaceEnrollment(conn, visitorId, source, body, enrolledAt) {
  const payload = normalizeFacePayload(body);
  if (!payload) return null;

  const faceId = await createUniqueId(conn, "face_enrollments", "FACE");
  await conn.execute(
    `INSERT INTO face_enrollments
     (id,visitor_id,source,image_data,embedding_json,liveness_json,color_sequence,confidence,status,enrolled_at)
     VALUES (?,?,?,?,?,?,?,?,?,?)`,
    [
      faceId,
      visitorId,
      source,
      payload.imageData,
      payload.embeddingJson,
      payload.livenessJson,
      payload.colorSequence,
      payload.confidence,
      "active",
      enrolledAt
    ]
  );

  await conn.execute("UPDATE visitors SET face_id = 1 WHERE id = ?", [visitorId]);

  return {
    id: faceId,
    visitorId,
    source,
    status: "active",
    confidence: payload.confidence,
    colorSequence: payload.colorSequence,
    enrolledAt
  };
}

// ─── POST /api/registration/visitor ──────────────────────────
// Creates an individual or group visitor registration and issues a QR pass.
router.post("/visitor", async (req, res) => {
  const body = req.body || {};
  const name = cleanText(body.name);
  const phone = cleanText(body.phone);
  const visitType = body.visitType === "Group" ? "Group" : "Individual";
  const age = requireAge(body.age);
  const agreed = body.privacyConsent === true || body.agreed === true;

  if (!name || !phone || age === null || !agreed) {
    return badRequest(res, "Name, phone, valid age and privacy consent are required.");
  }

  const participantCount = visitType === "Group" ? Number(body.participantCount) : 1;
  if (visitType === "Group") {
    if (!cleanText(body.organisation) || !cleanText(body.visitDate) || !cleanText(body.ageRange)) {
      return badRequest(res, "Organisation, visit date and age range are required for group registrations.");
    }
    if (!Number.isInteger(participantCount) || participantCount < 2 || participantCount > 500) {
      return badRequest(res, "Group participant count must be between 2 and 500.");
    }
  }

  const conn = await pool.getConnection();
  const createdAt = sqlDateTime();

  try {
    await conn.beginTransaction();

    const visitorId = await createUniqueId(conn, "visitors", visitType === "Group" ? "G" : "V");
    const passId = `QR-${visitorId}`;
    const securityHash = await createUniqueHash(conn);
    const purpose = normalizePurpose(body.purpose);
    const activity = normalizeActivity(body.activity);
    const ownerName = visitType === "Group" ? cleanText(body.organisation) : name;

    const visitorRow = {
      id: visitorId,
      name: ownerName,
      visitor_type: visitType,
      purpose,
      activity,
      phone,
      age: visitType === "Group" ? null : age,
      gender: visitType === "Group" ? null : normalizeGender(body.gender),
      nationality: cleanText(body.nationality) || "Malaysian",
      race: visitType === "Group" ? normalizeRace(body.dominantRace, "Mixed") : normalizeRace(body.race),
      leader_name: visitType === "Group" ? name : null,
      organisation: visitType === "Group" ? cleanText(body.organisation) : null,
      visit_date: visitType === "Group" ? cleanText(body.visitDate) : null,
      age_range: visitType === "Group" ? cleanText(body.ageRange) : null,
      dominant_race: visitType === "Group" ? normalizeRace(body.dominantRace, "Mixed") : null,
      participant_count: participantCount,
      face_id: 0,
      no_phone_visitor: 0,
      privacy_consent_at: createdAt,
      registration_channel: "Visitor App",
      registered_at: createdAt
    };

    await conn.execute(
      `INSERT INTO visitors
       (id,name,visitor_type,purpose,activity,phone,age,gender,nationality,race,leader_name,organisation,
        visit_date,age_range,dominant_race,participant_count,face_id,no_phone_visitor,privacy_consent_at,
        registration_channel,registered_at)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [
        visitorRow.id,
        visitorRow.name,
        visitorRow.visitor_type,
        visitorRow.purpose,
        visitorRow.activity,
        visitorRow.phone,
        visitorRow.age,
        visitorRow.gender,
        visitorRow.nationality,
        visitorRow.race,
        visitorRow.leader_name,
        visitorRow.organisation,
        visitorRow.visit_date,
        visitorRow.age_range,
        visitorRow.dominant_race,
        visitorRow.participant_count,
        visitorRow.face_id,
        visitorRow.no_phone_visitor,
        visitorRow.privacy_consent_at,
        visitorRow.registration_channel,
        visitorRow.registered_at
      ]
    );

    await conn.execute(
      `INSERT INTO qr_passes
       (id,visitor_id,owner_name,pass_type,security_hash,status,saved_to_phone,participant_count,age_range,dominant_race)
       VALUES (?,?,?,?,?,?,?,?,?,?)`,
      [
        passId,
        visitorId,
        ownerName,
        visitType === "Group" ? "Group" : "Personal",
        securityHash,
        "active",
        0,
        participantCount,
        visitorRow.age_range,
        visitorRow.dominant_race
      ]
    );

    await conn.execute(
      "INSERT INTO activity_log (event_time,event_text,event_type) VALUES (?,?,?)",
      [
        createdAt,
        `${visitType === "Group" ? "Group" : "Personal"} QR ${passId} generated for ${ownerName}`,
        "Registration"
      ]
    );

    await conn.commit();

    const pass = {
      id: passId,
      ownerId: visitorId,
      ownerName,
      type: visitType === "Group" ? "Group" : "Personal",
      hash: securityHash,
      status: "active",
      savedToPhone: false,
      participantCount,
      ageRange: visitorRow.age_range || undefined,
      dominantRace: visitorRow.dominant_race || undefined
    };

    const group = visitType === "Group" ? {
      id: visitorId,
      leaderName: name,
      organisation: ownerName,
      visitDate: visitorRow.visit_date,
      participantCount,
      ageRange: visitorRow.age_range,
      dominantRace: visitorRow.dominant_race,
      purpose,
      activity,
      status: "active"
    } : null;

    res.status(201).json({
      visitor: mapVisitorRow({
        ...visitorRow,
        name,
        age,
        gender: normalizeGender(body.gender),
        race: normalizeRace(body.race)
      }, createdAt),
      group,
      pass,
      log: `${createdAt} - ${pass.type} QR generated for ${pass.ownerName}`
    });
  } catch (err) {
    await conn.rollback();
    console.error("POST /registration/visitor:", err.message);
    res.status(500).json({ error: "Failed to register visitor" });
  } finally {
    conn.release();
  }
});

// ─── POST /api/registration/kiosk ────────────────────────────
// Registers a no-phone visitor, records Face ID consent, and checks them in.
router.post("/kiosk", async (req, res) => {
  const body = req.body || {};
  const name = cleanText(body.name);
  const age = requireAge(body.age);
  const agreed = body.privacyConsent === true || body.agreed === true;

  if (!name || age === null || !agreed) {
    return badRequest(res, "Name, valid age and biometric consent are required.");
  }

  const conn = await pool.getConnection();
  const createdAt = sqlDateTime();

  try {
    await conn.beginTransaction();

    const visitorId = await createUniqueId(conn, "visitors", "V");
    const visitId = await createUniqueId(conn, "visits", "VISIT");
    const kioskId = await createUniqueId(conn, "kiosk_registration_records", "KIOSK");
    const purpose = normalizePurpose(body.purpose);
    const activity = normalizeActivity(body.activity);
    const entryZoneId = await getEntryZoneId(conn);

    await conn.execute(
      `INSERT INTO visitors
       (id,name,visitor_type,purpose,activity,phone,age,gender,nationality,race,participant_count,face_id,
        no_phone_visitor,privacy_consent_at,registration_channel,registered_at)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [
        visitorId,
        name,
        "Individual",
        purpose,
        activity,
        cleanText(body.phone) || "No phone",
        age,
        normalizeGender(body.gender),
        cleanText(body.nationality) || "Malaysian",
        normalizeRace(body.race),
        1,
        1,
        1,
        createdAt,
        "Kiosk",
        createdAt
      ]
    );

    const faceEnrollment = await saveFaceEnrollment(conn, visitorId, "Kiosk", body, createdAt);
    if (!faceEnrollment) {
      await conn.rollback();
      return badRequest(res, "Face image and completed 8-colour liveness check are required.");
    }

    await conn.execute(
      `INSERT INTO visits
       (id,visitor_id,check_in_time,check_out_time,status,entry_method,current_zone_id,tag)
       VALUES (?,?,?,?,?,?,?,?)`,
      [visitId, visitorId, createdAt, null, "inside", "Face ID", entryZoneId, "No-phone visitor"]
    );

    await conn.execute(
      "INSERT INTO kiosk_registration_records (id,visitor_id,name,status,created_at) VALUES (?,?,?,?,?)",
      [kioskId, visitorId, name, "Face ID enrolled and entry recorded", createdAt]
    );

    await conn.execute(
      "INSERT INTO activity_log (event_time,event_text,event_type) VALUES (?,?,?)",
      [createdAt, `No-phone visitor ${name} enrolled Face ID at kiosk and checked in`, "Registration"]
    );

    await conn.commit();

    res.status(201).json({
      visitor: {
        id: visitorId,
        name,
        phone: cleanText(body.phone) || "No phone",
        age,
        gender: body.gender || "Female",
        nationality: body.nationality || "Malaysian",
        race: body.race || "Malay",
        purpose,
        activity,
        faceId: true,
        status: "active",
        noPhoneVisitor: true,
        createdAt
      },
      visit: {
        id: visitId,
        passId: "FACE-ID",
        visitorId,
        name,
        type: "No-phone visitor",
        channel: "Kiosk Face ID",
        status: "inside",
        count: 1,
        checkInTime: createdAt,
        checkOutTime: "",
        checkOutMethod: "",
        notificationTime: "",
        stillInside: false,
        zone: "Main Gate"
      },
      record: {
        id: kioskId,
        name,
        status: "Face ID enrolled and entry recorded",
        time: createdAt
      },
      faceEnrollment,
      log: `${createdAt} - No-phone visitor ${name} enrolled Face ID at kiosk; no QR generated.`
    });
  } catch (err) {
    await conn.rollback();
    console.error("POST /registration/kiosk:", err.message);
    res.status(500).json({ error: "Failed to register kiosk visitor" });
  } finally {
    conn.release();
  }
});

// ─── POST /api/registration/face-enrollment ──────────────────
// Enrolls Face ID for an existing visitor/pass from the mobile app.
router.post("/face-enrollment", async (req, res) => {
  const body = req.body || {};
  const visitorIdFromBody = cleanText(body.visitorId);
  const passId = cleanText(body.passId);
  const agreed = body.privacyConsent === true || body.agreed === true;

  if (!agreed) {
    return badRequest(res, "Biometric consent is required.");
  }

  const conn = await pool.getConnection();
  const enrolledAt = sqlDateTime();

  try {
    let visitorId = visitorIdFromBody;
    if (!visitorId && passId) {
      const [[pass]] = await conn.execute("SELECT visitor_id FROM qr_passes WHERE id = ?", [passId]);
      visitorId = pass?.visitor_id;
    }

    if (!visitorId) {
      return badRequest(res, "Visitor ID or QR pass ID is required.");
    }

    const [[visitor]] = await conn.execute("SELECT id, name FROM visitors WHERE id = ?", [visitorId]);
    if (!visitor) {
      return res.status(404).json({ error: "Visitor not found" });
    }

    await conn.beginTransaction();
    const faceEnrollment = await saveFaceEnrollment(conn, visitorId, "Visitor App", body, enrolledAt);
    if (!faceEnrollment) {
      await conn.rollback();
      return badRequest(res, "Face image and completed 8-colour liveness check are required.");
    }

    await conn.execute(
      "INSERT INTO activity_log (event_time,event_text,event_type) VALUES (?,?,?)",
      [enrolledAt, `Face ID enrolled for ${visitor.name} from visitor mobile app`, "Registration"]
    );

    await conn.commit();

    res.status(201).json({
      faceEnrollment,
      visitor: { id: visitorId, name: visitor.name, faceId: true },
      log: `${enrolledAt} - Face ID enrolled for ${visitor.name} from visitor mobile app.`
    });
  } catch (err) {
    await conn.rollback();
    console.error("POST /registration/face-enrollment:", err.message);
    res.status(500).json({ error: "Failed to enroll Face ID" });
  } finally {
    conn.release();
  }
});

// ─── GET /api/registration/face-enrollments ─────────────────
// Demo-only feed for reviewing captured Face ID images.
router.get("/face-enrollments", async (req, res) => {
  const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 50);

  try {
    const [rows] = await pool.execute(`
      SELECT
        fe.id,
        fe.visitor_id AS visitorId,
        COALESCE(v.name, 'Unknown visitor') AS visitorName,
        fe.source,
        fe.image_data AS imageData,
        CHAR_LENGTH(fe.image_data) AS imageSize,
        fe.confidence,
        fe.status,
        fe.enrolled_at AS enrolledAt
      FROM face_enrollments fe
      LEFT JOIN visitors v ON v.id = fe.visitor_id
      ORDER BY fe.enrolled_at DESC
      LIMIT ${limit}
    `);

    res.json({
      count: rows.length,
      enrollments: rows.map((row) => ({
        id: row.id,
        visitorId: row.visitorId,
        visitorName: row.visitorName,
        source: row.source,
        imageData: row.imageData,
        imageSize: Number(row.imageSize) || 0,
        confidence: Number(row.confidence) || 0,
        status: row.status,
        enrolledAt: row.enrolledAt
      }))
    });
  } catch (err) {
    console.error("GET /registration/face-enrollments:", err.message);
    res.status(500).json({ error: "Failed to load Face ID enrollments" });
  }
});

// ─── GET /api/registration/face-enrollments/:id/image ────────
// Demo-only direct image response for a single enrollment.
router.get("/face-enrollments/:id/image", async (req, res) => {
  try {
    const [[row]] = await pool.execute(
      "SELECT image_data FROM face_enrollments WHERE id = ?",
      [cleanText(req.params.id)]
    );
    if (!row) {
      return res.status(404).json({ error: "Face ID enrollment not found" });
    }

    const image = parseImageDataUrl(row.image_data);
    if (!image) {
      return res.status(422).json({ error: "Stored image data is invalid" });
    }

    res.type(image.mimeType).send(image.bytes);
  } catch (err) {
    console.error("GET /registration/face-enrollments/:id/image:", err.message);
    res.status(500).json({ error: "Failed to load Face ID image" });
  }
});

// ─── GET /api/registration/kiosk-records ─────────────────────
router.get("/kiosk-records", async (req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT id, name, status, created_at
      FROM kiosk_registration_records
      ORDER BY created_at DESC
      LIMIT 50
    `);

    res.json({
      records: rows.map((row) => ({
        id: row.id,
        name: row.name,
        status: row.status,
        time: sqlDateTime(new Date(row.created_at))
      }))
    });
  } catch (err) {
    console.error("GET /registration/kiosk-records:", err.message);
    res.status(500).json({ error: "Failed to fetch kiosk registration records" });
  }
});

module.exports = router;
