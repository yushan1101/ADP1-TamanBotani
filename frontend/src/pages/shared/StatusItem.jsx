import React from "react";
export function StatusItem({ label, value, tone = "" }) { return <div className={`statusItem ${tone}`}><span>{label}</span><strong>{value}</strong></div>; }
export function Badge({ children, tone = "" }) { return <span className={`badge ${tone}`}>{children}</span>; }
