// Jetons de couleur extraits de la maquette (P2_Admin, "proto2" v2) — à
// réutiliser partout plutôt que de ressaisir des couleurs en dur.
export const colors = {
  bg: '#F4F7FB',
  sidebar: '#0E1E45',
  sidebarMuted: '#9FB3DA',
  sidebarText: '#C7D3EE',
  white: '#FFFFFF',
  border: '#E8EDF4',
  divider: '#EEF2F7',
  text: '#0F1E3D',
  textMuted: '#64748B',
  textSoft: '#475569',
  primary: '#2563EB',
  primaryHover: '#1D4ED8',
  primaryLight: '#EAF1FF',
  primaryLighter: '#DCE6FF',
  tableHead: '#F8FAFD',
  danger: '#B91C1C',
  dangerBg: '#FEF2F2',
  success: '#15803D',

  // Page de connexion (maquette P2_Login)
  brandTeal: '#2BB7A9',
  brandSlate: '#5B7486',
  brandAmber: '#F2A33A',
  cardBlueBg: '#E8F1FE',
  cardOrangeBg: '#FDF0E3',
  cardGreenBg: '#E7F8EF',
}

// Même table de correspondance statut → couleurs que la maquette, pour que
// les badges (Formation, Utilisateur, Signalement…) soient identiques.
export const BADGE = {
  Publiée: ['#DCFCE7', '#15803D'],
  Publié: ['#DCFCE7', '#15803D'],
  Brouillon: ['#FEF3C7', '#92400E'],
  Masquée: ['#E2E8F0', '#334155'],
  Archivée: ['#F1F5F9', '#64748B'],
  Actif: ['#DCFCE7', '#15803D'],
  Suspendu: ['#FEE2E2', '#B91C1C'],
  Nouveau: ['#FEE2E2', '#B91C1C'],
  'En cours': ['#FFEDD5', '#9A3412'],
  Résolu: ['#DCFCE7', '#15803D'],
  Haute: ['#FEE2E2', '#B91C1C'],
  Moyenne: ['#FFEDD5', '#9A3412'],
  Basse: ['#E0EAFF', '#1D4ED8'],
}

export function badgeColors(status) {
  return BADGE[status] || ['#F1F5F9', '#334155']
}

// Tracés SVG des icônes de la barre latérale (mêmes chemins que la maquette).
export const icons = {
  home: 'M3 11l9-7 9 7v9H3zM9 20v-6h6v6',
  book: 'M4 4h11a3 3 0 013 3v13H7a3 3 0 01-3-3zM4 17a3 3 0 013-3h11',
  layers: 'M12 3l9 5-9 5-9-5zM3 13l9 5 9-5',
  file: 'M6 3h8l4 4v14H6zM14 3v4h4',
  check: 'M4 4h16v16H4zM8 12l3 3 5-6',
  clip: 'M9 4h6v3H9zM6 6h12v15H6zM9 12h6M9 16h4',
  user: 'M12 12a4 4 0 100-8 4 4 0 000 8M4 21v-1a6 6 0 0112 0v1',
  users: 'M16 20v-1a4 4 0 00-4-4H7a4 4 0 00-4 4v1M9.5 11a3.5 3.5 0 100-7 3.5 3.5 0 000 7M21 20v-1a4 4 0 00-3-3.9',
  chart: 'M4 20V11M10 20V5M16 20v-6M3 20h18',
  flag: 'M5 21V4h12l-2 4 2 4H5',
  gear: 'M12 15a3 3 0 100-6 3 3 0 000 6M19 12l2-1-1-3-2 .5-1.5-1.5.5-2-3-1-1 2h-2l-1-2-3 1 .5 2L6 7.5 4 7l-1 3 2 1v2l-2 1 1 3 2-.5L7.5 18 7 20l3 1 1-2h2l1 2 3-1-.5-2 1.5-1.5 2 .5 1-3-2-1z',
}

// Items de la barre latérale admin — même ordre et libellés que la maquette.
export const ADMIN_NAV = [
  { id: 'dashboard', label: 'Tableau de bord', icon: icons.home, to: '/admin' },
  { id: 'formations', label: 'Formations', icon: icons.book, to: '/admin/formations' },
  { id: 'modules', label: 'Modules et chapitres', icon: icons.layers, to: '/admin/modules' },
  { id: 'ressources', label: 'Ressources', icon: icons.file, to: '/admin/ressources' },
  { id: 'qcm', label: 'QCM', icon: icons.check, to: '/admin/qcm' },
  { id: 'evaluations', label: 'Évaluations', icon: icons.clip, to: '/admin/evaluations' },
  { id: 'utilisateurs', label: 'Utilisateurs', icon: icons.user, to: '/admin/utilisateurs' },
  { id: 'groupes', label: 'Groupes', icon: icons.users, to: '/admin/groupes' },
  { id: 'resultats', label: 'Résultats', icon: icons.chart, to: '/admin/resultats' },
  { id: 'signalements', label: 'Signalements', icon: icons.flag, to: '/admin/signalements' },
  { id: 'parametres', label: 'Paramètres', icon: icons.gear, to: '/admin/parametres' },
]
