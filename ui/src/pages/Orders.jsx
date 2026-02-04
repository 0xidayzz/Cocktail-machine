import Layout from "../components/Layout";
import Card from "../components/ui/Card";
import { useAuth } from "../auth/AuthContext";
import { listOrdersForUser } from "../api/orders";

export default function Orders() {
  const { session } = useAuth();
  const orders = listOrdersForUser(session.userId);

  return (
    <Layout title="📜 Historique" subtitle="Date · taille · prix">
      <div style={{ display: "grid", gap: 12 }}>
        {orders.length === 0 ? (
          <Card>
            <div style={{ color: "var(--muted)" }}>Aucune commande.</div>
          </Card>
        ) : (
          orders.map(o => (
            <Card key={o.id} style={{ padding: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                <div style={{ fontWeight: 950 }}>🍹 {o.recipeName} · {o.size_ml}ml</div>
                <div style={{ fontWeight: 950 }}>💳 {Number(o.price).toFixed(2)}€</div>
              </div>
              <div style={{ marginTop: 6, fontSize: 12, color: "var(--muted)" }}>
                🕒 {new Date(o.createdAt).toLocaleString()} · {o.status}
              </div>
            </Card>
          ))
        )}
      </div>
    </Layout>
  );
}
