import { colors } from '../theme'

// En-tête de page (titre + sous-titre + actions à droite), identique à
// celui des pages admin.
export default function PageTitre({ titre, sousTitre, children }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-end', gap: 16, marginBottom: 20 }}>
      <div>
        <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800 }}>{titre}</h1>
        {sousTitre && (
          <p style={{ margin: '6px 0 0', color: colors.textMuted, fontSize: 14 }}>{sousTitre}</p>
        )}
      </div>
      {children}
    </div>
  )
}
