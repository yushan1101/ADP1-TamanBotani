import React, { useEffect, useState } from "react";
import { ExternalLink, Image, RefreshCw, X } from "lucide-react";
import { fetchFaceEnrollments } from "../../api/monitoringApi";

function formatDate(value) {
  if (!value) return "";
  return new Date(value).toLocaleString();
}

function formatBytes(value) {
  if (!value) return "0 B";
  if (value < 1024) return `${value} B`;
  return `${(value / 1024).toFixed(1)} KB`;
}

export function KioskFaceGalleryPage() {
  const [enrollments, setEnrollments] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadEnrollments = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await fetchFaceEnrollments(24);
      setEnrollments(data.enrollments || []);
    } catch {
      setError("Face capture records could not be loaded.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEnrollments();
  }, []);

  const openImage = (enrollment) => {
    const imageWindow = window.open("", "_blank");
    if (!imageWindow) return;
    imageWindow.document.write(`<img src="${enrollment.imageData}" style="max-width:100%;height:auto">`);
    imageWindow.document.close();
  };

  return (
    <section className="panel faceGalleryPanel">
      <div className="sectionHead">
        <div>
          <p className="eyebrow">Face ID Review</p>
          <h2>Face Capture Gallery</h2>
          <p>Latest enrolled camera snapshots from Visitor App and Kiosk registrations.</p>
        </div>
        <button className="secondaryButton" onClick={loadEnrollments} disabled={loading}>
          <RefreshCw size={18} /> Refresh
        </button>
      </div>

      {error && <div className="notice amber">{error}</div>}
      {loading && <div className="emptyState"><Image size={46} /><strong>Loading captures</strong></div>}
      {!loading && !enrollments.length && (
        <div className="emptyState"><Image size={46} /><strong>No captured images yet</strong></div>
      )}

      <div className="faceGalleryGrid">
        {enrollments.map((enrollment) => (
          <article className="faceCaptureCard" key={enrollment.id}>
            <button className="faceThumbButton" onClick={() => setSelected(enrollment)}>
              <img src={enrollment.imageData} alt={`${enrollment.source} capture ${enrollment.id}`} />
            </button>
            <div className="faceCaptureMeta">
              <strong>{enrollment.visitorName}</strong>
              <span>{enrollment.source} • {enrollment.visitorId}</span>
              <span>{formatDate(enrollment.enrolledAt)}</span>
              <span>{formatBytes(enrollment.imageSize)} • {Math.round(enrollment.confidence * 100)}% confidence</span>
            </div>
            <button className="miniButton" onClick={() => openImage(enrollment)}>
              <ExternalLink size={15} /> Open
            </button>
          </article>
        ))}
      </div>

      {selected && (
        <div className="facePreviewOverlay" role="dialog" aria-modal="true">
          <section className="facePreviewModal">
            <header>
              <div>
                <strong>{selected.visitorName}</strong>
                <span>{selected.source} • {selected.id}</span>
              </div>
              <button className="miniButton" onClick={() => setSelected(null)} aria-label="Close preview">
                <X size={18} />
              </button>
            </header>
            <img src={selected.imageData} alt={`${selected.source} capture ${selected.id}`} />
          </section>
        </div>
      )}
    </section>
  );
}
