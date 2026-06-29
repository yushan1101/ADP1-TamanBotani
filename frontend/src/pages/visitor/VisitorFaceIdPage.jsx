import React, { useEffect, useRef, useState } from "react";
import { Camera, CheckCircle2, ScanFace } from "lucide-react";
import { enrollFaceId } from "../../api/monitoringApi";
import { captureFaceSnapshot, createDemoFacePayload, FACE_LIVENESS_STEPS } from "../../subsystems/registration/faceIdUtils";

export function VisitorFaceIdPage({ appState, setAppState }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [agreed, setAgreed] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const challengeComplete = stepIndex >= FACE_LIVENESS_STEPS.length;
  const activeStep = FACE_LIVENESS_STEPS[Math.min(stepIndex, FACE_LIVENESS_STEPS.length - 1)];

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
      setStepIndex(0);
    } catch {
      setError("Camera permission was blocked or no camera was found. Please allow camera access and try again.");
    }
  };

  const confirmStep = () => {
    setStepIndex((current) => Math.min(current + 1, FACE_LIVENESS_STEPS.length));
  };

  const enroll = async () => {
    const pass = appState.passes[0];
    const imageData = captureFaceSnapshot(videoRef.current);
    if (!imageData || !challengeComplete) {
      setError("Complete the blink-and-turn liveness check before capture.");
      return;
    }

    setSubmitting(true);
    try {
      const result = await enrollFaceId({
        ...createDemoFacePayload({
          source: "Visitor App",
          visitorId: pass?.ownerId,
          passId: pass?.id,
          imageData
        }),
        privacyConsent: agreed
      });
      setAppState((current) => ({
        ...current,
        visitors: current.visitors.map((visitor) => visitor.id === result.visitor.id ? { ...visitor, faceId: true } : visitor),
        logs: [result.log, ...current.logs].slice(0, 20)
      }));
      streamRef.current?.getTracks().forEach((track) => track.stop());
      setDone(true);
      return;
    } catch (apiError) {
      console.warn("Face ID API unavailable, using local demo state.", apiError);
    } finally {
      setSubmitting(false);
    }

    setAppState((current) => ({
      ...current,
      visitors: current.visitors.map((visitor) => visitor.id === pass?.ownerId ? { ...visitor, faceId: true, faceImage: imageData } : visitor),
      logs: [`Face ID enrolled from visitor mobile app with blink-and-turn liveness check.`, ...current.logs].slice(0, 20)
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
        <span>Complete the blink-and-turn liveness check, then capture your Face ID.</span>
      </div>

      {cameraActive && (
        <div className="faceLivenessPanel">
          <div className="faceActionPrompt">
            <span>{challengeComplete ? "Liveness complete" : `Step ${stepIndex + 1} of ${FACE_LIVENESS_STEPS.length}`}</span>
            <strong>{challengeComplete ? "Ready to capture" : activeStep.label}</strong>
            {!challengeComplete && <em>{activeStep.instruction}</em>}
          </div>
          <div className="faceActionDots">
            {FACE_LIVENESS_STEPS.map((step, index) => (
              <i key={step.id} className={index < stepIndex ? "done" : ""} />
            ))}
          </div>
          {!challengeComplete && (
            <button className="secondaryButton" onClick={confirmStep}>Confirm Step</button>
          )}
        </div>
      )}

      <label className="checkLine">
        <input type="checkbox" checked={agreed} onChange={(event) => setAgreed(event.target.checked)} /> I agree to biometric enrolment.
      </label>

      {!cameraActive ? (
        <button className="primaryButton" onClick={openCamera}><Camera size={18} /> Open Device Camera</button>
      ) : (
        <button className="primaryButton" onClick={enroll} disabled={!challengeComplete || submitting}><CheckCircle2 size={18} /> {submitting ? "Uploading..." : "Capture & Add Face ID"}</button>
      )}

      <div className={error ? "notice amber" : "notice"}>
        {error || (cameraActive
          ? "Front camera active. The snapshot and liveness result will be saved to the database for this demo."
          : "Face ID is optional. For demo, the system stores a camera snapshot and generated face embedding.")}
      </div>
    </section>
  );
}
