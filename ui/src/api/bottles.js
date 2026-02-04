import ingredients from "../mock/ingredients.json";
import { read, write, keys } from "./db";

// structure stockée:
// {
//   orange: { cap: null|number, baseline_used_ml: number },
//   ...
// }
function defaultState() {
  const s = {};
  for (const i of ingredients) s[i.id] = { cap: null, baseline_used_ml: 0 };
  return s;
}

export function getBottleState() {
  const s = read(keys().BOTTLES);
  if (!s) return defaultState();

  // compat: si l’ancien format avait juste null/number
  const out = defaultState();
  for (const i of ingredients) {
    const v = s[i.id];
    if (v && typeof v === "object") out[i.id] = { cap: v.cap ?? null, baseline_used_ml: Number(v.baseline_used_ml || 0) };
    else out[i.id] = { cap: (v === null || v === undefined) ? null : Number(v), baseline_used_ml: 0 };
  }
  return out;
}

export function getBottleCapacity(id) {
  const st = getBottleState();
  const base = ingredients.find(i => i.id === id)?.bottle_ml || 0;
  const cap = st[id]?.cap;
  return cap === null || cap === undefined ? base : Number(cap);
}

export function getBottleBaseline(id) {
  const st = getBottleState();
  return Number(st[id]?.baseline_used_ml || 0);
}

export function setBottleCapacity(id, ml) {
  const st = getBottleState();
  st[id] = st[id] || { cap: null, baseline_used_ml: 0 };
  st[id].cap = Number(ml || 0);
  write(keys().BOTTLES, st);
}

// “Bottle neuve” = on remet baseline au niveau d’utilisation actuel
export function refillBottle(id, currentUsedMl) {
  const st = getBottleState();
  st[id] = st[id] || { cap: null, baseline_used_ml: 0 };
  st[id].baseline_used_ml = Number(currentUsedMl || 0);
  write(keys().BOTTLES, st);
}

export function refillAll(currentUsedByIng) {
  const st = getBottleState();
  for (const key of Object.keys(st)) {
    st[key].baseline_used_ml = Number(currentUsedByIng[key] || 0);
  }
  write(keys().BOTTLES, st);
}
