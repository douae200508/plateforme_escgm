// Page d'accueil de chaque rôle : utilisée après la connexion et quand un
// utilisateur tente d'ouvrir un espace qui n'est pas le sien.
export const ESPACE_PAR_ROLE = {
  admin: '/admin',
  formateur: '/formateur',
  stagiaire: '/stagiaire',
}

export const LIBELLE_ROLE = {
  admin: 'Administrateur',
  formateur: 'Formateur',
  stagiaire: 'Stagiaire',
}

export function espaceDe(user) {
  return ESPACE_PAR_ROLE[user?.role] || '/login'
}
