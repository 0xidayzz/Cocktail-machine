// ui/src/components/charts/BarChart.jsx

export default function BarChart({ values }) {
  const max = Math.max(1, ...values);
  const chartH = 140;      // hauteur totale du graphe
  const barMin = 6;        // min visible en px
  const barMax = 110;      // hauteur max des barres (laisse de l’espace pour labels)

  return (
    <div style={{ display: "grid", gap: 10 }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(24, 1fr)",
          gap: 4,
          alignItems: "end",
          height: chartH,
          paddingTop: 8
        }}
      >
        {values.map((v, i) => {
          const h = Math.max(barMin, Math.round((v / max) * barMax));
          const isZero = v === 0;

          return (
            <div
              key={i}
              style={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                justifyContent: "flex-end",
                alignItems: "center",
                gap: 6
              }}
            >
              <div
                title={`${i}h : ${v}`}
                style={{
                  width: "100%",
                  height: `${h}px`,
                  background: isZero
                    ? "rgba(255,255,255,0.10)"
                    : "linear-gradient(180deg, rgba(167,139,250,0.95), rgba(124,58,237,0.95))",
                  borderRadius: 8,
                  border: "1px solid rgba(255,255,255,0.10)"
                }}
              />
              <div style={{ fontSize: 10, color: "var(--muted)", height: 12 }}>
                {i % 3 === 0 ? `${i}h` : ""}
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--muted)" }}>
        <span>📈 Plus haut: {max}</span>
        <span>🕒 0h → 23h</span>
      </div>
    </div>
  );
}
