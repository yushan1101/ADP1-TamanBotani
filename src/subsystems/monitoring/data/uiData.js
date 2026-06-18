// ─── Static seed (for components that don't need live refresh) ───────────────
export const visitorRows = [
  ["V-1028", "Nur Alya",        "Recreation", "Inside",  "Palm Garden", "11:28", "Normal"],
  ["V-1041", "Daniel Tan",      "Jogging",    "Inside",  "Lake Trail",  "11:36", "Long stay"],
  ["G-204",  "SMK Johor Group", "Education",  "Inside",  "Herbarium",   "11:44", "Group"],
  ["V-1077", "Priya Nair",      "Photography","Exited",  "Exit Gate",   "10:58", "Closed"]
];

export const zones = [
  { name: "Main Gate",     count: 74, level: "High",     fill: 82 },
  { name: "Lake Trail",    count: 42, level: "Moderate", fill: 55 },
  { name: "Orchid Garden", count: 26, level: "Normal",   fill: 34 },
  { name: "Herbarium",     count: 51, level: "Moderate", fill: 62 }
];

// ─── Helpers ─────────────────────────────────────────────────────────────────
function rnd(min, max) { return Math.floor(min + Math.random() * (max - min + 1)); }
function levelFromFill(f) { return f >= 75 ? "High" : f >= 45 ? "Moderate" : "Normal"; }

// ─── Filter-aware snapshot generator ─────────────────────────────────────────
// filters: { period, type, purpose, holidays } — any subset, all optional
export function getSystemSnapshot(filters = {}) {
  const { period = "This month", type = "All types", purpose = "All purposes", holidays = "Holidays included" } = filters;

  // Scale multipliers by filter selection so numbers visibly change
  const periodScale   = period   === "This month"   ? 1.0  : period === "Last month" ? 0.88 : 1.18;
  const typeScale     = type     === "All types"    ? 1.0  : type   === "Individual" ? 0.62 : 0.38;
  const purposeScale  = purpose  === "All purposes" ? 1.0  : purpose === "Recreation"? 0.52 : 0.35;
  const holidayScale  = holidays === "Holidays included" ? 1.0 : 0.83;
  const scale         = periodScale * typeScale * purposeScale * holidayScale;

  // Live stats
  const visitors = Math.round(rnd(170, 230) * scale);
  const capacity = Math.round((visitors / 400) * 100);
  const alerts   = rnd(1, 3);

  // Zones — also scale a bit
  const liveZones = [
    { name: "Main Gate",     fill: rnd(60, 92) },
    { name: "Lake Trail",    fill: rnd(30, 68) },
    { name: "Orchid Garden", fill: rnd(18, 54) },
    { name: "Herbarium",     fill: rnd(38, 74) }
  ].map(z => ({
    ...z,
    fill:  Math.min(99, Math.round(z.fill * scale + rnd(-5, 5))),
    count: Math.round(z.fill * 1.1 * scale),
    level: levelFromFill(Math.min(99, Math.round(z.fill * scale)))
  }));

  // Analytics — bar chart heights change per filter
  const baseHeights = [42, 48, 56, 52, 70, 78, 66, 72, 61, 69, 75, 88];
  const trendBars   = baseHeights.map(h =>
    Math.min(98, Math.max(10, Math.round(h * scale + rnd(-6, 6))))
  );
  const totalVisitors = Math.round(rnd(7800, 9200) * scale);
  const trendSign     = scale >= 1.0 ? "+" : "-";
  const trendPct      = (Math.abs((scale - 1) * 100) + Math.random() * 5).toFixed(1);
  const weekendAvg    = Math.round(486 * scale);

  // Demographics — change by type filter
  const demSplit = type === "Individual" ? [72, 28] : type === "Group" ? [44, 56] : [62, 38];
  const segments =
    type === "Group" ? [["School groups",36,"Guided"],["Corporate",28,"Team visit"],["Community",21,"Weekend"],["Family groups",15,"Leisure"]]
    : [["Families",36,"Largest group"],["Tourists",28,"Photo trail"],["Students",21,"Learning visit"],["Groups",15,"Guided route"]];
  const categoryRail =
    purpose === "Recreation" ? [["Local residents",86],["Families",76],["Domestic tourists",58],["School groups",34],["International",21]]
    : purpose === "Education" ? [["School groups",74],["Local residents",56],["Families",44],["International",28],["Domestic tourists",18]]
    : [["Local residents",86],["Domestic tourists",68],["School groups",54],["Families",76],["International tourists",31]];

  // Peak signals — shift by period
  const peakHour  = period === "Last month" ? "10:00 AM - 11:00 AM" : period === "This quarter" ? "12:00 PM - 1:00 PM" : "11:00 AM - 12:00 PM";
  const peakDay   = period === "Last month" ? "Sunday has the highest recurring volume." : "Saturday has the highest recurring volume.";
  const returning = Math.round(rnd(25, 40) * (scale > 0.8 ? 1 : 0.8));
  const avgDaily  = Math.round(291 * scale);

  // Journey
  const score     = Math.round(rnd(76, 94) * Math.min(scale + 0.2, 1.1));
  const dwellH    = rnd(1, 2);
  const dwellM    = rnd(10, 58);
  const anomalies = rnd(0, 3);
  const routes    = [
    ["Main Gate","Lake Trail","Orchid Garden","Cafe Court",  Math.round(rnd(62,88)*Math.min(scale+0.1,1))],
    ["Main Gate","Herbarium","Orchid Garden","Exit Gate",   Math.round(rnd(48,74)*Math.min(scale+0.1,1))],
    ["Main Gate","Palm Garden","Lake Trail","Exit Gate",    Math.round(rnd(44,70)*Math.min(scale+0.1,1))]
  ];

  // Drop-off bars
  const dropOff = [
    { label: "Cafe Court",      value: Math.round(rnd(22,40)*scale) },
    { label: "Lake Trail end",  value: Math.round(rnd(15,32)*scale) },
    { label: "Herbarium exit",  value: Math.round(rnd(10,26)*scale) }
  ];

  // Dwell distribution — shape changes with type/purpose filter
  const dwellDist = [
    { label: "< 30m",   value: Math.round(rnd(12,25)*scale) },
    { label: "30m-1h",  value: Math.round(rnd(32,55)*scale) },
    { label: "1h-2h",   value: Math.round(rnd(70,92)*scale) },
    { label: "2h-3h",   value: Math.round(rnd(48,70)*scale) },
    { label: "3h+",     value: Math.round(rnd(18,35)*scale) },
    { label: "Anomaly", value: rnd(3, 14) }
  ].map(d => ({ ...d, value: Math.min(98, Math.max(5, d.value)) }));

  // Zone crowd flow numbers
  const flowData = [
    ["Main Gate",     "Lake Trail",     Math.round(146*scale), rnd(5,8)],
    ["Lake Trail",    "Orchid Garden",  Math.round(92*scale),  rnd(7,11)],
    ["Orchid Garden", "Herbarium",      Math.round(64*scale),  rnd(4,7)],
    ["Herbarium",     "Cafe Court",     Math.round(58*scale),  rnd(6,9)]
  ];

  // Heatmap zone fills
  const heatZones = liveZones.map(z => ({ name: z.name, fill: z.fill }));
  heatZones.push({ name: "Cafe Court", fill: Math.round(rnd(35,60)*scale) });

  // Activity feed — vary timestamps slightly
  const baseMinute = 46 + rnd(0,3);
  const activityFeed = [
    [`11:${baseMinute}`, "Group G-204 moved from Orchid Garden to Herbarium", "Movement"],
    [`11:${baseMinute-2}`, "SMK Johor Group checked in through Main Gate", "Check-in"],
    [`11:${baseMinute-7}`, "Crowd density increased at Main Gate", "Density"],
    ["11:36", "Daniel Tan entered Lake Trail checkpoint", "Movement"],
    ["11:31", "Priya Nair checked out at Exit Gate", "Exit"]
  ];

  return {
    // Live dashboard
    liveStats: { visitors, capacity, alerts },
    zones: liveZones,
    activityFeed,

    // Analytics
    analytics: {
      trendBars,
      totalVisitors,
      trendSign,
      trendPct,
      weekendAvg,
      demSplit,
      segments,
      categoryRail,
      peakHour,
      peakDay,
      returning,
      avgDaily
    },

    // Journey
    journey: {
      score,
      dwell: `${dwellH}h ${String(dwellM).padStart(2,"0")}m`,
      returning,
      anomalies,
      routes,
      dropOff,
      dwellDist
    },

    // Zone
    heatZones,
    flowData,

    // Records (static)
    visitorRows
  };
}
