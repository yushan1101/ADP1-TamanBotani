# Taman Botani Johor Visitor Management System

A complete role-based React/Vite prototype for the Taman Botani Johor Visitor Management System.

## Run

```bash
pnpm install
pnpm dev
```

The project runs on:

```text
http://localhost:5188
```

## Role-Based Interfaces

The system starts with a Mode Selection page:

1. Visitor App - phone-size mobile UI
2. Staff Dashboard - desktop management dashboard
3. Guardhouse Kiosk / Entrance Station - large operational station UI

## Folder Structure

```text
src/
├── data/
│   └── appState.js
├── pages/
│   ├── shared/
│   ├── visitor/
│   ├── staff/
│   └── kiosk/
└── subsystems/
    ├── registration/
    ├── monitoring/
    └── ai-feedback/
```

## Frontend Mapping

| Module | FrontEnd Scripts |
|---|---|
| Visitor Registration Module | src/subsystems/registration/VisitorRegistrationModule.jsx, src/pages/visitor/VisitorRegistrationPage.jsx, src/pages/kiosk/KioskMonitorPage.jsx |
| Visitor Check-In Module | src/subsystems/registration/VisitorCheckInModule.jsx, src/pages/kiosk/KioskQRCheckInPage.jsx, src/pages/kiosk/KioskFaceIdCheckInPage.jsx, src/pages/visitor/VisitorQRCodePage.jsx |
| Visitor Check-Out Module | src/subsystems/registration/VisitorCheckOutModule.jsx, src/pages/visitor/VisitorCheckoutPage.jsx, src/pages/kiosk/KioskCheckoutControlPage.jsx |
| Offline & Fast Entry Module | src/subsystems/registration/OfflineFastEntryModule.jsx, src/pages/kiosk/KioskOfflineEntryPage.jsx, src/pages/kiosk/KioskLogsPage.jsx |
| Real-Time Monitoring Dashboard Module | src/subsystems/monitoring/RealTimeMonitoringModule.jsx, src/pages/staff/StaffLiveMonitoringPage.jsx, src/pages/staff/StaffOverviewPage.jsx |
| Visitor Analytics & Demographic Module | src/subsystems/monitoring/AnalyticsDemographicModule.jsx, src/pages/staff/StaffAnalyticsPage.jsx |
| Zone & Crowd Monitoring Module | src/subsystems/monitoring/ZoneCrowdMonitoringModule.jsx, src/pages/staff/StaffZoneCrowdPage.jsx, src/pages/visitor/VisitorMapPage.jsx |
| Visitor Search & Tracking Module | src/subsystems/monitoring/VisitorSearchTrackingModule.jsx, src/pages/staff/StaffVisitorRecordsPage.jsx, src/pages/visitor/VisitorVisitHistoryPage.jsx |
| Visitor Journey & Experience Module | src/subsystems/monitoring/JourneyExperienceModule.jsx, src/pages/staff/StaffJourneyExperiencePage.jsx |
| Generation & Export Module | src/subsystems/monitoring/ReportExportModule.jsx, src/pages/staff/StaffReportsPage.jsx |
| Visitor Forecasting Module | src/subsystems/ai-feedback/VisitorForecastingModule.jsx, src/pages/staff/StaffForecastingPage.jsx |
| Peak Crowd Alert Module | src/subsystems/ai-feedback/PeakCrowdAlertModule.jsx, src/pages/staff/StaffCrowdAlertsPage.jsx |
| Peak Season Prediction Module | src/subsystems/ai-feedback/PeakSeasonPredictionModule.jsx, src/pages/staff/StaffPeakSeasonPage.jsx |
| AI Chatbot Assistance Module | src/subsystems/ai-feedback/AIChatbotModule.jsx, src/pages/visitor/VisitorChatbotPage.jsx, src/pages/staff/StaffChatbotManagementPage.jsx |
| Feedback & Communication Module | src/subsystems/ai-feedback/FeedbackCommunicationModule.jsx, src/pages/visitor/VisitorFeedbackPage.jsx, src/pages/staff/StaffFeedbackManagementPage.jsx |

## Design Rule

Visitor App = phone-size mobile UI  
Staff Dashboard = desktop management UI  
Guardhouse Kiosk = large entrance operation UI
