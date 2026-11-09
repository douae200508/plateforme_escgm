// Icône générique : dessine un seul tracé SVG (voir theme.js) — évite de
// dépendre d'une librairie d'icônes externe, comme dans la maquette.
export default function Icon({ path, size = 18, color = 'currentColor', strokeWidth = 1.8 }) {
  return (
    <svg
      aria-hidden="true"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={path} />
    </svg>
  )
}
