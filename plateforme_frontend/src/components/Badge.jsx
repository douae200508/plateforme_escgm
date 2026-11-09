import { badgeColors } from '../theme'

// Pastille de statut colorée (Publiée/Brouillon/Masquée…) — mêmes couleurs
// que la maquette pour que le sens (vert = ok, orange = attention…) soit
// cohérent sur tout le site.
export default function Badge({ status }) {
  const [bg, fg] = badgeColors(status)
  return (
    <span
      style={{
        padding: '3px 10px',
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 700,
        background: bg,
        color: fg,
      }}
    >
      {status}
    </span>
  )
}
