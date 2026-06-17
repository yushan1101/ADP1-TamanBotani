import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { ModeSelectionPage } from "./pages/shared/ModeSelectionPage";
import { VisitorApp } from "./pages/visitor/VisitorApp";
import { StaffApp } from "./pages/staff/StaffApp";
import { KioskApp } from "./pages/kiosk/KioskApp";
import { initialAppState } from "./data/appState";
import "./styles.css";

const STORAGE_KEY = "tbj-role-full-system-v1";

function App() {
  const [mode, setMode] = useState("select");
  const [appState, setAppState] = useState(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || initialAppState; } catch { return initialAppState; }
  });
  useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify(appState)); }, [appState]);
  if (mode === "visitor") return <VisitorApp appState={appState} setAppState={setAppState} onBack={() => setMode("select")} />;
  if (mode === "staff") return <StaffApp appState={appState} setAppState={setAppState} onBack={() => setMode("select")} />;
  if (mode === "kiosk") return <KioskApp appState={appState} setAppState={setAppState} onBack={() => setMode("select")} />;
  return <ModeSelectionPage onSelectMode={setMode} />;
}

createRoot(document.getElementById("root")).render(<App />);
