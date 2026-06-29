# Taman Botani — Monitoring Backend Setup

## Tech stack
Node.js + Express → MySQL (matches ADP1 architecture doc)

---

## 1. Database setup

Open MySQL and run the schema:

```bash
mysql -u root -p < db/schema.sql
```

---

## 2. Environment file

Copy the example and fill in your MySQL credentials:

```bash
cp .env.example .env
```

```
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=taman_botani
PORT=3001
```

---

## 3. Install & seed

```bash
npm install
npm run seed
```

Seed output will confirm:
- 6 zones
- 38 visitors (individual + group)
- ~400+ historical visits (July 2025 – June 2026)
- 18 active visits (currently "inside")
- 5 alerts
- 8 pre-generated reports

---

## 4. Start the server

```bash
npm run dev      # development (nodemon auto-restart)
npm start        # production
```

API running at: `http://localhost:3001`
Health check:   `http://localhost:3001/api/health`

---

## 5. Frontend integration

### Copy these files to your React project:

| File in this folder       | Copy to in your project                                                        |
|---------------------------|--------------------------------------------------------------------------------|
| `monitoringApi.js`        | `src/api/monitoringApi.js`                                                     |
| `MonitoringContext.jsx`   | `src/context/MonitoringContext.jsx` (replace existing)                         |
| `VisitorRecordsPage.jsx`  | `src/subsystems/monitoring/visitor-records/VisitorRecordsPage.jsx` (replace)   |
| `HistoryTable.jsx`        | `src/subsystems/monitoring/reports/HistoryTable.jsx` (replace)                 |
| `ReportBuilder.jsx`       | `src/subsystems/monitoring/reports/ReportBuilder.jsx` (replace)                |

### Add to your `.env` (Vite project root):

```
VITE_API_URL=http://localhost:3001/api
```

---

## API reference

### Monitoring
| Method | Route                        | Description                          |
|--------|------------------------------|--------------------------------------|
| GET    | `/api/monitoring/live`       | Live stats, zone loads, activity feed |
| GET    | `/api/monitoring/alerts`     | All alerts                           |
| PATCH  | `/api/monitoring/alerts/:id` | Resolve an alert                     |

### Analytics
| Method | Route            | Query params                          | Description             |
|--------|------------------|---------------------------------------|-------------------------|
| GET    | `/api/analytics` | `period`, `type`, `purpose`           | Trend, demographics, peak hours |

### Visitors
| Method | Route               | Query params                    | Description              |
|--------|---------------------|---------------------------------|--------------------------|
| GET    | `/api/visitors`     | `type`, `date`, `purpose`, `search` | Visitor records list |
| GET    | `/api/visitors/:id` | —                               | Single visitor detail    |

### Reports
| Method | Route                    | Description             |
|--------|--------------------------|-------------------------|
| GET    | `/api/reports`           | Report history          |
| POST   | `/api/reports/generate`  | Create new report entry |
| DELETE | `/api/reports/:id`       | Delete a report         |

---

## What stays as prototype (no backend)

| Page                    | Reason                                                          |
|-------------------------|-----------------------------------------------------------------|
| Zone & Crowd Monitoring | Needs IoT sensors / camera footfall counters per zone           |
| Journey & Experience    | Needs BLE beacons or GPS movement tracking per visitor          |

These pages continue to use the existing `getSystemSnapshot()` random data.
The updated `MonitoringContext.jsx` preserves their prototype data untouched.
