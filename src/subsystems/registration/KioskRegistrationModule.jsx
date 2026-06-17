import React from "react";
import { ScanFace } from "lucide-react";
import { VisitorRegistrationModule } from "./VisitorRegistrationModule";
export function KioskRegistrationModule(props) { return <section className="kioskScreenPanel"><div className="kioskTitle"><ScanFace size={30}/><div><span>Guardhouse Kiosk</span><strong>No-Phone Visitor Registration</strong></div></div><VisitorRegistrationModule {...props}/></section>; }
