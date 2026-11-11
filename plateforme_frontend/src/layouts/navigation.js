import { icons } from '../theme'

// Icônes propres aux espaces formateur et stagiaire (mêmes conventions que
// theme.js : un seul tracé SVG 24x24).
const extra = {
  mail: 'M3 5h18v14H3zM3 6l9 7 9-7',
  route: 'M6 19a2 2 0 100-4 2 2 0 000 4M18 9a2 2 0 100-4 2 2 0 000 4M6 15V9a4 4 0 014-4h6M18 9v6a4 4 0 01-4 4H8',
  star: 'M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z',
}

export const STAGIAIRE_NAV = [
  { id: 'accueil', label: 'Accueil', icon: icons.home, to: '/stagiaire', exact: true },
  { id: 'formations', label: 'Mes formations', icon: icons.book, to: '/stagiaire/formations' },
  { id: 'parcours', label: 'Mon parcours', icon: extra.route, to: '/stagiaire/parcours' },
  { id: 'notes', label: 'Mes notes', icon: extra.star, to: '/stagiaire/notes' },
  { id: 'messages', label: 'Messages', icon: extra.mail, to: '/stagiaire/messages' },
  { id: 'profil', label: 'Mon profil', icon: icons.user, to: '/stagiaire/profil' },
]

export const FORMATEUR_NAV = [
  { id: 'accueil', label: 'Accueil', icon: icons.home, to: '/formateur', exact: true },
  { id: 'cours', label: 'Cours et ressources', icon: icons.book, to: '/formateur/cours' },
  { id: 'corrections', label: 'QCM, TP et évaluations', icon: icons.check, to: '/formateur/corrections' },
  { id: 'suivi', label: 'Suivi du groupe', icon: icons.chart, to: '/formateur/suivi' },
  { id: 'signalements', label: 'Signalements', icon: icons.flag, to: '/formateur/signalements' },
  { id: 'messages', label: 'Messages', icon: extra.mail, to: '/formateur/messages' },
  { id: 'profil', label: 'Mon profil', icon: icons.user, to: '/formateur/profil' },
]
