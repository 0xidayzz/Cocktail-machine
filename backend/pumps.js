import { setOutput } from "./plc.js";
import config from "./config.json" assert { type: "json" };

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

// ml → durée pompe
function mlToMs(ml) {
  const sec = ml / config.flowRateMlPerSec;
  return sec * 1000;
}

export async function pourIngredient(id, ml) {
  const coil = config.pumps[id];

  if (coil === undefined) {
    throw new Error("Unknown pump: " + id);
  }

  const duration = mlToMs(ml);

  console.log(`Pour ${id} : ${ml}ml (${duration}ms)`);

  await setOutput(coil, true);
  await sleep(duration);
  await setOutput(coil, false);
}

export async function pourRecipe(parts) {
  // parts = [{id, ml}]

  for (const p of parts) {
    await pourIngredient(p.id, p.ml);
    await sleep(300); // pause sécurité
  }
}
