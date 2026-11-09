import { colors } from '../theme'

// Boîte de confirmation (ex. "Supprimer cette formation ?") — même
// structure que la maquette, bouton d'action en rouge.
export default function ConfirmDialog({ title, text, cta = 'Confirmer', onCancel, onConfirm }) {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 65,
        background: 'rgba(15,30,61,0.45)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
      }}
      onClick={onCancel}
    >
      <div
        role="alertdialog"
        aria-label="Confirmation"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: 420,
          background: colors.white,
          borderRadius: 18,
          padding: 24,
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          gap: 14,
        }}
      >
        <span style={{ fontSize: 18, fontWeight: 800 }}>{title}</span>
        <span style={{ fontSize: 14, color: colors.textSoft, lineHeight: 1.6 }}>{text}</span>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <button
            onClick={onCancel}
            style={{
              minHeight: 44,
              padding: '0 16px',
              border: `1px solid ${colors.border}`,
              borderRadius: 10,
              background: colors.white,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Annuler
          </button>
          <button
            onClick={onConfirm}
            style={{
              minHeight: 44,
              padding: '0 18px',
              border: 0,
              borderRadius: 10,
              background: '#DC2626',
              color: colors.white,
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            {cta}
          </button>
        </div>
      </div>
    </div>
  )
}
