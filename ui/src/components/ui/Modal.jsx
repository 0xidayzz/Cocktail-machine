import Card from "./Card";
import Button from "./Button";

export default function Modal({ open, title, children, onClose }) {
  if (!open) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.82)",   // moins transparent
        display: "grid",
        placeItems: "center",
        zIndex: 999
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ width: "min(560px, 94vw)", animation: "pop 140ms ease-out" }}
      >
        <Card
          title={title}
          right={<Button variant="ghost" onClick={onClose}>✖</Button>}
          style={{
            padding: 16,
            background: "rgba(18,18,28,0.96)", // fenêtre quasi opaque
            border: "1px solid rgba(255,255,255,0.14)"
          }}
        >
          {children}
        </Card>
      </div>

      <style>{`
        @keyframes pop {
          from { transform: scale(0.97); opacity: 0.55; }
          to { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
