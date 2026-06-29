import React from "react";
import { Image } from "lucide-react";
import { KioskRegistrationModule } from "../../subsystems/registration/KioskRegistrationModule";

export function KioskMonitorPage(props) {
  return (
    <section className="kioskMonitorGrid">
      <KioskRegistrationModule {...props} />
      <section className="panel">
        <h2>Kiosk Registration Feed</h2>
        <p>No-phone visitor registrations, Face ID enrolment records and first check-in entries.</p>
        <table className="dataTable">
          <thead>
            <tr>
              <th>Time</th>
              <th>Name</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {props.appState.kioskRecords.map((record) => (
              <tr key={record.id}>
                <td>{record.time}</td>
                <td>{record.name}</td>
                <td>{record.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <button className="miniButton faceFeedGalleryButton" onClick={() => props.setPage("faceGallery")}>
          <Image size={15} /> Face Gallery
        </button>
      </section>
    </section>
  );
}
