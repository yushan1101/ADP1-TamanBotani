export const initialAppState = {
  visitors: [
    { id: "V-1028", name: "Returning Visitor", phone: "012-3456789", age: 22, gender: "Female", nationality: "Malaysian", race: "Malay", purpose: "Recreation", activity: "Walking Trail", faceId: true, status: "active", createdAt: "2026-06-02 09:15" },
    { id: "V-2045", name: "Nur Aina", phone: "013-4449911", age: 31, gender: "Female", nationality: "Malaysian", race: "Malay", purpose: "Jogging", activity: "Walking Trail", faceId: true, status: "active", createdAt: "2026-06-03 08:05" }
  ],
  groups: [
    { id: "G-2204", leaderName: "SMK Johor Group", organisation: "SMK Johor", visitDate: "2026-06-20", participantCount: 18, purpose: "Education or Research", status: "active" }
  ],
  passes: [
    { id: "QR-V-1028", ownerId: "V-1028", ownerName: "Returning Visitor", type: "Personal", hash: "A7F3C91B", status: "active", savedToPhone: true, participantCount: 1 },
    { id: "QR-G-2204", ownerId: "G-2204", ownerName: "SMK Johor Group", type: "Group", hash: "88B1CC40", status: "active", savedToPhone: false, participantCount: 18 }
  ],
  visits: [
    { id: "VISIT-3101", passId: "QR-V-1028", visitorId: "V-1028", name: "Returning Visitor", type: "Individual", channel: "QR", status: "inside", count: 1, checkInTime: "2026-06-04 08:35", checkOutTime: "", checkOutMethod: "", notificationTime: "", stillInside: false, zone: "Lake Trail" },
    { id: "VISIT-3102", passId: "QR-G-2204", visitorId: "G-2204", name: "SMK Johor Group", type: "Group", channel: "Group QR", status: "inside", count: 18, checkInTime: "2026-06-04 09:10", checkOutTime: "", checkOutMethod: "", notificationTime: "6:45 PM", stillInside: true, zone: "Orchid Garden" },
    { id: "VISIT-3103", passId: "FACE-ID", visitorId: "V-2045", name: "Nur Aina", type: "Individual", channel: "FaceID", status: "inside", count: 1, checkInTime: "2026-06-04 10:05", checkOutTime: "", checkOutMethod: "", notificationTime: "", stillInside: false, zone: "Main Gate" }
  ],
  offlineQueue: [],
  kioskRecords: [{ id: "KIOSK-4101", name: "Nur Aina", status: "Face ID enrolled and first check-in recorded", time: "2026-06-04 10:05" }],
  alerts: [{ id: "AL-01", message: "Orchid Garden exceeded moderate crowd threshold", time: "11:25 AM", severity: "Warning", status: "Active" }],
  feedback: [
    { id: "FB-001", visitor: "Returning Visitor", rating: 4, category: "Facilities", text: "Clean park but cafe area was crowded.", sentiment: "Positive", status: "New" },
    { id: "FB-002", visitor: "Anonymous", rating: 2, category: "Crowding", text: "Too crowded near Orchid Garden.", sentiment: "Negative", status: "New" }
  ],
  chatbotCases: [
    { id: "CASE-101", visitor: "Hui Ann", category: "Lost Item", message: "Lost white bottle near Lake Trail", status: "Pending", priority: "Medium" },
    { id: "CASE-102", visitor: "Unknown Visitor", category: "Emergency", message: "Minor injury near Main Gate", status: "Assigned", priority: "High" }
  ],
  logs: ["System initialized", "QR scanner online", "Face ID service matching"]
};

export const zones = [
  { name: "Main Gate", count: 39, capacity: 80, status: "Moderate" },
  { name: "Lake Trail", count: 62, capacity: 150, status: "Normal" },
  { name: "Orchid Garden", count: 84, capacity: 100, status: "Busy" },
  { name: "Herbarium", count: 28, capacity: 70, status: "Normal" },
  { name: "Cafe Court", count: 58, capacity: 80, status: "Busy" },
  { name: "Rest Area", count: 24, capacity: 60, status: "Normal" }
];

export const monthlyVisitors = [520, 610, 700, 810, 920, 874, 980, 1020, 940, 880, 790, 860];

export function nowStamp() {
  return new Date().toLocaleString([], { year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" });
}
export function nextId(prefix) { return `${prefix}-${Math.floor(1000 + Math.random() * 9000)}`; }
export function nextHash() { return Math.random().toString(16).slice(2, 10).toUpperCase(); }
export function liveHeadCount(visits) { return visits.filter(v => v.status === "inside").reduce((sum, v) => sum + Number(v.count || 1), 0); }
