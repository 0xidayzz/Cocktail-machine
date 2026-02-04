// ui/src/api/sendJob.js

export async function sendJobToBackend(baseUrl, payload) {
  const res = await fetch(`${baseUrl}/api/job`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  let data = {};
  try {
    data = await res.json();
  } catch {}

  if (!res.ok) {
    throw new Error(data?.error || "Backend error");
  }

  return data;
}
