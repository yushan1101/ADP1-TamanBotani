# 404SleepNotFound — Visitor Management System (Taman Botani Johor)

**Course:** SCSE2243 – Application Development Project I, Semester II 2025/2026, Section 03  
**Supervisor:** Dr. Alif Ridzuan bin Khairuddin  
**Video Demo:** [YouTube Link Here]

---

<table style="border-collapse: collapse; width: 100%;">
  <tr>
    <th style="border: 1px solid #999; padding: 8px;">Name</th>
    <th style="border: 1px solid #999; padding: 8px;">Subsystem</th>
  </tr>
  <tr>
    <td style="border: 1px solid #999; padding: 8px;">Wong Zi Qi</td>
    <td style="border: 1px solid #999; padding: 8px;">Subsystem 1 – Visitor Registration and Entry Management</td>
  </tr>
  <tr>
    <td style="border: 1px solid #999; padding: 8px;">Bong Zi Shan</td>
    <td style="border: 1px solid #999; padding: 8px;">Subsystem 2 – Visitor Monitoring and Analytics</td>
  </tr>
  <tr>
    <td style="border: 1px solid #999; padding: 8px;">Tang Yu Shan</td>
    <td style="border: 1px solid #999; padding: 8px;">Subsystem 3 – AI Prediction and Smart Management</td>
  </tr>
</table>

---

## Project Management

- **Trello:** https://trello.com/invite/b/69c6a7d708472a67d7740ac5/ATTI77cb867ede7a69e24c4acca0ed644d8a153BC0A5/progress-3
- **GitHub:** https://github.com/yushan1101/ADP1-TamanBotani
- **Previous GitHub with branch commit messages:** https://github.com/WONGZIQI0212/adp-ui-prototype.git

---

## Full System Prototype

This repository contains the merged full-system frontend prototype for the **Taman Botani Johor Visitor Management System**.

The system is organized into three role-based interfaces:

1. **Visitor App**  
   Phone-size mobile UI for visitors to register, view QR code, add Face ID, use chatbot, view map, check out, and submit feedback.

2. **Staff Dashboard**  
   Desktop dashboard UI for staff and management to monitor live operations, analyse visitor data, manage reports, view AI predictions, handle chatbot escalations, and review feedback.

3. **Guardhouse Kiosk / Entrance Station**  
   Entrance operation UI for QR check-in, Face ID check-in, checkout control, offline fast entry, kiosk monitoring, and operational logs.

---

## Module to Frontend Script Mapping

### Subsystem 1 – Visitor Registration and Entry Management

<table style="border-collapse: collapse; width: 100%;">
  <tr>
    <th style="border: 1px solid #999; padding: 8px;">Module</th>
    <th style="border: 1px solid #999; padding: 8px;">Frontend Script</th>
  </tr>

  <tr>
    <td style="border: 1px solid #999; padding: 8px;"><strong>Visitor Registration Module</strong></td>
    <td style="border: 1px solid #999; padding: 8px;">
      <ul>
        <li><a href="src/subsystems/registration/VisitorRegistrationModule.jsx">VisitorRegistrationModule.jsx</a></li>
        <li><a href="src/subsystems/registration/KioskRegistrationModule.jsx">KioskRegistrationModule.jsx</a></li>
        <li><a href="src/pages/visitor/VisitorRegistrationPage.jsx">VisitorRegistrationPage.jsx</a></li>
        <li><a href="src/pages/kiosk/KioskMonitorPage.jsx">KioskMonitorPage.jsx</a></li>
      </ul>
    </td>
  </tr>

  <tr>
    <td style="border: 1px solid #999; padding: 8px;"><strong>Visitor Check-In Module</strong></td>
    <td style="border: 1px solid #999; padding: 8px;">
      <ul>
        <li><a href="src/subsystems/registration/VisitorCheckInModule.jsx">VisitorCheckInModule.jsx</a></li>
        <li><a href="src/pages/visitor/VisitorQRCodePage.jsx">VisitorQRCodePage.jsx</a></li>
        <li><a href="src/pages/kiosk/KioskQRCheckInPage.jsx">KioskQRCheckInPage.jsx</a></li>
        <li><a href="src/pages/kiosk/KioskFaceIdCheckInPage.jsx">KioskFaceIdCheckInPage.jsx</a></li>
      </ul>
    </td>
  </tr>

  <tr>
    <td style="border: 1px solid #999; padding: 8px;"><strong>Visitor Check-Out Module</strong></td>
    <td style="border: 1px solid #999; padding: 8px;">
      <ul>
        <li><a href="src/subsystems/registration/VisitorCheckOutModule.jsx">VisitorCheckOutModule.jsx</a></li>
        <li><a href="src/pages/visitor/VisitorCheckoutPage.jsx">VisitorCheckoutPage.jsx</a></li>
        <li><a href="src/pages/kiosk/KioskCheckoutControlPage.jsx">KioskCheckoutControlPage.jsx</a></li>
      </ul>
    </td>
  </tr>

  <tr>
    <td style="border: 1px solid #999; padding: 8px;"><strong>Offline & Fast Entry Module</strong></td>
    <td style="border: 1px solid #999; padding: 8px;">
      <ul>
        <li><a href="src/subsystems/registration/OfflineFastEntryModule.jsx">OfflineFastEntryModule.jsx</a></li>
        <li><a href="src/pages/kiosk/KioskOfflineEntryPage.jsx">KioskOfflineEntryPage.jsx</a></li>
        <li><a href="src/pages/kiosk/KioskLogsPage.jsx">KioskLogsPage.jsx</a></li>
      </ul>
    </td>
  </tr>
</table>

---

### Subsystem 2 – Visitor Monitoring and Analytics

<table style="border-collapse: collapse; width: 100%;">
  <tr>
    <th style="border: 1px solid #999; padding: 8px;">Module</th>
    <th style="border: 1px solid #999; padding: 8px;">Frontend Script</th>
  </tr>

  <tr>
    <td style="border: 1px solid #999; padding: 8px;"><strong>Real-Time Monitoring Dashboard Module</strong></td>
    <td style="border: 1px solid #999; padding: 8px;">
      <ul>
        <li><a href="src/subsystems/monitoring/MonitoringModule.jsx">MonitoringModule.jsx</a></li>
        <li><a href="src/subsystems/monitoring/live-dashboard/LiveDashboard.jsx">LiveDashboard.jsx</a></li>
        <li><a href="src/subsystems/monitoring/live-dashboard/LiveStats.jsx">LiveStats.jsx</a></li>
        <li><a href="src/subsystems/monitoring/live-dashboard/ActivityFeed.jsx">ActivityFeed.jsx</a></li>
        <li><a href="src/subsystems/monitoring/live-dashboard/AlertPanel.jsx">AlertPanel.jsx</a></li>
        <li><a href="src/pages/staff/StaffOverviewPage.jsx">StaffOverviewPage.jsx</a></li>
        <li><a href="src/pages/staff/StaffLiveMonitoringPage.jsx">StaffLiveMonitoringPage.jsx</a></li>
      </ul>
    </td>
  </tr>

  <tr>
    <td style="border: 1px solid #999; padding: 8px;"><strong>Visitor Analytics & Demographic Module</strong></td>
    <td style="border: 1px solid #999; padding: 8px;">
      <ul>
        <li><a href="src/subsystems/monitoring/analytics/AnalyticsPage.jsx">AnalyticsPage.jsx</a></li>
        <li><a href="src/subsystems/monitoring/analytics/VisitorTrendChart.jsx">VisitorTrendChart.jsx</a></li>
        <li><a href="src/subsystems/monitoring/analytics/Demographics.jsx">Demographics.jsx</a></li>
        <li><a href="src/subsystems/monitoring/analytics/PeakHours.jsx">PeakHours.jsx</a></li>
        <li><a href="src/pages/staff/StaffAnalyticsPage.jsx">StaffAnalyticsPage.jsx</a></li>
      </ul>
    </td>
  </tr>

  <tr>
    <td style="border: 1px solid #999; padding: 8px;"><strong>Zone & Crowd Monitoring Module</strong></td>
    <td style="border: 1px solid #999; padding: 8px;">
      <ul>
        <li><a href="src/subsystems/monitoring/ZoneCrowdMonitoringModule.jsx">ZoneCrowdMonitoringModule.jsx</a></li>
        <li><a href="src/subsystems/monitoring/zone-crowd/ZonePage.jsx">ZonePage.jsx</a></li>
        <li><a href="src/subsystems/monitoring/zone-crowd/ZoneList.jsx">ZoneList.jsx</a></li>
        <li><a href="src/subsystems/monitoring/zone-crowd/Heatmap.jsx">Heatmap.jsx</a></li>
        <li><a href="src/subsystems/monitoring/zone-crowd/CrowdFlow.jsx">CrowdFlow.jsx</a></li>
        <li><a href="src/pages/staff/StaffZoneCrowdPage.jsx">StaffZoneCrowdPage.jsx</a></li>
        <li><a href="src/pages/visitor/VisitorMapPage.jsx">VisitorMapPage.jsx</a></li>
      </ul>
    </td>
  </tr>

  <tr>
    <td style="border: 1px solid #999; padding: 8px;"><strong>Visitor Search & Tracking Module</strong></td>
    <td style="border: 1px solid #999; padding: 8px;">
      <ul>
        <li><a href="src/subsystems/monitoring/VisitorSearchTrackingModule.jsx">VisitorSearchTrackingModule.jsx</a></li>
        <li><a href="src/subsystems/monitoring/visitor-records/VisitorRecordsPage.jsx">VisitorRecordsPage.jsx</a></li>
        <li><a href="src/subsystems/monitoring/visitor-records/VisitorTable.jsx">VisitorTable.jsx</a></li>
        <li><a href="src/subsystems/monitoring/visitor-records/SearchBar.jsx">SearchBar.jsx</a></li>
        <li><a href="src/subsystems/monitoring/visitor-records/VisitorDetail.jsx">VisitorDetail.jsx</a></li>
        <li><a href="src/pages/staff/StaffVisitorRecordsPage.jsx">StaffVisitorRecordsPage.jsx</a></li>
        <li><a href="src/pages/visitor/VisitorVisitHistoryPage.jsx">VisitorVisitHistoryPage.jsx</a></li>
      </ul>
    </td>
  </tr>

  <tr>
    <td style="border: 1px solid #999; padding: 8px;"><strong>Visitor Journey & Experience Module</strong></td>
    <td style="border: 1px solid #999; padding: 8px;">
      <ul>
        <li><a href="src/subsystems/monitoring/journey/JourneyPage.jsx">JourneyPage.jsx</a></li>
        <li><a href="src/subsystems/monitoring/journey/RouteDiagram.jsx">RouteDiagram.jsx</a></li>
        <li><a href="src/subsystems/monitoring/journey/DropOffAnalysis.jsx">DropOffAnalysis.jsx</a></li>
        <li><a href="src/subsystems/monitoring/journey/DwellTimeChart.jsx">DwellTimeChart.jsx</a></li>
        <li><a href="src/pages/staff/StaffJourneyExperiencePage.jsx">StaffJourneyExperiencePage.jsx</a></li>
      </ul>
    </td>
  </tr>

  <tr>
    <td style="border: 1px solid #999; padding: 8px;"><strong>Generation & Export Module</strong></td>
    <td style="border: 1px solid #999; padding: 8px;">
      <ul>
        <li><a href="src/subsystems/monitoring/reports/ReportsPage.jsx">ReportsPage.jsx</a></li>
        <li><a href="src/subsystems/monitoring/reports/ReportBuilder.jsx">ReportBuilder.jsx</a></li>
        <li><a href="src/subsystems/monitoring/reports/SchedulePanel.jsx">SchedulePanel.jsx</a></li>
        <li><a href="src/subsystems/monitoring/reports/HistoryTable.jsx">HistoryTable.jsx</a></li>
        <li><a href="src/subsystems/monitoring/utils/download.js">download.js</a></li>
        <li><a href="src/pages/staff/StaffReportsPage.jsx">StaffReportsPage.jsx</a></li>
      </ul>
    </td>
  </tr>

</table>

---

### Subsystem 3 – AI Prediction and Smart Management

<table style="border-collapse: collapse; width: 100%;">
  <tr>
    <th style="border: 1px solid #999; padding: 8px;">Module</th>
    <th style="border: 1px solid #999; padding: 8px;">Frontend Script</th>
  </tr>

  <tr>
    <td style="border: 1px solid #999; padding: 8px;"><strong>Visitor Forecasting Module</strong></td>
    <td style="border: 1px solid #999; padding: 8px;">
      <ul>
        <li><a href="src/subsystems/ai-feedback/VisitorForecastingModule.jsx">VisitorForecastingModule.jsx</a></li>
        <li><a href="src/pages/staff/StaffForecastingPage.jsx">StaffForecastingPage.jsx</a></li>
      </ul>
    </td>
  </tr>

  <tr>
    <td style="border: 1px solid #999; padding: 8px;"><strong>Peak Crowd Alert Module</strong></td>
    <td style="border: 1px solid #999; padding: 8px;">
      <ul>
        <li><a href="src/subsystems/ai-feedback/PeakCrowdAlertModule.jsx">PeakCrowdAlertModule.jsx</a></li>
        <li><a href="src/pages/staff/StaffCrowdAlertsPage.jsx">StaffCrowdAlertsPage.jsx</a></li>
      </ul>
    </td>
  </tr>

  <tr>
    <td style="border: 1px solid #999; padding: 8px;"><strong>Peak Season Prediction Module</strong></td>
    <td style="border: 1px solid #999; padding: 8px;">
      <ul>
        <li><a href="src/subsystems/ai-feedback/PeakSeasonPredictionModule.jsx">PeakSeasonPredictionModule.jsx</a></li>
        <li><a href="src/pages/staff/StaffPeakSeasonPage.jsx">StaffPeakSeasonPage.jsx</a></li>
      </ul>
    </td>
  </tr>

  <tr>
    <td style="border: 1px solid #999; padding: 8px;"><strong>AI Chatbot Assistance Module</strong></td>
    <td style="border: 1px solid #999; padding: 8px;">
      <ul>
        <li><a href="src/subsystems/ai-feedback/AIChatbotManagementModule.jsx">AIChatbotManagementModule.jsx</a></li>
        <li><a href="src/subsystems/ai-feedback/VisitorChatbotModule.jsx">VisitorChatbotModule.jsx</a></li>
        <li><a href="src/pages/staff/StaffChatbotManagementPage.jsx">StaffChatbotManagementPage.jsx</a></li>
        <li><a href="src/pages/visitor/VisitorChatbotPage.jsx">VisitorChatbotPage.jsx</a></li>
      </ul>
    </td>
  </tr>

  <tr>
    <td style="border: 1px solid #999; padding: 8px;"><strong>Feedback & Communication Module</strong></td>
    <td style="border: 1px solid #999; padding: 8px;">
      <ul>
        <li><a href="src/subsystems/ai-feedback/FeedbackManagementModule.jsx">FeedbackManagementModule.jsx</a></li>
        <li><a href="src/subsystems/ai-feedback/VisitorFeedbackModule.jsx">VisitorFeedbackModule.jsx</a></li>
        <li><a href="src/pages/staff/StaffFeedbackManagementPage.jsx">StaffFeedbackManagementPage.jsx</a></li>
        <li><a href="src/pages/visitor/VisitorFeedbackPage.jsx">VisitorFeedbackPage.jsx</a></li>
      </ul>
    </td>
  </tr>
</table>

---

## Run the Project

Install dependencies:

```bash
pnpm install
