import { useState } from "react";
import Layout from "../components/Layout";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import { loginAsGuest, loginUser } from "../api/auth";
import { useAuth } from "../auth/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const nav = useNavigate();
  const { refreshMe } = useAuth();

  const [tab, setTab] = useState("guest"); // guest | user | admin
  const [username, setUsername] = useState("johan");
  const [pin, setPin] = useState("1234");
  const [adminCode, setAdminCode] = useState("");
  const [err, setErr] = useState("");

  const go = () => {
    refreshMe();
    nav("/", { replace: true });
  };

  const onGuest = () => {
    loginAsGuest();
    go();
  };

  const onUser = () => {
    setErr("");
    try {
      loginUser({ username, pin });
      go();
    } catch (e) {
      setErr(e.message || "Erreur");
    }
  };

  const onAdmin = () => {
    setErr("");
    try {
      loginUser({ username: "admin", code: adminCode });
      go();
    } catch (e) {
      setErr(e.message || "Erreur");
    }
  };

  return (
    <Layout title="🍹 Cocktail Machine" subtitle="Choisis un mode de connexion">
      <div style={{ maxWidth: 560, margin: "0 auto" }}>
        <Card style={{ padding: 18 }}>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
            <Button variant={tab === "guest" ? "primary" : "soft"} onClick={() => setTab("guest")}>👤 Invité</Button>
            <Button variant={tab === "user" ? "primary" : "soft"} onClick={() => setTab("user")}>🙂 Utilisateur</Button>
            <Button variant={tab === "admin" ? "primary" : "soft"} onClick={() => setTab("admin")}>🛠️ Admin</Button>
          </div>

          {tab === "guest" ? (
            <div style={{ display: "grid", gap: 10 }}>
              <div style={{ color: "var(--muted)" }}>
                En invité: tu passeras par un “paiement fictif” avant de commander.
              </div>
              <Button onClick={onGuest} style={{ width: "100%" }}>➡️ Continuer</Button>
            </div>
          ) : null}

          {tab === "user" ? (
            <div style={{ display: "grid", gap: 10 }}>
              <div style={{ fontWeight: 900 }}>Connexion rapide (PIN)</div>
              <Input placeholder="Nom d’utilisateur" value={username} onChange={e => setUsername(e.target.value)} />
              <Input placeholder="PIN 4 chiffres" value={pin} onChange={e => setPin(e.target.value)} />
              <Button onClick={onUser} style={{ width: "100%" }}>✅ Se connecter</Button>
              <div style={{ fontSize: 12, color: "var(--muted)" }}>
                Démo: johan / 1234
              </div>
            </div>
          ) : null}

          {tab === "admin" ? (
            <div style={{ display: "grid", gap: 10 }}>
              <div style={{ fontWeight: 900 }}>Accès Admin (code)</div>
              <Input placeholder="Code admin" value={adminCode} onChange={e => setAdminCode(e.target.value)} />
              <Button onClick={onAdmin} style={{ width: "100%" }}>🔒 Entrer</Button>
              <div style={{ fontSize: 12, color: "var(--muted)" }}>
                Démo: code 9264
              </div>
            </div>
          ) : null}

          {err ? <div style={{ marginTop: 12, color: "var(--danger)", fontWeight: 900 }}>{err}</div> : null}
        </Card>
      </div>
    </Layout>
  );
}
