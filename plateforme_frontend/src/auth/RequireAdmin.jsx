import { Navigate } from 'react-router-dom'
import { useAuth } from './AuthContext'

// Enveloppe une route : redirige vers /login si personne n'est connecté,
// ou si l'utilisateur connecté n'a pas le rôle admin (le back-end refuse
// déjà ces requêtes, mais sans ça l'interface admin resterait visible).
export function RequireAdmin({ children }) {
  const { user } = useAuth()

  if (!user) return <Navigate to="/login" replace />
  if (user.role !== 'admin') return <Navigate to="/login" replace />

  return children
}
