export function pctToMl(totalMl, parts) {
  const raw = parts.map(p => ({ ...p, ml: Math.floor((totalMl * p.pct) / 100) }));
  const used = raw.reduce((s, p) => s + p.ml, 0);
  let rest = totalMl - used;

  const order = [...raw]
    .map((p, i) => ({ i, pct: p.pct }))
    .sort((a, b) => b.pct - a.pct);

  let k = 0;
  while (rest > 0) {
    raw[order[k].i].ml += 1;
    rest--;
    k = (k + 1) % order.length;
  }
  return raw;
}
