// ui/src/pages/Home.jsx

import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import recipes from "../mock/recipes.json";
import { useAuth } from "../auth/AuthContext";

import RecipeCard from "../components/RecipeCard";
import RecipeModal from "../components/RecipeModal";
import PaymentModal from "../components/PaymentModal";
import PreparingModal from "../components/PreparingModal";
import Modal from "../components/ui/Modal";

import { pctToMl } from "../api/converter";
import { priceForSize } from "../api/price";
import { createOrder, getGuestBalance, topUpGuest, debitGuest } from "../api/orders";

import { plcConnect, plcOnMessage } from "../api/plcClient";
import { sendJobToBackend } from "../api/sendJob";

export default function Home() {
  const { session, me, refreshMe } = useAuth();

  // Backend URLs (PC test)
  const HTTP_BASE = "http://localhost:3001";
  const WS_URL = "ws://localhost:3001/ws";

  // UI states
  const [selected, setSelected] = useState(null); // recette sélectionnée (modal recette)
  const [confirm, setConfirm] = useState(null); // commande enregistrée (modal)
  const [pay, setPay] = useState(null); // { recipe, sizeMl } pour invité
  const [guestBalance, setGuestBalance] = useState(() => getGuestBalance());

  // Preparation modal + logs
  const [preparingOpen, setPreparingOpen] = useState(false);
  const [prepProgress, setPrepProgress] = useState(0);
  const [prepText, setPrepText] = useState("En attente…");
  const [prepLogs, setPrepLogs] = useState([]);

  const log = (s) => {
    const line = `[${new Date().toLocaleTimeString()}] ${s}`;
    setPrepLogs((x) => [line, ...x].slice(0, 120));
    // log aussi dans console navigateur
    console.log(line);
  };

  // Connect WS + listen PLC status
  useEffect(() => {
    log(`UI ready`);
    plcConnect(WS_URL, log);

    const off = plcOnMessage((msg) => {
      // logs utiles
      if (msg?.type) log(`WS msg: ${msg.type}`);

      if (msg.type !== "plc_status") return;

      // Ouvre la modal dès qu'on reçoit un status
      setPreparingOpen(true);

      if (msg.state === 0) {
        setPrepText("⏳ En attente…");
        setPrepProgress(Number(msg.progress || 0));
      } else if (msg.state === 1) {
        setPrepText("🍹 Préparation en cours…");
        setPrepProgress(Number(msg.progress || 0));
      } else if (msg.state === 2) {
        setPrepText("✅ Préparation terminée !");
        setPrepProgress(100);
      } else if (msg.state === 3) {
        setPrepText(`❌ Erreur automate (code ${msg.error_code || "?"})`);
        setPrepProgress(0);
      }
    });

    return () => off();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openRecipe = (recipe) => setSelected(recipe);

  // jobId 0..65535 (compatible Modbus)
  const makeJobId = () => Math.floor(Date.now() % 65535);

  const startBackendJob = async (recipe, sizeMl) => {
    const parts = pctToMl(sizeMl, recipe.ingredients); // [{id,pct,ml}]

    // mapping 4 boissons
    const mlMap = {
      orange: parts.find((p) => p.id === "orange")?.ml || 0,
      ananas: parts.find((p) => p.id === "ananas")?.ml || 0,
      sprite: parts.find((p) => p.id === "sprite")?.ml || 0,
      cola: parts.find((p) => p.id === "cola")?.ml || 0
    };

    const job_id = makeJobId();

    log(`POST ${HTTP_BASE}/api/job`);
    log(`JOB id=${job_id} size=${sizeMl}ml`);
    log(`ML: orange=${mlMap.orange} ananas=${mlMap.ananas} sprite=${mlMap.sprite} cola=${mlMap.cola}`);

    setPreparingOpen(true);
    setPrepProgress(0);
    setPrepText("📡 Envoi à l’automate…");

    await sendJobToBackend(HTTP_BASE, {
      job_id,
      total_ml: Number(sizeMl),
      ml: mlMap
    });

    setPrepText("🍹 Préparation en cours…");
    log("✅ Job envoyé au backend");
  };

  const pickSize = async (sizeMl) => {
    if (!selected) return;

    // invité => paiement
    if (session.role === "guest") {
      setPay({ recipe: selected, sizeMl });
      return;
    }

    try {
      // sauvegarde historique + solde
      const order = createOrder({ recipeId: selected.id, sizeMl });
      refreshMe();

      // lance automate (mock sur PC)
      await startBackendJob(selected, sizeMl);

      setSelected(null);
      setConfirm(order);
    } catch (e) {
      log(`❌ Erreur: ${e.message}`);
      setPreparingOpen(true);
      setPrepText(`❌ Erreur: ${e.message}`);
    }
  };

  const onPay = async (amount) => {
    if (!pay) return;

    const price = priceForSize(pay.recipe.price, pay.sizeMl);

    topUpGuest(amount);
    debitGuest(price);

    const order = createOrder({ recipeId: pay.recipe.id, sizeMl: pay.sizeMl });

    setGuestBalance(getGuestBalance());
    setPay(null);
    setSelected(null);

    try {
      await startBackendJob(pay.recipe, pay.sizeMl);
      setConfirm({ ...order, price });
    } catch (e) {
      log(`❌ Erreur automate: ${e.message}`);
      setPreparingOpen(true);
      setPrepText(`❌ Erreur automate: ${e.message}`);
    }
  };

  return (
    <Layout title="🍹 Commander" subtitle="Choisis un cocktail puis une taille.">
      <div style={{ display: "grid", gap: 12 }}>
        <Card>
          <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
            <div>
              Connecté: <b>{me?.username}</b> ({session.role})
            </div>

            {session.role === "guest" ? (
              <div>
                💳 Solde invité: <b>{Number(guestBalance || 0).toFixed(2)}€</b>
              </div>
            ) : (
              <div>
                💰 Solde: <b>{Number(me?.balance || 0).toFixed(2)}€</b>
              </div>
            )}

            {/* Bouton test pour vérifier UI->Backend->WS */}
            <Button
              variant="soft"
              onClick={() =>
                sendJobToBackend(HTTP_BASE, {
                  job_id: Math.floor(Date.now() % 65535),
                  total_ml: 200,
                  ml: { orange: 100, ananas: 50, sprite: 50, cola: 0 }
                }).catch((e) => log(`❌ Test job error: ${e.message}`))
              }
            >
              🧪 Test préparation
            </Button>
          </div>
        </Card>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 12 }}>
          {recipes.map((r) => (
            <RecipeCard key={r.id} recipe={r} onOpen={openRecipe} />
          ))}
        </div>
      </div>

      {/* Modal recette : ingrédients + tailles */}
      <RecipeModal
        recipe={selected}
        open={!!selected}
        onClose={() => setSelected(null)}
        onPickSize={pickSize}
      />

      {/* Modal paiement invité */}
      <PaymentModal
        open={!!pay}
        recipe={pay?.recipe || null}
        sizeMl={pay?.sizeMl || 200}
        guestBalance={guestBalance}
        onPay={(amount) => onPay(amount)}
        onClose={() => setPay(null)}
      />

      {/* Modal confirmation enregistrement */}
      <Modal open={!!confirm} title="✅ Commande enregistrée" onClose={() => setConfirm(null)}>
        {confirm ? (
          <div style={{ display: "grid", gap: 10 }}>
            <div style={{ fontWeight: 950 }}>🍹 {confirm.recipeName}</div>
            <div style={{ color: "var(--muted)" }}>Taille: {confirm.size_ml} ml</div>
            <div style={{ fontWeight: 950 }}>Prix: {Number(confirm.price).toFixed(2)}€</div>
            <Button variant="soft" onClick={() => setConfirm(null)}>
              OK
            </Button>
          </div>
        ) : null}
      </Modal>

      {/* Modal préparation + logs */}
      <PreparingModal
        open={preparingOpen}
        progress={prepProgress}
        text={prepText}
        logs={prepLogs}
        onClose={() => setPreparingOpen(false)}
      />
    </Layout>
  );
}
