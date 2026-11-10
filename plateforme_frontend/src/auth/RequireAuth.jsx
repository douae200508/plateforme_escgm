import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from './AuthContext'

// Enveloppe une route accessible à tout utilisateur connecté (pas
// seulement l'admin) — utilisé pour le lien de passage d'un QCM, que
// l'on peut recevoir sans être déjà connecté.
export function RequireAuth({ children }) {
  const { user } = useAuth()
  const location = useLocation()

  if (!user) return <Navigate to="/login" state={{ from: location }} replace />

  return children
}
