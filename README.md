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

- **Trello:** [Trello Board Link Here]
- **GitHub:** https://github.com/yushan1101/ADP1-TamanBotani

---

## Project Management

- **Trello:** [Trello Board Link Here]
- **GitHub:** https://github.com/yushan1101/ADP1-TamanBotani

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
        <li><a href="src/subsystems/registration/VisitorRegistrationModule.jsx">src/subsystems/registration/VisitorRegistrationModule.jsx</a></li>
        <li><a href="src/pages/visitor/VisitorRegistrationPage.jsx">src/pages/visitor/VisitorRegistrationPage.jsx</a></li>
        <li><a href="src/pages/kiosk/KioskMonitorPage.jsx">src/pages/kiosk/KioskMonitorPage.jsx</a></li>
      </ul>
    </td>
  </tr>

  <tr>
    <td style="border: 1px solid #999; padding: 8px;"><strong>Visitor Check-In Module</strong></td>
    <td style="border: 1px solid #999; padding: 8px;">
      <ul>
        <li><a href="src/subsystems/registration/VisitorCheckInModule.jsx">src/subsystems/registration/VisitorCheckInModule.jsx</a></li>
        <li><a href="src/pages/visitor/VisitorQRCodePage.jsx">src/pages/visitor/VisitorQRCodePage.jsx</a></li>
        <li><a href="src/pages/kiosk/KioskQRCheckInPage.jsx">src/pages/kiosk/KioskQRCheckInPage.jsx</a></li>
        <li><a href="src/pages/kiosk/KioskFaceIdCheckInPage.jsx">src/pages/kiosk/KioskFaceIdCheckInPage.jsx</a></li>
      </ul>
    </td>
  </tr>

  <tr>
    <td style="border: 1px solid #999; padding: 8px;"><strong>Visitor Check-Out Module</strong></td>
    <td style="border: 1px solid #999; padding: 8px;">
      <ul>
        <li><a href="src/subsystems/registration/VisitorCheckOutModule.jsx">src/subsystems/registration/VisitorCheckOutModule.jsx</a></li>
        <li><a href="src/pages/visitor/VisitorCheckoutPage.jsx">src/pages/visitor/VisitorCheckoutPage.jsx</a></li>
        <li><a href="src/pages/kiosk/KioskCheckoutControlPage.jsx">src/pages/kiosk/KioskCheckoutControlPage.jsx</a></li>
      </ul>
    </td>
  </tr>

  <tr>
    <td style="border: 1px solid #999; padding: 8px;"><strong>Offline & Fast Entry Module</strong></td>
    <td style="border: 1px solid #999; padding: 8px;">
      <ul>
        <li><a href="src/subsystems/registration/OfflineFastEntryModule.jsx">src/subsystems/registration/OfflineFastEntryModule.jsx</a></li>
        <li><a href="src/pages/kiosk/KioskOfflineEntryPage.jsx">src/pages/kiosk/KioskOfflineEntryPage.jsx</a></li>
        <li><a href="src/pages/kiosk/KioskLogsPage.jsx">src/pages/kiosk/KioskLogsPage.jsx</a></li>
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
        <li><a href="src/subsystems/monitoring/MonitoringModule.jsx">src/subsystems/monitoring/MonitoringModule.jsx</a></li>
        <li><a href="src/pages/staff/StaffOverviewPage.jsx">src/pages/staff/StaffOverviewPage.jsx</a></li>
        <li><a href="src/pages/staff/StaffLiveMonitoringPage.jsx">src/pages/staff/StaffLiveMonitoringPage.jsx</a></li>
      </ul>
    </td>
  </tr>

  <tr>
    <td style="border: 1px solid #999; padding: 8px;"><strong>Visitor Analytics & Demographic Module</strong></td>
    <td style="border: 1px solid #999; padding: 8px;">
      <ul>
        <li><a href="src/subsystems/monitoring/MonitoringModule.jsx">src/subsystems/monitoring/MonitoringModule.jsx</a></li>
        <li><a href="src/pages/staff/StaffAnalyticsPage.jsx">src/pages/staff/StaffAnalyticsPage.jsx</a></li>
      </ul>
    </td>
  </tr>

  <tr>
    <td style="border: 1px solid #999; padding: 8px;"><strong>Zone & Crowd Monitoring Module</strong></td>
    <td style="border: 1px solid #999; padding: 8px;">
      <ul>
        <li><a href="src/subsystems/monitoring/MonitoringModule.jsx">src/subsystems/monitoring/MonitoringModule.jsx</a></li>
        <li><a href="src/pages/staff/StaffZoneCrowdPage.jsx">src/pages/staff/StaffZoneCrowdPage.jsx</a></li>
        <li><a href="src/pages/visitor/VisitorMapPage.jsx">src/pages/visitor/VisitorMapPage.jsx</a></li>
      </ul>
    </td>
  </tr>

  <tr>
    <td style="border: 1px solid #999; padding: 8px;"><strong>Visitor Search & Tracking Module</strong></td>
    <td style="border: 1px solid #999; padding: 8px;">
      <ul>
        <li><a href="src/subsystems/monitoring/MonitoringModule.jsx">src/subsystems/monitoring/MonitoringModule.jsx</a></li>
        <li><a href="src/pages/staff/StaffVisitorRecordsPage.jsx">src/pages/staff/StaffVisitorRecordsPage.jsx</a></li>
        <li><a href="src/pages/visitor/VisitorVisitHistoryPage.jsx">src/pages/visitor/VisitorVisitHistoryPage.jsx</a></li>
      </ul>
    </td>
  </tr>

  <tr>
    <td style="border: 1px solid #999; padding: 8px;"><strong>Visitor Journey & Experience Module</strong></td>
    <td style="border: 1px solid #999; padding: 8px;">
      <ul>
        <li><a href="src/subsystems/monitoring/MonitoringModule.jsx">src/subsystems/monitoring/MonitoringModule.jsx</a></li>
        <li><a href="src/pages/staff/StaffJourneyExperiencePage.jsx">src/pages/staff/StaffJourneyExperiencePage.jsx</a></li>
      </ul>
    </td>
  </tr>

  <tr>
    <td style="border: 1px solid #999; padding: 8px;"><strong>Generation & Export Module</strong></td>
    <td style="border: 1px solid #999; padding: 8px;">
      <ul>
        <li><a href="src/subsystems/monitoring/MonitoringModule.jsx">src/subsystems/monitoring/MonitoringModule.jsx</a></li>
        <li><a href="src/pages/staff/StaffReportsPage.jsx">src/pages/staff/StaffReportsPage.jsx</a></li>
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
        <li><a href="src/subsystems/ai-feedback/VisitorForecastingModule.jsx">src/subsystems/ai-feedback/VisitorForecastingModule.jsx</a></li>
        <li><a href="src/pages/staff/StaffForecastingPage.jsx">src/pages/staff/StaffForecastingPage.jsx</a></li>
      </ul>
    </td>
  </tr>

  <tr>
    <td style="border: 1px solid #999; padding: 8px;"><strong>Peak Crowd Alert Module</strong></td>
    <td style="border: 1px solid #999; padding: 8px;">
      <ul>
        <li><a href="src/subsystems/ai-feedback/PeakCrowdAlertModule.jsx">src/subsystems/ai-feedback/PeakCrowdAlertModule.jsx</a></li>
        <li><a href="src/pages/staff/StaffCrowdAlertsPage.jsx">src/pages/staff/StaffCrowdAlertsPage.jsx</a></li>
      </ul>
    </td>
  </tr>

  <tr>
    <td style="border: 1px solid #999; padding: 8px;"><strong>Peak Season Prediction Module</strong></td>
    <td style="border: 1px solid #999; padding: 8px;">
      <ul>
        <li><a href="src/subsystems/ai-feedback/PeakSeasonPredictionModule.jsx">src/subsystems/ai-feedback/PeakSeasonPredictionModule.jsx</a></li>
        <li><a href="src/pages/staff/StaffPeakSeasonPage.jsx">src/pages/staff/StaffPeakSeasonPage.jsx</a></li>
      </ul>
    </td>
  </tr>

  <tr>
    <td style="border: 1px solid #999; padding: 8px;"><strong>AI Chatbot Assistance Module</strong></td>
    <td style="border: 1px solid #999; padding: 8px;">
      <ul>
        <li><a href="src/subsystems/ai-feedback/AIChatbotManagementModule.jsx">src/subsystems/ai-feedback/AIChatbotManagementModule.jsx</a></li>
        <li><a href="src/subsystems/ai-feedback/VisitorChatbotModule.jsx">src/subsystems/ai-feedback/VisitorChatbotModule.jsx</a></li>
        <li><a href="src/pages/staff/StaffChatbotManagementPage.jsx">src/pages/staff/StaffChatbotManagementPage.jsx</a></li>
        <li><a href="src/pages/visitor/VisitorChatbotPage.jsx">src/pages/visitor/VisitorChatbotPage.jsx</a></li>
      </ul>
    </td>
  </tr>

  <tr>
    <td style="border: 1px solid #999; padding: 8px;"><strong>Feedback & Communication Module</strong></td>
    <td style="border: 1px solid #999; padding: 8px;">
      <ul>
        <li><a href="src/subsystems/ai-feedback/FeedbackManagementModule.jsx">src/subsystems/ai-feedback/FeedbackManagementModule.jsx</a></li>
        <li><a href="src/subsystems/ai-feedback/VisitorFeedbackModule.jsx">src/subsystems/ai-feedback/VisitorFeedbackModule.jsx</a></li>
        <li><a href="src/pages/staff/StaffFeedbackManagementPage.jsx">src/pages/staff/StaffFeedbackManagementPage.jsx</a></li>
        <li><a href="src/pages/visitor/VisitorFeedbackPage.jsx">src/pages/visitor/VisitorFeedbackPage.jsx</a></li>
      </ul>
    </td>
  </tr>
</table>

---

## Run the Project

Install dependencies:

```bash
pnpm install
