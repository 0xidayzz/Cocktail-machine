// ui/src/pages/Admin.jsx

import { useMemo, useState } from "react";
import Layout from "../components/Layout";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import BarChart from "../components/charts/BarChart";

import ingredients from "../mock/ingredients.json";
import { listOrders } from "../api/orders";
import { computeRemainingFromOrders } from "../api/inventory";
import { ordersByHour } from "../api/stats";
import { setBottleCapacity, refillBottle, refillAll } from "../api/bottles";

export default function Admin() {
  const [refresh, setRefresh] = useState(0);
  const bump = () => setRefresh(x => x + 1);

  const orders = useMemo(() => listOrders(), [refresh]);
  const remaining = useMemo(() => computeRemainingFromOrders(orders), [orders, refresh]);
  const hourly = useMemo(() => ordersByHour(orders), [orders]);

  const revenueTotal = useMemo(
    () => orders.reduce((s, o) => s + Number(o.price || 0), 0),
    [orders]
  );

  const revenueToday = useMemo(() => {
    const now = new Date();
    const y = now.getFullYear(), m = now.getMonth(), d = now.getDate();
    return orders.reduce((s, o) => {
      const dt = new Date(o.createdAt);
      const sameDay = dt.getFullYear() === y && dt.getMonth() === m && dt.getDate() === d;
      return s + (sameDay ? Number(o.price || 0) : 0);
    }, 0);
  }, [orders]);

  const last = orders.slice(0, 8);

  const [edit, setEdit] = useState(() => {
    const m = {};
    for (const i of ingredients) m[i.id] = String(i.bottle_ml);
    return m;
  });

  return (
    <Layout title="🛠️ Admin" subtitle="Stocks · stats · argent · commandes">
      <div style={{ display: "grid", gap: 12 }}>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
          <Card title="💶 Argent (total)">
            <div style={{ fontSize: 28, fontWeight: 950 }}>{revenueTotal.toFixed(2)}€</div>
            <div style={{ color: "var(--muted)", marginTop: 6 }}>Somme de toutes les commandes</div>
          </Card>

          <Card title="🗓️ Aujourd’hui">
            <div style={{ fontSize: 28, fontWeight: 950 }}>{revenueToday.toFixed(2)}€</div>
            <div style={{ color: "var(--muted)", marginTop: 6 }}>Total du jour</div>
          </Card>

          <Card title="🍹 Cocktails servis">
            <div style={{ fontSize: 28, fontWeight: 950 }}>{orders.length}</div>
            <div style={{ color: "var(--muted)", marginTop: 6 }}>Commandes “done” (mock)</div>
          </Card>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Card title="📊 Heure de consommation">
            <BarChart values={hourly} />
          </Card>

          <Card title="🧾 Dernières commandes">
            {last.length === 0 ? (
              <div style={{ color: "var(--muted)" }}>Aucune commande.</div>
            ) : (
              <div style={{ display: "grid", gap: 8 }}>
                {last.map(o => (
                  <div
                    key={o.id}
                    style={{
                      padding: 10,
                      borderRadius: 14,
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.08)"
                    }}
                  >
                    <div style={{ fontWeight: 950 }}>🍹 {o.recipeName} — {o.size_ml}ml</div>
                    <div style={{ fontSize: 12, color: "var(--muted)" }}>
                      🕒 {new Date(o.createdAt).toLocaleString()} · 💳 {Number(o.price).toFixed(2)}€
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        <Card
          title="🧃 Stocks bouteilles"
          right={
            <Button
              variant="danger"
              onClick={() => {
                // refill toutes: baseline_used_ml = utilisation totale actuelle
                const usedMap = {};
                for (const x of remaining) usedMap[x.id] = x._usedTotal;
                refillAll(usedMap);
                bump();
              }}
            >
              🔄 Reset toutes
            </Button>
          }
        >
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {remaining.map(r => (
              <div
                key={r.id}
                style={{
                  padding: 12,
                  borderRadius: 16,
                  background: r.low ? "rgba(239,68,68,0.12)" : "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.10)"
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                  <div style={{ fontWeight: 950 }}>{r.name}</div>
                  <div style={{ fontWeight: 950 }}>{r.remaining_ml} ml ({r.percent}%)</div>
                </div>

                <div style={{ height: 10, background: "rgba(255,255,255,0.10)", borderRadius: 999, overflow: "hidden", marginTop: 8 }}>
                  <div
                    style={{
                      width: `${r.percent}%`,
                      height: "100%",
                      background:
                        r.percent > 30 ? "rgba(124,58,237,0.90)" :
                        r.percent > 10 ? "rgba(245,158,11,0.90)" :
                        "rgba(239,68,68,0.90)"
                    }}
                  />
                </div>

                <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 10, flexWrap: "wrap" }}>
                  <div style={{ fontSize: 12, color: "var(--muted)" }}>Capacité (ml)</div>

                  <div style={{ width: 140 }}>
                    <Input
                      value={edit[r.id] ?? ""}
                      onChange={e => setEdit(x => ({ ...x, [r.id]: e.target.value }))}
                    />
                  </div>

                  <Button
                    variant="soft"
                    onClick={() => {
                      setBottleCapacity(r.id, Number(edit[r.id] || 0));
                      bump();
                    }}
                  >
                    💾 Sauver
                  </Button>

                  <Button
                    variant="ghost"
                    onClick={() => {
                      // bottle neuve: baseline_used_ml = utilisation totale actuelle
                      refillBottle(r.id, r._usedTotal);
                      bump();
                    }}
                  >
                    ♻️ Bottle neuve
                  </Button>
                </div>

                {r.low ? <div style={{ marginTop: 8, fontWeight: 950 }}>⚠️ À changer bientôt</div> : null}
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <a href="/admin/users" style={{ fontWeight: 950 }}>👥 Gestion utilisateurs</a>
        </Card>
      </div>
    </Layout>
  );
}
