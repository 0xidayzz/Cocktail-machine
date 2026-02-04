import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import Button from "./ui/Button";

const linkStyle = ({ isActive }) => ({
  textDecoration: "none",
  padding: "8px 12px",
  borderRadius: 14,
  border: "1px solid var(--border)",
  background: isActive ? "rgba(124,58,237,0.22)" : "rgba(255,255,255,0.05)",
  color: "var(--text)"
});

export default function Navbar() {
  const { session, me, logout } = useAuth();
  const loc = useLocation();
  const nav = useNavigate();

  if (!session) return null;
  if (loc.pathname === "/login") return null;

  const onLogout = () => {
    logout();
    nav("/login", { replace: true });
  };

  return (
    <header style={{ position: "sticky", top: 0, zIndex: 20, backdropFilter: "blur(10px)" }}>
      <div style={{
        borderBottom: "1px solid var(--border)",
        background: "rgba(10,10,18,0.55)"
      }}>
        <div style={{
          maxWidth: 1100,
          margin: "0 auto",
          padding: "12px 16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 34, height: 34, borderRadius: 12,
              background: "rgba(124,58,237,0.25)",
              border: "1px solid var(--border)"
            }} />
            <div>
              <div style={{ fontWeight: 950, lineHeight: 1 }}>Cocktail Machine</div>
              <div style={{ fontSize: 12, color: "var(--muted)" }}>
                {me?.username} · {session.role}
              </div>
            </div>
          </div>

          <nav style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
            <NavLink to="/" style={linkStyle}>Commander</NavLink>
            <NavLink to="/orders" style={linkStyle}>Historique</NavLink>
            {session.role === "admin" ? <NavLink to="/admin" style={linkStyle}>Admin</NavLink> : null}
            {session.role === "admin" ? <NavLink to="/admin/users" style={linkStyle}>Utilisateurs</NavLink> : null}
            <Button variant="ghost" onClick={onLogout} style={{ padding: "9px 12px" }}>Déconnexion</Button>
          </nav>
        </div>
      </div>
    </header>
  );
}
