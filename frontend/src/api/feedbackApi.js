const BASE = import.meta.env.VITE_API_URL || "http://localhost:3001/api";

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  if (!res.ok) {
    const message = await res
      .json()
      .then((data) => data.error)
      .catch(() => `API ${path} failed`);
    throw new Error(message);
  }

  return res.json();
}

export async function submitFeedback(feedback) {
  const data = await request("/feedback", {
    method: "POST",
    body: JSON.stringify(feedback),
  });
  return data.feedback;
}

export async function getFeedbackRecords() {
  const data = await request("/feedback");
  return data.feedback || [];
}

export async function updateFeedbackStatus(id, body) {
  const data = await request(`/feedback/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
  return data.feedback;
}
