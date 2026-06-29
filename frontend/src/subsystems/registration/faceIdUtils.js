export const FACE_LIVENESS_COLORS = [
  { name: "Green", hex: "#38a169" },
  { name: "Blue", hex: "#3182ce" },
  { name: "Yellow", hex: "#d69e2e" },
  { name: "Red", hex: "#e53e3e" },
  { name: "Purple", hex: "#805ad5" },
  { name: "Cyan", hex: "#00a3c4" },
  { name: "Orange", hex: "#dd6b20" },
  { name: "White", hex: "#f7fafc" }
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
  const colorSequence = FACE_LIVENESS_COLORS.map((color) => color.name);
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
      type: "8-colour challenge",
      passed: true,
      colorSequence,
      completedAt: new Date().toISOString()
    }
  };
}
