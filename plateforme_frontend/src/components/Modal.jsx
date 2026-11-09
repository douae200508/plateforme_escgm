import { colors } from '../theme'

// Fenêtre de saisie générique (création/édition) — même structure que la
// maquette : fond semi-transparent, carte blanche arrondie centrée.
export default function Modal({ title, onClose, onSubmit, submitLabel = 'Enregistrer', children }) {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 60,
        background: 'rgba(15,30,61,0.45)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
      }}
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: 520,
          maxHeight: '90vh',
          overflowY: 'auto',
          background: colors.white,
          borderRadius: 18,
          padding: 24,
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          gap: 14,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 19, fontWeight: 800 }}>{title}</span>
          <button
            onClick={onClose}
            aria-label="Fermer"
            style={{
              width: 36,
              height: 36,
              border: 0,
              borderRadius: 8,
              background: '#F1F5F9',
              cursor: 'pointer',
              fontSize: 18,
            }}
          >
            ×
          </button>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault()
            onSubmit()
          }}
          style={{ display: 'flex', flexDirection: 'column', gap: 14 }}
        >
          {children}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 4 }}>
            <button
              type="button"
              onClick={onClose}
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
              type="submit"
              style={{
                minHeight: 44,
                padding: '0 18px',
                border: 0,
                borderRadius: 10,
                background: colors.primary,
                color: colors.white,
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              {submitLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// Champ de formulaire réutilisé dans les modales (label + input/textarea).
export function Field({ label, children }) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13, fontWeight: 700 }}>
      {label}
      {children}
    </label>
  )
}

export const inputStyle = {
  minHeight: 42,
  border: `1px solid ${colors.border}`,
  borderRadius: 10,
  padding: '0 12px',
  fontSize: 14,
  fontFamily: 'inherit',
}
