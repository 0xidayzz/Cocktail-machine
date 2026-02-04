// ui/src/api/inventory.js

import recipes from "../mock/recipes.json";
import ingredients from "../mock/ingredients.json";
import { pctToMl } from "./converter";
import { getBottleCapacity, getBottleBaseline } from "./bottles";

// Conso totale (cumulée) depuis toutes les commandes "done"
export function computeUsedByIngredientFromOrders(orders) {
  const recipeMap = new Map(recipes.map(r => [r.id, r]));
  const usedByIng = {};

  for (const o of orders) {
    if (o.status !== "done") continue;

    const r = recipeMap.get(o.recipeId);
    if (!r) continue;

    const size = Number(o.size_ml || 200);
    const parts = pctToMl(size, r.ingredients);

    for (const p of parts) {
      usedByIng[p.id] = (usedByIng[p.id] || 0) + Number(p.ml || 0);
    }
  }

  return usedByIng;
}

// Stock restant en tenant compte du "refill" via baseline_used_ml
export function computeRemainingFromOrders(orders) {
  const usedByIng = computeUsedByIngredientFromOrders(orders);

  return ingredients
    .map(i => {
      const usedTotal = usedByIng[i.id] || 0;
      const baseline = Number(getBottleBaseline(i.id) || 0);
      const usedSinceRefill = Math.max(0, usedTotal - baseline);

      const capacity = Number(getBottleCapacity(i.id) || 0);
      const remaining = Math.max(0, capacity - usedSinceRefill);
      const percent = capacity ? Math.round((remaining / capacity) * 100) : 0;

      return {
        ...i,
        bottle_ml: capacity,
        used_ml: usedSinceRefill,
        remaining_ml: remaining,
        percent,
        low: percent <= 15,
        _usedTotal: usedTotal
      };
    })
    .sort((a, b) => a.percent - b.percent);
}
