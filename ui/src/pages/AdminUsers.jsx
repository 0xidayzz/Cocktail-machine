import { useMemo, useState } from "react";
import Layout from "../components/Layout";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import { read, write, keys } from "../api/db";
import { listOrders } from "../api/orders";

export default function AdminUsers() {
  const [users, setUsers] = useState(() => (read(keys().USERS) || []).filter(u => u.role !== "admin"));
  const [selectedId, setSelectedId] = useState(users[0]?.id || null);
  const [delta, setDelta] = useState("5");

  const orders = listOrders();
  const selected = users.find(u => u.id === selectedId);

  const userOrders = useMemo(() => {
    return orders.filter(o => o.userId === selectedId).slice(0, 25);
  }, [orders, selectedId]);

  const saveUsers = (next) => {
    // On écrit tout (y compris admin), mais on ne l’affiche pas
    const all = read(keys().USERS) || [];
    const admin = all.filter(u => u.role === "admin");
    write(keys().USERS, [...admin, ...next]);
    setUsers(next);
  };

  const applyDelta = () => {
    const d = Number(delta || 0);
    const next = users.map(u => u.id === selectedId ? { ...u, balance: Number(u.balance || 0) + d } : u);
    saveUsers(next);
  };

  return (
    <Layout title="👥 Admin — Utilisateurs" subtitle="Solde + historique individuel">
      <div style={{ display: "grid", gridTemplateColumns: "320px 1fr", gap: 12 }}>
        <Card title="📒 Comptes">
          <div style={{ display: "grid", gap: 8 }}>
            {users.map(u => (
              <button
                key={u.id}
                onClick={() => setSelectedId(u.id)}
                style={{
                  textAlign: "left",
                  padding: 10,
                  borderRadius: 14,
                  border: "1px solid rgba(255,255,255,0.10)",
                  background: u.id === selectedId ? "rgba(124,58,237,0.22)" : "rgba(255,255,255,0.05)",
                  color: "var(--text)",
                  cursor: "pointer"
                }}
              >
                <div style={{ fontWeight: 950 }}>🙂 {u.username}</div>
                <div style={{ fontSize: 12, color: "var(--muted)" }}>Solde: {Number(u.balance || 0).toFixed(2)}€</div>
              </button>
            ))}
          </div>
        </Card>

        <Card title={selected ? `🧾 Profil — ${selected.username}` : "Sélection"}>
          {!selected ? <div style={{ color: "var(--muted)" }}>Choisis un utilisateur.</div> : (
            <>
              <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
                <div style={{ fontWeight: 950 }}>💰 Solde: {Number(selected.balance || 0).toFixed(2)}€</div>
                <div style={{ color: "var(--muted)" }}>ID: {selected.id}</div>
              </div>

              <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 12, flexWrap: "wrap" }}>
                <div style={{ width: 160 }}>
                  <Input value={delta} onChange={e => setDelta(e.target.value)} />
                </div>
                <Button variant="soft" onClick={applyDelta}>➕ / ➖ Modifier solde</Button>
                <div style={{ fontSize: 12, color: "var(--muted)" }}>Ex: -5 pour retirer</div>
              </div>

              <div style={{ marginTop: 14, fontWeight: 950 }}>🕒 Historique (25 derniers)</div>
              {userOrders.length === 0 ? (
                <div style={{ marginTop: 8, color: "var(--muted)" }}>Aucune commande.</div>
              ) : (
                <div style={{ display: "grid", gap: 8, marginTop: 8 }}>
                  {userOrders.map(o => (
                    <div key={o.id} style={{ padding: 10, borderRadius: 14, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
                      <div style={{ fontWeight: 950 }}>{o.recipeName} — {o.size_ml}ml</div>
                      <div style={{ fontSize: 12, color: "var(--muted)" }}>
                        {new Date(o.createdAt).toLocaleString()} · {Number(o.price).toFixed(2)}€
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </Card>
      </div>
    </Layout>
  );
}
