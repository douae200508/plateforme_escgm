import { colors } from '../theme'
import PageTitre from './PageTitre'

// Page provisoire : occupe une entrée du menu tant que la vraie page n'est
// pas construite. À supprimer quand toutes les pages seront faites.
export default function PageEnPreparation({ titre, sousTitre }) {
  return (
    <div>
      <PageTitre titre={titre} sousTitre={sousTitre} />
      <div style={{ background: colors.white, border: `1px solid ${colors.border}`, borderRadius: 16, padding: 32, textAlign: 'center' }}>
        <p style={{ margin: 0, color: colors.textMuted, fontSize: 14 }}>Page en préparation.</p>
      </div>
    </div>
  )
}
