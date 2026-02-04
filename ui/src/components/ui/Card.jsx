export default function Card({ title, right, children, style }) {
  return (
    <div
      style={{
        background: "rgba(255,255,255,0.06)",
        border: "1px solid rgba(255,255,255,0.10)",
        borderRadius: 18,
        boxShadow: "0 18px 60px rgba(0,0,0,0.45)",
        padding: 14,
        ...style
      }}
    >
      {(title || right) ? (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <div style={{ fontWeight: 950 }}>{title}</div>
          <div>{right}</div>
        </div>
      ) : null}
      {children}
    </div>
  );
}
