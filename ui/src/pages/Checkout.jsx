import { useMemo, useState } from "react";
import Layout from "../components/Layout";
import { useLocation, useNavigate } from "react-router-dom";
import recipes from "../mock/recipes.json";
import { createOrder, debitGuest, getGuestBalance, topUpGuest } from "../api/orders";

function useQuery() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}

export default function Checkout() {
  const q = useQuery();
  const nav = useNavigate();
  const recipeId = q.get("recipeId");
  const sizeMl = Number(q.get("sizeMl") || 200);

  const recipe = recipes.find(r => r.id === recipeId);
  const [amount, setAmount] = useState("5");

  if (!recipe) {
    return (
      <Layout title="Paiement">
        <div>Recette invalide.</div>
      </Layout>
    );
  }

  const balance = getGuestBalance();

  const payAndOrder = () => {
    topUpGuest(Number(amount || 0));       // paiement fictif
    createOrder({ recipeId, sizeMl });     // créer commande
    debitGuest(recipe.price);              // débiter solde invité (peut devenir négatif)
    nav("/orders");
  };

  return (
    <Layout title="Paiement (fictif)">
      <div style={{ display: "grid", gap: 10, maxWidth: 420 }}>
        <div>Cocktail: <b>{recipe.name}</b> — {recipe.price.toFixed(2)}€</div>
        <div>Taille: <b>{sizeMl} ml</b></div>
        <div>Solde invité actuel: <b>{balance.toFixed(2)}€</b></div>

        <label>Montant à “payer” (fictif)</label>
        <input value={amount} onChange={e => setAmount(e.target.value)} />

        <button onClick={payAndOrder} style={{ padding: 12, borderRadius: 12 }}>
          Payer et commander
        </button>
      </div>
    </Layout>
  );
}
