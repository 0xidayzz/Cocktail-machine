import Modal from "./ui/Modal";

export default function PreparingModal({ open, progress, text, onClose }) {
  return (
    <Modal open={open} title="🛠️ Préparation" onClose={onClose}>
      <div style={{ display: "grid", gap: 12 }}>
        <div style={{ fontWeight: 950 }}>{text}</div>

        <div style={{ height: 12, borderRadius: 999, background: "rgba(255,255,255,0.10)", overflow: "hidden" }}>
          <div style={{ width: `${progress}%`, height: "100%", background: "rgba(124,58,237,0.95)" }} />
        </div>

        <div style={{ color: "var(--muted)" }}>{progress}%</div>
      </div>
    </Modal>
  );
}
