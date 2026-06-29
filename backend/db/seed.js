// ============================================================
// Taman Botani Johor — Seed Script  (FIXED: 50-100 visits/day)
// Run: node db/seed.js
// ============================================================
require("dotenv").config();
const mysql = require("mysql2/promise");

const DB_CONFIG = {
  host:     process.env.DB_HOST     || "localhost",
  port:     process.env.DB_PORT     || 3306,
  user:     process.env.DB_USER     || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME     || "taman_botani",
  multipleStatements: true
};

// ─── Anchor date ────────────────────────────────────────────
// Every "today/yesterday/this month" date in this file is computed relative
// to NOW (the moment you run this script) instead of a hardcoded date.
// That way the seeded data always lines up with CURDATE() in the app,
// no matter what day you actually run `npm run seed`.
const NOW = new Date();

// ─── Reference data ──────────────────────────────────────────
const ZONES = [
  { id: 1, name: "Main Gate",     capacity: 150 },
  { id: 2, name: "Lake Trail",    capacity: 200 },
  { id: 3, name: "Orchid Garden", capacity: 120 },
  { id: 4, name: "Herbarium",     capacity:  80 },
  { id: 5, name: "Palm Garden",   capacity: 100 },
  { id: 6, name: "Cafe Court",    capacity:  90 }
];

const MALAY_NAMES = [
  "Nur Alya Binti Razak","Ahmad Haziq Bin Zulkifli","Siti Nabilah Binti Idris",
  "Mohd Syazwan Bin Hassan","Farah Izzatul Binti Amin","Hairul Nizam Bin Talib",
  "Noraini Binti Saad","Khairul Amir Bin Osman","Rohayu Binti Maidin",
  "Fadzilah Binti Nordin","Zarith Sofea Binti Raja Azman","Nurhayati Binti Salleh",
  "Izzuddin Bin Jaafar","Amira Binti Ghazali","Razif Bin Basri",
  "Zainab Binti Mansor","Hafizuddin Bin Zakaria","Nabilah Binti Wahab",
  "Syahirah Binti Mustafa","Mohd Amir Bin Roslan","Hazwani Binti Ismail",
  "Faris Bin Abdul Wahab","Norzahirah Binti Kamaruddin","Azrul Fahmi Bin Daud",
  "Rabiatul Adawiyah Binti Yusoff","Muhamad Hakimi Bin Mohd Noor","Suhana Binti Halim",
  "Zulaikha Binti Zainal","Khairul Hafizuddin Bin Rusli","Noor Haslinda Binti Ahmad"
];
const CHINESE_NAMES = [
  "Tan Wei Liang","Lim Hui Ying","Wong Jia Min","Ng Kai Sheng","Lee Shu Fen",
  "Chong Mei Ling","Yap Ren Jie","Ong Zi Xuan","Goh Boon Keat","Chan Ying Ying",
  "Teoh Li Xuan","Koh Wee Liang","Chua Pei Shan","Loh Jia Wei","Sim Mei Kuan"
];
const INDIAN_NAMES = [
  "Rajan A/L Muthu","Priya A/P Seleena","Kumar A/L Subramaniam",
  "Deepa A/P Rajendran","Arjun A/L Krishnan","Vimala A/P Narayanan",
  "Nita A/P Ganesh","Raj A/L Balakrishnan","Kavitha A/P Suresh","Dinesh A/L Ravi"
];
const GROUP_NAMES = [
  { name: "SMK Taman Johor",     org: "SMK Taman Johor",      race: "Mixed" },
  { name: "SK Bukit Timbalan",   org: "SK Bukit Timbalan",    race: "Malay" },
  { name: "SJK(C) Chung Hwa",    org: "SJK(C) Chung Hwa",    race: "Chinese" },
  { name: "Persatuan Pencinta Alam JB", org: "PPAlam JB",     race: "Mixed" },
  { name: "Universiti Teknologi Malaysia (UTM)", org: "UTM",  race: "Mixed" },
  { name: "Kelab Komuniti Tampoi",org: "MPJBT",               race: "Malay" },
  { name: "Taman Daya Residents", org: "JMB Taman Daya",      race: "Chinese" },
  { name: "SMK Permas Jaya",      org: "SMK Permas Jaya",     race: "Malay" },
  { name: "Kelab Warga Emas Johor",org: "Jabatan Kebajikan",  race: "Mixed" },
  { name: "PTA Sri Mawar",        org: "PTA Sri Mawar",       race: "Malay" },
  { name: "Jabatan Pertanian Johor", org: "JabPertanian",     race: "Mixed" },
  { name: "SMK Sultan Ibrahim",   org: "SMK Sultan Ibrahim",  race: "Malay" }
];

const PURPOSES   = ["Recreation","Education","Photography","Jogging","Events","Tourism"];
const ENTRY_METHODS = ["QR","Face ID","Manual"];

// ─── Helpers ─────────────────────────────────────────────────
const rnd     = (min, max) => Math.floor(min + Math.random() * (max - min + 1));
const pick    = arr => arr[rnd(0, arr.length - 1)];
const pad2    = n => String(n).padStart(2, "0");

function fmtDatetime(date) {
  return `${date.getFullYear()}-${pad2(date.getMonth()+1)}-${pad2(date.getDate())} ${pad2(date.getHours())}:${pad2(date.getMinutes())}:${pad2(date.getSeconds())}`;
}

// Random datetime within a given day, biased to park hours (8am-6pm)
function randomCheckin(dateObj) {
  const d = new Date(dateObj);
  // Weighted hour distribution: peak 9-11am, secondary 2-4pm
  const hours = [8,8,9,9,9,9,9,10,10,10,10,10,11,11,11,12,12,13,13,14,14,14,15,15,15,16,16,17];
  const hour  = pick(hours);
  const min   = rnd(0, 59);
  d.setHours(hour, min, rnd(0, 59), 0);
  return d;
}

// ─── Build visitors ───────────────────────────────────────────
function buildVisitors() {
  const rows = [];

  // Individual visitors — 55 total
  const allIndNames = [...MALAY_NAMES, ...CHINESE_NAMES, ...INDIAN_NAMES];
  allIndNames.forEach((name, i) => {
    const idx   = i + 1;
    const race  = i < MALAY_NAMES.length ? "Malay" : i < MALAY_NAMES.length + CHINESE_NAMES.length ? "Chinese" : "Indian";
    rows.push({
      id:               `V-${1000 + idx}`,
      name,
      visitor_type:     "Individual",
      purpose:          pick(PURPOSES),
      phone:            `0${rnd(10,19)}-${rnd(1000000,9999999)}`,
      age:              rnd(12, 68),
      gender:           pick(["Male","Female"]),
      nationality:      "Malaysian",
      race,
      organisation:     null,
      participant_count: 1,
      face_id:          Math.random() > 0.4,
      registered_at:    null
    });
  });

  // Group visitors
  GROUP_NAMES.forEach((g, i) => {
    rows.push({
      id:               `G-${200 + i + 1}`,
      name:             g.name,
      visitor_type:     "Group",
      purpose:          i < 4 ? "Education" : pick(["Recreation","Events","Tourism"]),
      phone:            `07-${rnd(1000000,9999999)}`,
      age:              null,
      gender:           null,
      nationality:      "Malaysian",
      race:             g.race,
      organisation:     g.org,
      participant_count: rnd(10, 45),
      face_id:          false,
      registered_at:    null
    });
  });

  return rows;
}

// ─── Build visits  (FIXED: 50-100+ visits/day) ───────────────
function buildVisits(visitors) {
  const visits  = [];
  const logs    = [];
  let   visitNo = 3000;

  const indVisitors   = visitors.filter(v => v.visitor_type === "Individual");
  const groupVisitors = visitors.filter(v => v.visitor_type === "Group");

  // Date range: 12 months of history up to (but not including) today.
  // Anchored to the actual moment the seed script runs, so "today" in the
  // app always lines up with whatever day you actually run `npm run seed`.
  const startDate = new Date(NOW);
  startDate.setFullYear(startDate.getFullYear() - 1);
  startDate.setDate(startDate.getDate() + 1); // 12 months back, +1 day
  startDate.setHours(0, 0, 0, 0);

  const endDate = new Date(NOW);
  endDate.setDate(endDate.getDate() - 1); // yesterday — today is handled separately
  endDate.setHours(0, 0, 0, 0);

  // Realistic daily targets for a botanical garden in Johor
  // Weekday: 50-70, Weekend: 80-120, School holidays: +20-40 extra
  // Months (1-12, any year) that roughly correspond to Malaysian school
  // holiday / festive periods — kept as calendar months so this works
  // correctly no matter which year the seed actually runs in.
  const schoolHolidayMonths = new Set([6, 7, 8, 9, 11, 12, 1, 2]);

  // Only generate activity-log entries for the last few days of history —
  // relative to NOW, not a hardcoded date — to keep the log table small.
  const recentLogCutoff = new Date(endDate);
  recentLogCutoff.setDate(recentLogCutoff.getDate() - 3);

  const cur = new Date(startDate);
  while (cur <= endDate) {
    const isWeekend = cur.getDay() === 0 || cur.getDay() === 6;
    const isHoliday = schoolHolidayMonths.has(cur.getMonth() + 1);

    // Base visits per day (individual visits, each = 1 person)
    let dailyBase = isWeekend ? rnd(70, 110) : rnd(45, 70);
    if (isHoliday) dailyBase += rnd(15, 35);

    // Each day: generate individual visits
    for (let v = 0; v < dailyBase; v++) {
      const visitor    = pick(indVisitors);
      const checkIn    = randomCheckin(cur);
      const stayMins   = rnd(30, 240);
      const checkOut   = new Date(checkIn.getTime() + stayMins * 60000);
      const zone       = pick(ZONES);
      const method     = pick(ENTRY_METHODS);

      let tag = "Normal";
      if (stayMins > 180) tag = "Long stay";

      const vid = `VISIT-${visitNo++}`;
      visits.push({
        id:             vid,
        visitor_id:     visitor.id,
        check_in_time:  fmtDatetime(checkIn),
        check_out_time: fmtDatetime(checkOut),
        status:         "exited",
        entry_method:   method,
        current_zone_id: zone.id,
        tag
      });
    }

    // Group visits: 0-3 per day (weekends more likely)
    const groupCount = isWeekend ? rnd(1, 3) : rnd(0, 1);
    for (let g = 0; g < groupCount; g++) {
      const visitor  = pick(groupVisitors);
      const checkIn  = randomCheckin(cur);
      const stayMins = rnd(60, 180);
      const checkOut = new Date(checkIn.getTime() + stayMins * 60000);
      const zone     = pick(ZONES);

      const vid = `VISIT-${visitNo++}`;
      visits.push({
        id:             vid,
        visitor_id:     visitor.id,
        check_in_time:  fmtDatetime(checkIn),
        check_out_time: fmtDatetime(checkOut),
        status:         "exited",
        entry_method:   "Group QR",
        current_zone_id: zone.id,
        tag: "Group"
      });

      // Activity log for recent dates
      if (cur >= recentLogCutoff) {
        logs.push({
          event_time:  fmtDatetime(checkIn),
          event_text:  `${visitor.name} group checked in at ${zone.name}`,
          event_type:  "Check-in"
        });
      }
    }

    // Activity logs for recent individual visits
    if (cur >= recentLogCutoff) {
      // Log a sample of today's check-ins
      const sampleSize = Math.min(8, dailyBase);
      for (let s = 0; s < sampleSize; s++) {
        const v   = pick(indVisitors);
        const cin = randomCheckin(cur);
        logs.push({
          event_time: fmtDatetime(cin),
          event_text: `${v.name} checked in at ${pick(ZONES).name}`,
          event_type: "Check-in"
        });
      }
    }

    cur.setDate(cur.getDate() + 1);
  }

  return { visits, logs };
}

// ─── Build today's active visits ─────────────────────────────
function buildActiveVisits(visitors) {
  const today = new Date(NOW);
  today.setHours(0, 0, 0, 0);
  const active   = [];
  const logs     = [];
  let   visitNo  = 100000; // far above any possible historical visit count, to avoid ID collisions

  const indVisitors   = visitors.filter(v => v.visitor_type === "Individual");
  const groupVisitors = visitors.filter(v => v.visitor_type === "Group");

  // Simulate visitors who already exited today (morning rush)
  const exitedToday = rnd(45, 60);
  for (let i = 0; i < exitedToday; i++) {
    const visitor  = pick(indVisitors);
    const checkIn  = randomCheckin(today);
    checkIn.setHours(rnd(8, 10), rnd(0, 59), 0, 0);
    const stayMins = rnd(30, 120);
    const checkOut = new Date(checkIn.getTime() + stayMins * 60000);
    // Ensure checkout is before 11:30am
    if (checkOut.getHours() > 11) checkOut.setHours(11, rnd(0, 29), 0, 0);
    const zone   = pick(ZONES);
    const vid    = `VISIT-${visitNo++}`;
    active.push({
      id: vid, visitor_id: visitor.id,
      check_in_time: fmtDatetime(checkIn),
      check_out_time: fmtDatetime(checkOut),
      status: "exited", entry_method: pick(ENTRY_METHODS),
      current_zone_id: zone.id, tag: "Normal"
    });
    logs.push({
      event_time: fmtDatetime(checkOut),
      event_text: `${visitor.name} exited at ${zone.name}`,
      event_type: "Exit"
    });
  }

  // Currently inside — 18-25 active visitors
  const insideCount = rnd(18, 25);
  const shuffled    = [...indVisitors].sort(() => Math.random() - 0.5).slice(0, insideCount);
  shuffled.forEach((visitor) => {
    const zone    = pick(ZONES);
    const checkIn = new Date(today);
    checkIn.setHours(rnd(8, 11), rnd(0, 59), 0, 0);
    const method  = pick(ENTRY_METHODS);

    const vid = `VISIT-${visitNo++}`;
    active.push({
      id:             vid,
      visitor_id:     visitor.id,
      check_in_time:  fmtDatetime(checkIn),
      check_out_time: null,
      status:         "inside",
      entry_method:   method,
      current_zone_id: zone.id,
      tag: "Normal"
    });

    logs.push({
      event_time:  fmtDatetime(checkIn),
      event_text:  `${visitor.name} checked in at ${zone.name}`,
      event_type:  "Check-in"
    });
  });

  // 1-2 groups active today
  const grpSlice = groupVisitors.slice(0, 2);
  grpSlice.forEach(visitor => {
    const zone    = pick(ZONES);
    const checkIn = new Date(today);
    checkIn.setHours(rnd(8, 10), rnd(0, 59), 0, 0);
    const vid = `VISIT-${visitNo++}`;
    active.push({
      id: vid, visitor_id: visitor.id,
      check_in_time: fmtDatetime(checkIn),
      check_out_time: null,
      status: "inside", entry_method: "Group QR",
      current_zone_id: zone.id, tag: "Group"
    });
    logs.push({
      event_time: fmtDatetime(checkIn),
      event_text: `${visitor.name} group (${visitor.participant_count} pax) checked in at ${zone.name}`,
      event_type: "Check-in"
    });
  });

  // Add some movement/density logs — anchored to today, not a fixed date
  const atToday = (h, m) => {
    const d = new Date(today);
    d.setHours(h, m, 0, 0);
    return fmtDatetime(d);
  };
  logs.push(
    { event_time: atToday(11, 46), event_text: "Group G-201 moved from Orchid Garden to Herbarium", event_type: "Movement" },
    { event_time: atToday(11, 44), event_text: "SMK Taman Johor group entered via Main Gate checkpoint", event_type: "Check-in" },
    { event_time: atToday(11, 39), event_text: "Crowd density elevated at Main Gate (82%)", event_type: "Density" },
    { event_time: atToday(11, 36), event_text: "Ahmad Haziq Bin Zulkifli moved to Lake Trail checkpoint", event_type: "Movement" },
    { event_time: atToday(11, 31), event_text: "Priya A/P Seleena exited at Exit Gate", event_type: "Exit" }
  );

  return { active, logs };
}

// ─── Build alerts ─────────────────────────────────────────────
function buildAlerts() {
  const today = new Date(NOW); today.setHours(0, 0, 0, 0);
  const dayAgo = (n) => { const d = new Date(today); d.setDate(d.getDate() - n); return d; };
  const at = (date, h, m) => {
    const d = new Date(date);
    d.setHours(h, m, 0, 0);
    return fmtDatetime(d);
  };

  return [
    { id: "AL-001", message: "Main Gate occupancy reached 82% — moderate crowd forming near ticket counter", severity: "Warning",  status: "Active",   zone_id: 1, created_at: at(today, 11, 39), resolved_at: null },
    { id: "AL-002", message: "Visitor V-1003 flagged for long stay beyond 3 hours at Orchid Garden",        severity: "Info",     status: "Active",   zone_id: 3, created_at: at(today, 11, 20), resolved_at: null },
    { id: "AL-003", message: "Orchid Garden exceeded moderate crowd threshold (76%)",                        severity: "Warning",  status: "Resolved", zone_id: 3, created_at: at(dayAgo(1), 14, 10), resolved_at: at(dayAgo(1), 15, 0) },
    { id: "AL-004", message: "Lake Trail density spike — heavy footfall after SMK Permas Jaya group arrival",severity: "Warning",  status: "Resolved", zone_id: 2, created_at: at(dayAgo(1), 10, 30), resolved_at: at(dayAgo(1), 11, 15) },
    { id: "AL-005", message: "Cafe Court reached 94% capacity during lunch hour",                            severity: "Critical", status: "Resolved", zone_id: 6, created_at: at(dayAgo(2), 12, 58), resolved_at: at(dayAgo(2), 13, 30) }
  ];
}

// ─── Build reports ────────────────────────────────────────────
function buildReports() {
  const today = new Date(NOW); today.setHours(0, 0, 0, 0);
  const dayAgo   = (n) => { const d = new Date(today); d.setDate(d.getDate() - n); return d; };
  const monthAgo = (n) => { const d = new Date(today); d.setMonth(d.getMonth() - n); return d; };
  const at = (date, h, m) => { const d = new Date(date); d.setHours(h, m, 0, 0); return fmtDatetime(d); };
  const fmtLong  = (d) => d.toLocaleDateString("en-MY", { day: "numeric", month: "long", year: "numeric" });
  const fmtMonthYear = (d) => d.toLocaleDateString("en-MY", { month: "long", year: "numeric" });

  // Week boundaries (Mon–Sun) for the most recently completed week and the one before it.
  const startOfWeek = (d) => {
    const w = new Date(d);
    const diff = (w.getDay() + 6) % 7; // days since Monday
    w.setDate(w.getDate() - diff);
    return w;
  };
  const thisWeekStart = startOfWeek(today);
  const lastWeekStart = dayAgo(7 - ((today.getDay() + 6) % 7) + 7); // start of the week before thisWeekStart
  const lastWeekEnd   = new Date(thisWeekStart); lastWeekEnd.setDate(lastWeekEnd.getDate() - 1);
  const prevWeekStart = new Date(lastWeekStart); prevWeekStart.setDate(prevWeekStart.getDate() - 7);
  const prevWeekEnd   = new Date(lastWeekStart); prevWeekEnd.setDate(prevWeekEnd.getDate() - 1);

  const fmtDay = (d) => d.toLocaleDateString("en-MY", { day: "numeric", month: "short" });

  return [
    { id: "RPT-001", title: `Daily Operations Report — ${fmtLong(dayAgo(1))}`,        report_type: "Daily",   format: "PDF",   period_label: fmtLong(dayAgo(1)),                                   file_size: "1.2 MB", status: "Ready", generated_at: at(dayAgo(1), 23, 5) },
    { id: "RPT-002", title: `Weekly Summary Report — ${fmtDay(lastWeekStart)} – ${fmtDay(lastWeekEnd)}`, report_type: "Weekly",  format: "PDF",   period_label: `${fmtDay(lastWeekStart)} – ${fmtDay(lastWeekEnd)}`, file_size: "3.8 MB", status: "Ready", generated_at: at(lastWeekEnd, 8, 0) },
    { id: "RPT-003", title: `Visitor Analytics Export — ${fmtMonthYear(monthAgo(1))}`, report_type: "Monthly", format: "Excel", period_label: fmtMonthYear(monthAgo(1)),                            file_size: "2.4 MB", status: "Ready", generated_at: at(monthAgo(0), 6, 30) },
    { id: "RPT-004", title: `Daily Operations Report — ${fmtLong(dayAgo(2))}`,        report_type: "Daily",   format: "PDF",   period_label: fmtLong(dayAgo(2)),                                   file_size: "1.1 MB", status: "Ready", generated_at: at(dayAgo(2), 23, 5) },
    { id: "RPT-005", title: "Peak Season Analysis — Quarterly Review",                report_type: "Custom",  format: "PDF",   period_label: `${fmtMonthYear(monthAgo(2))} – ${fmtMonthYear(today)}`, file_size: "5.7 MB", status: "Ready", generated_at: at(dayAgo(8), 14, 0) },
    { id: "RPT-006", title: `Visitor Demographics Report — ${fmtMonthYear(today)} (MTD)`, report_type: "Monthly", format: "Excel", period_label: `1 – ${today.getDate()} ${today.toLocaleDateString("en-MY", { month: "long", year: "numeric" })}`, file_size: "1.9 MB", status: "Ready", generated_at: at(today, 7, 0) },
    { id: "RPT-007", title: `Weekly Summary Report — ${fmtDay(prevWeekStart)} – ${fmtDay(prevWeekEnd)}`, report_type: "Weekly",  format: "PDF",   period_label: `${fmtDay(prevWeekStart)} – ${fmtDay(prevWeekEnd)}`, file_size: "3.5 MB", status: "Ready", generated_at: at(prevWeekEnd, 8, 0) },
    { id: "RPT-008", title: `Visitor Analytics Export — ${fmtMonthYear(monthAgo(2))}`, report_type: "Monthly", format: "Excel", period_label: fmtMonthYear(monthAgo(2)),                            file_size: "2.6 MB", status: "Ready", generated_at: at(monthAgo(1), 6, 30) }
  ];
}

// ─── Main seeder ──────────────────────────────────────────────
async function seed() {
  const conn = await mysql.createConnection(DB_CONFIG);
  console.log("✅ Connected to MySQL");

  try {
    console.log("🗑  Clearing old data…");
    await conn.execute("SET FOREIGN_KEY_CHECKS=0");
    for (const t of ["activity_log","alerts","visits","visitors","zones","reports"]) {
      await conn.execute(`TRUNCATE TABLE ${t}`);
    }
    await conn.execute("SET FOREIGN_KEY_CHECKS=1");

    // Zones
    console.log("📍 Seeding zones…");
    for (const z of ZONES) {
      await conn.execute("INSERT INTO zones (id,name,capacity) VALUES (?,?,?)", [z.id, z.name, z.capacity]);
    }

    // Visitors
    const visitors = buildVisitors();
    console.log(`👤 Seeding ${visitors.length} visitors…`);
    for (const v of visitors) {
      // Registered sometime in the 6-12 months before now (relative, not hardcoded).
      const regDate = new Date(NOW);
      regDate.setDate(regDate.getDate() - rnd(180, 365));
      const regAt = v.registered_at || fmtDatetime(regDate).replace(/\d{2}:\d{2}:\d{2}$/, "09:00:00");
      await conn.execute(
        `INSERT INTO visitors (id,name,visitor_type,purpose,phone,age,gender,nationality,race,organisation,participant_count,face_id,registered_at)
         VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        [v.id, v.name, v.visitor_type, v.purpose, v.phone, v.age, v.gender,
         v.nationality, v.race, v.organisation, v.participant_count, v.face_id ? 1 : 0, regAt]
      );
    }

    // Historical visits
    const { visits: histVisits, logs: histLogs } = buildVisits(visitors);
    console.log(`📋 Seeding ${histVisits.length} historical visits (expect ~20,000+)…`);
    // Batch insert for speed
    const BATCH = 200;
    for (let i = 0; i < histVisits.length; i += BATCH) {
      const batch = histVisits.slice(i, i + BATCH);
      const placeholders = batch.map(() => "(?,?,?,?,?,?,?,?)").join(",");
      const values = batch.flatMap(v => [v.id, v.visitor_id, v.check_in_time, v.check_out_time, v.status, v.entry_method, v.current_zone_id, v.tag]);
      await conn.execute(
        `INSERT INTO visits (id,visitor_id,check_in_time,check_out_time,status,entry_method,current_zone_id,tag) VALUES ${placeholders}`,
        values
      );
      if (i % 2000 === 0) process.stdout.write(`  ${i}/${histVisits.length} visits…\r`);
    }
    console.log(`  ✅ ${histVisits.length} historical visits inserted          `);

    // Active visits (today)
    const { active: activeVisits, logs: activeLogs } = buildActiveVisits(visitors);
    console.log(`🟢 Seeding ${activeVisits.length} today's visits (${activeVisits.filter(v=>v.status==="inside").length} active inside)…`);
    for (const visit of activeVisits) {
      await conn.execute(
        `INSERT INTO visits (id,visitor_id,check_in_time,check_out_time,status,entry_method,current_zone_id,tag)
         VALUES (?,?,?,?,?,?,?,?)`,
        [visit.id, visit.visitor_id, visit.check_in_time, visit.check_out_time,
         visit.status, visit.entry_method, visit.current_zone_id, visit.tag]
      );
    }

    // Alerts
    const alerts = buildAlerts();
    console.log(`🔔 Seeding ${alerts.length} alerts…`);
    for (const a of alerts) {
      await conn.execute(
        `INSERT INTO alerts (id,message,severity,status,zone_id,created_at,resolved_at) VALUES (?,?,?,?,?,?,?)`,
        [a.id, a.message, a.severity, a.status, a.zone_id, a.created_at, a.resolved_at]
      );
    }

    // Activity logs
    const allLogs = [...histLogs, ...activeLogs].sort((a,b) => a.event_time < b.event_time ? -1 : 1);
    console.log(`📝 Seeding ${allLogs.length} activity log entries…`);
    for (const log of allLogs) {
      await conn.execute(
        "INSERT INTO activity_log (event_time,event_text,event_type) VALUES (?,?,?)",
        [log.event_time, log.event_text, log.event_type]
      );
    }

    // Reports
    const reports = buildReports();
    console.log(`📄 Seeding ${reports.length} reports…`);
    for (const r of reports) {
      await conn.execute(
        `INSERT INTO reports (id,title,report_type,format,period_label,file_size,status,generated_at) VALUES (?,?,?,?,?,?,?,?)`,
        [r.id, r.title, r.report_type, r.format, r.period_label, r.file_size, r.status, r.generated_at]
      );
    }

    const totalVisits = histVisits.length + activeVisits.length;
    const seedStart = new Date(NOW); seedStart.setFullYear(seedStart.getFullYear() - 1);
    const daysSeeded = Math.round((NOW - seedStart) / (1000*60*60*24));
    console.log("\n✅ Seed complete!");
    console.log(`   Zones:       ${ZONES.length}`);
    console.log(`   Visitors:    ${visitors.length}`);
    console.log(`   Total visits: ${totalVisits} over ${daysSeeded} days (~${Math.round(totalVisits/daysSeeded)}/day avg)`);
    console.log(`   Active now:   ${activeVisits.filter(v=>v.status==="inside").length} inside`);
    console.log(`   Alerts:       ${alerts.length}`);
    console.log(`   Logs:         ${allLogs.length}`);
    console.log(`   Reports:      ${reports.length}`);

  } catch (err) {
    console.error("❌ Seed failed:", err.message);
    throw err;
  } finally {
    await conn.end();
  }
}

seed();
