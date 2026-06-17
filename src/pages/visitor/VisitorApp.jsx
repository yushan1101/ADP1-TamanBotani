import React, { useState } from "react";
import { VisitorAppLayout } from "./VisitorAppLayout";
import { VisitorHomePage } from "./VisitorHomePage";
import { VisitorRegistrationPage } from "./VisitorRegistrationPage";
import { VisitorQRCodePage } from "./VisitorQRCodePage";
import { VisitorFaceIdPage } from "./VisitorFaceIdPage";
import { VisitorCheckoutPage } from "./VisitorCheckoutPage";
import { VisitorMapPage } from "./VisitorMapPage";
import { VisitorChatbotPage } from "./VisitorChatbotPage";
import { VisitorFeedbackPage } from "./VisitorFeedbackPage";
import { VisitorVisitHistoryPage } from "./VisitorVisitHistoryPage";
export function VisitorApp({ appState, setAppState, onBack }) { const [page,setPage]=useState("home"); const titles={home:"Home",register:"Register Visit",qr:"My QR Code",faceid:"Add Face ID",checkout:"Check-Out",map:"Park Map",chat:"Assistant",feedback:"Feedback",history:"Visit History"}; const props={appState,setAppState}; const views={home:<VisitorHomePage {...props} setPage={setPage}/>,register:<VisitorRegistrationPage {...props}/>,qr:<VisitorQRCodePage {...props}/>,faceid:<VisitorFaceIdPage {...props}/>,checkout:<VisitorCheckoutPage {...props}/>,map:<VisitorMapPage {...props}/>,chat:<VisitorChatbotPage {...props}/>,feedback:<VisitorFeedbackPage {...props}/>,history:<VisitorVisitHistoryPage {...props}/>}; return <VisitorAppLayout page={page} setPage={setPage} title={titles[page]} onBack={onBack}>{views[page]}</VisitorAppLayout>; }
