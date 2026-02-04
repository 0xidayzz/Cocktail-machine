export default function Layout({ title, subtitle, children }) {
  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "18px 16px 40px" }}>
      {title ? (
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 22, fontWeight: 950 }}>{title}</div>
          {subtitle ? <div style={{ color: "var(--muted)", marginTop: 4 }}>{subtitle}</div> : null}
        </div>
      ) : null}
      {children}
    </div>
  );
}
