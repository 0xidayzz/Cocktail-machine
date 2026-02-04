import { pctToMl } from "./converter";

const BASE = "http://raspberry-ip:3001"; // à changer plus tard

export async function sendToMachine(recipe, sizeMl) {
  const parts = pctToMl(sizeMl, recipe.ingredients);

  const res = await fetch(`${BASE}/api/pour`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ parts })
  });

  if (!res.ok) throw new Error("Machine error");

  return res.json();
}
