import Card from "./ui/Card";
import ingredients from "../mock/ingredients.json";

const EMOJI = { orange: "🍊", ananas: "🍍", sprite: "🍋", cola: "🥤" };

function ingName(id) {
  return ingredients.find(i => i.id === id)?.name || id;
}

export default function RecipeCard({ recipe, onOpen }) {
  return (
    <div
      onClick={() => onOpen(recipe)}
      style={{ cursor: "pointer" }}
    >
      <Card style={{ padding: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
          <div>
            <div style={{ fontWeight: 950, fontSize: 18 }}>✨ {recipe.name}</div>
            <div style={{ color: "var(--muted)", marginTop: 4, fontSize: 13 }}>
              {recipe.ingredients
                .map(p => `${EMOJI[p.id] || "🧃"} ${ingName(p.id)} ${p.pct}%`)
                .join(" • ")}
            </div>
          </div>

          <div style={{
            padding: "6px 10px",
            borderRadius: 12,
            background: "rgba(124,58,237,0.25)",
            border: "1px solid rgba(255,255,255,0.12)",
            fontWeight: 900,
            height: "fit-content"
          }}>
            💳 {recipe.price.toFixed(2)}€ <span style={{ color: "var(--muted)", fontWeight: 700 }}>/200ml</span>
          </div>
        </div>

        <div style={{ marginTop: 10, color: "var(--muted)", fontSize: 12 }}>
          Cliquez pour choisir la taille ➜
        </div>
      </Card>
    </div>
  );
}
