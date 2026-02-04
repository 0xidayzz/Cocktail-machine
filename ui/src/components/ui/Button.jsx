export default function Button({ variant = "primary", type, style, ...props }) {
  const base = {
    padding: "11px 14px",
    borderRadius: 14,
    border: "1px solid rgba(255,255,255,0.12)",
    cursor: "pointer",
    fontWeight: 900,
    color: "rgba(255,255,255,0.92)",
    background: "rgba(255,255,255,0.06)",
  };

  const variants = {
    primary: { background: "linear-gradient(135deg, #7c3aed, #a78bfa)", border: "1px solid rgba(255,255,255,0.18)" },
    soft: { background: "rgba(124,58,237,0.18)" },
    ghost: { background: "transparent" },
    danger: { background: "rgba(239,68,68,0.22)" },
  };

  return (
    <button
      type={type ?? "button"}
      {...props}
      style={{ ...base, ...variants[variant], ...style }}
    />
  );
}
