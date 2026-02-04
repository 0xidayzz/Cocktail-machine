import Modal from "./ui/Modal";
import Button from "./ui/Button";
import ingredients from "../mock/ingredients.json";
import { priceForSize } from "../api/price";

const EMOJI = { orange: "🍊", ananas: "🍍", sprite: "🍋", cola: "🥤" };

function ingName(id) {
  return ingredients.find(i => i.id === id)?.name || id;
}

export default function RecipeModal({ recipe, open, onClose, onPickSize }) {
  if (!recipe) return null;

  const sizes = [
    { label: "🥤 Petit", ml: 150 },
    { label: "🥛 Moyen", ml: 200 },
    { label: "🧋 Grand", ml: 300 }
  ];

  return (
    <Modal open={open} title={`🍹 ${recipe.name}`} onClose={onClose}>
      <div style={{ display: "grid", gap: 10 }}>
        <div style={{ color: "var(--muted)" }}>
          {recipe.ingredients.map(p => (
            <div key={p.id}>
              {EMOJI[p.id] || "🧃"} <b>{ingName(p.id)}</b> — {p.pct}%
            </div>
          ))}
        </div>

        <div style={{ height: 1, background: "rgba(255,255,255,0.10)", margin: "6px 0" }} />

        <div style={{ fontWeight: 950 }}>Choisir une taille :</div>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {sizes.map(s => {
            const price = priceForSize(recipe.price, s.ml);
            return (
              <Button key={s.ml} onClick={() => onPickSize(s.ml)} style={{ minWidth: 170 }}>
                {s.label} · {s.ml}ml · 💳 {price.toFixed(2)}€
              </Button>
            );
          })}
        </div>

        <div style={{ fontSize: 12, color: "var(--muted)" }}>
          Prix base indiqué pour 200ml.
        </div>
      </div>
    </Modal>
  );
}
