import React, { useEffect, useRef, useState } from "react";
import { Camera, CheckCircle2, ScanFace } from "lucide-react";

export function VisitorFaceIdPage({ appState, setAppState }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [agreed, setAgreed] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
    }
    return () => {
      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  const openCamera = async () => {
    if (!agreed) {
      setError("Please agree to biometric enrolment before opening the camera.");
      return;
    }
    setError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
        audio: false
      });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
      setCameraActive(true);
    } catch {
      setError("Camera permission was blocked or no camera was found. Please allow camera access and try again.");
    }
  };

  const enroll = () => {
    const pass = appState.passes[0];
    setAppState((current) => ({
      ...current,
      visitors: current.visitors.map((visitor) => visitor.id === pass?.ownerId ? { ...visitor, faceId: true } : visitor),
      logs: [`Face ID enrolled from visitor mobile app.`, ...current.logs].slice(0, 20)
    }));
    streamRef.current?.getTracks().forEach((track) => track.stop());
    setDone(true);
  };

  if (done) {
    return (
      <section className="mobileModule">
        <div className="successBox">
          <CheckCircle2 size={54} />
          <strong>Face ID enrolled</strong>
          <span>Your Face ID has been added. The entrance camera can detect your Face ID automatically during check-in.</span>
        </div>
      </section>
    );
  }

  return (
    <section className="mobileModule">
      <div className="faceCameraCard">
        <div className="faceVideoWrap">
          <video ref={videoRef} className={cameraActive ? "faceVideo active" : "faceVideo"} autoPlay playsInline muted />
          <div className="faceGuide">
            <ScanFace size={54} />
          </div>
        </div>
        <strong>Look at the camera</strong>
        <span>Blink once, then slowly turn your head to complete liveness check.</span>
      </div>

      <label className="checkLine">
        <input type="checkbox" checked={agreed} onChange={(event) => setAgreed(event.target.checked)} /> I agree to biometric enrolment.
      </label>

      {!cameraActive ? (
        <button className="primaryButton" onClick={openCamera}><Camera size={18} /> Open Device Camera</button>
      ) : (
        <button className="primaryButton" onClick={enroll}><CheckCircle2 size={18} /> Capture & Add Face ID</button>
      )}

      <div className={error ? "notice amber" : "notice"}>
        {error || (cameraActive
          ? "Front camera active. Align your face and complete the liveness prompt."
          : "Face ID is optional. The system stores a mathematical face embedding, not your photo.")}
      </div>
    </section>
  );
}
