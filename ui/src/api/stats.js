export function ordersByHour(orders) {
  // retourne 24 valeurs (0..23)
  const arr = Array.from({ length: 24 }, () => 0);
  for (const o of orders) {
    if (o.status !== "done") continue;
    const d = new Date(o.createdAt);
    const h = d.getHours();
    arr[h] += 1;
  }
  return arr;
}
