import React, { useState } from "react";
import { StaffDashboardLayout } from "./StaffDashboardLayout";
import { StaffOverviewPage } from "./StaffOverviewPage";
import { StaffLiveMonitoringPage } from "./StaffLiveMonitoringPage";
import { StaffAnalyticsPage } from "./StaffAnalyticsPage";
import { StaffZoneCrowdPage } from "./StaffZoneCrowdPage";
import { StaffVisitorRecordsPage } from "./StaffVisitorRecordsPage";
import { StaffJourneyExperiencePage } from "./StaffJourneyExperiencePage";
import { StaffReportsPage } from "./StaffReportsPage";
import { StaffForecastingPage } from "./StaffForecastingPage";
import { StaffCrowdAlertsPage } from "./StaffCrowdAlertsPage";
import { StaffPeakSeasonPage } from "./StaffPeakSeasonPage";
import { StaffChatbotManagementPage } from "./StaffChatbotManagementPage";
import { StaffFeedbackManagementPage } from "./StaffFeedbackManagementPage";
export function StaffApp({ appState, setAppState, onBack }) { const [page,setPage]=useState("overview"); const titles={overview:"Dashboard Overview",live:"Live Monitoring",analytics:"Visitor Analytics",zones:"Zone & Crowd Monitoring",records:"Visitor Records",journey:"Journey & Experience",reports:"Reports",forecast:"Visitor Forecasting",alerts:"Peak Crowd Alerts",season:"Peak Season Prediction",chatbot:"Chatbot Management",feedback:"Feedback Management"}; const props={appState,setAppState,setPage}; const views={overview:<StaffOverviewPage {...props}/>,live:<StaffLiveMonitoringPage {...props}/>,analytics:<StaffAnalyticsPage {...props}/>,zones:<StaffZoneCrowdPage {...props}/>,records:<StaffVisitorRecordsPage {...props}/>,journey:<StaffJourneyExperiencePage {...props}/>,reports:<StaffReportsPage {...props}/>,forecast:<StaffForecastingPage {...props}/>,alerts:<StaffCrowdAlertsPage {...props}/>,season:<StaffPeakSeasonPage {...props}/>,chatbot:<StaffChatbotManagementPage {...props}/>,feedback:<StaffFeedbackManagementPage {...props}/>}; return <StaffDashboardLayout page={page} setPage={setPage} title={titles[page]} onBack={onBack}>{views[page]}</StaffDashboardLayout> }
