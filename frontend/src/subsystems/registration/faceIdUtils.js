export const FACE_LIVENESS_STEPS = [
  { id: "center", label: "Face centered", instruction: "Look directly at the camera" },
  { id: "blink", label: "Blink once", instruction: "Blink naturally once" },
  { id: "turn-left", label: "Turn left", instruction: "Turn your face slightly left" },
  { id: "turn-right", label: "Turn right", instruction: "Turn your face slightly right" }
];

export function captureFaceSnapshot(video) {
  if (!video || video.readyState < 2) return "";
  const canvas = document.createElement("canvas");
  canvas.width = 320;
  canvas.height = 240;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/jpeg", 0.72);
}

export function createDemoFacePayload({ source, visitorId, passId, imageData }) {
  const actionSequence = FACE_LIVENESS_STEPS.map((step) => step.id);
  const seed = `${visitorId || passId || "face"}-${imageData.length}-${Date.now()}`;
  const embedding = Array.from({ length: 16 }, (_, index) => {
    const code = seed.charCodeAt(index % seed.length) || 0;
    return Number(((code + index * 17) / 255).toFixed(4));
  });

  return {
    source,
    visitorId,
    passId,
    faceImageData: imageData,
    embedding,
    confidence: 0.96,
    liveness: {
      type: "guided blink-and-turn check",
      passed: true,
      actionSequence,
      completedAt: new Date().toISOString()
    }
  };
}
