import { Trash2 } from 'lucide-react';

export default function ConfirmModal({ title, message, onConfirm, onCancel, confirmLabel = 'Supprimer' }) {
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-card confirm-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="confirm-modal-icon">
          <Trash2 size={22} color="#dc2626" />
        </div>
        <h3 className="modal-title" style={{ textAlign: 'center', marginBottom: 8 }}>{title}</h3>
        <p style={{ fontSize: 14, color: '#525252', textAlign: 'center', lineHeight: 1.6, marginBottom: 24 }}>
          {message}
        </p>
        <div className="modal-footer" style={{ justifyContent: 'center', marginTop: 0 }}>
          <button className="btn btn-secondary" onClick={onCancel}>Annuler</button>
          <button className="btn btn-danger" onClick={onConfirm}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}
