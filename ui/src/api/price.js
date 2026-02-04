export function priceForSize(basePrice200, sizeMl) {
  const p = Number(basePrice200 || 0) * (Number(sizeMl || 200) / 200);
  return Math.round(p * 100) / 100;
}