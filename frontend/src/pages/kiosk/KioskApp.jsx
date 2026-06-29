import React, { useState } from "react";
import { KioskLayout } from "./KioskLayout";
import { KioskQRCheckInPage } from "./KioskQRCheckInPage";
import { KioskFaceIdCheckInPage } from "./KioskFaceIdCheckInPage";
import { KioskCheckoutControlPage } from "./KioskCheckoutControlPage";
import { KioskOfflineEntryPage } from "./KioskOfflineEntryPage";
import { KioskMonitorPage } from "./KioskMonitorPage";
import { KioskLogsPage } from "./KioskLogsPage";
import { KioskFaceGalleryPage } from "./KioskFaceGalleryPage";

export function KioskApp({ appState, setAppState, onBack, initialPage = "qr" }) {
  const [page, setPage] = useState(initialPage);
  const titles = {
    qr: "QR Check-In",
    face: "Face ID Check-In",
    checkout: "Checkout Control",
    offline: "Offline Fast Entry",
    monitor: "Kiosk Monitor",
    logs: "Logs",
    faceGallery: "Face Capture Gallery"
  };
  const props = { appState, setAppState };
  const views = {
    qr: <KioskQRCheckInPage {...props} />,
    face: <KioskFaceIdCheckInPage {...props} />,
    checkout: <KioskCheckoutControlPage {...props} />,
    offline: <KioskOfflineEntryPage {...props} />,
    monitor: <KioskMonitorPage {...props} />,
    logs: <KioskLogsPage {...props} />,
    faceGallery: <KioskFaceGalleryPage {...props} />
  };

  return (
    <KioskLayout page={page} setPage={setPage} title={titles[page]} onBack={onBack}>
      {views[page]}
    </KioskLayout>
  );
}
