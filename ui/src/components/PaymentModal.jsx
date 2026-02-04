import { useState } from "react";
import Modal from "./ui/Modal";
import Button from "./ui/Button";
import Input from "./ui/Input";
import { priceForSize } from "../api/price";

export default function PaymentModal({ open, recipe, sizeMl, guestBalance, onPay, onClose }) {
  const [amount, setAmount] = useState("5");

  if (!recipe) return null;

  const price = priceForSize(recipe.price, sizeMl);

  return (
    <Modal open={open} title="💳 Paiement (fictif)" onClose={onClose}>
      <div style={{ display: "grid", gap: 12 }}>
        <div style={{
          padding: 12,
          borderRadius: 16,
          background: "rgba(255,255,255,0.05)",
          border: "1px solid rgba(255,255,255,0.10)"
        }}>
          <div style={{ fontWeight: 950 }}>🍹 {recipe.name}</div>
          <div style={{ color: "var(--muted)", marginTop: 4 }}>
            Taille: <b>{sizeMl}ml</b> · Prix: <b>{price.toFixed(2)}€</b>
          </div>
          <div style={{ color: "var(--muted)", marginTop: 4 }}>
            Solde invité: <b>{Number(guestBalance || 0).toFixed(2)}€</b>
          </div>
        </div>

        <div>
          <div style={{ fontWeight: 900, marginBottom: 6 }}>Montant à “payer”</div>
          <Input value={amount} onChange={(e) => setAmount(e.target.value)} />
          <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 6 }}>
            (fictif) Tu peux mettre 1, 5, 10…
          </div>
        </div>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <Button onClick={() => onPay(Number(amount || 0), price)} style={{ minWidth: 220 }}>
            ✅ Payer et commander
          </Button>
          <Button variant="ghost" onClick={onClose}>Annuler</Button>
        </div>
      </div>
    </Modal>
  );
}
