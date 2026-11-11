import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from './AuthContext'
import { espaceDe } from './roles'

// Enveloppe un espace réservé à un rôle :
// - personne de connecté → page de connexion (on mémorise la page demandée) ;
// - mauvais rôle → renvoyé vers son propre espace, pas vers /login, pour
//   éviter la boucle de redirection.
// L'API refuse déjà ces requêtes (middleware role:) ; ceci ne fait que
// cacher l'interface.
export function RequireRole({ role, children }) {
  const { user } = useAuth()
  const location = useLocation()

  if (!user) return <Navigate to="/login" state={{ from: location }} replace />
  if (user.role !== role) return <Navigate to={espaceDe(user)} replace />

  return children
}
