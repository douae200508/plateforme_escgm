import { Navigate } from 'react-router-dom'
import { useAuth } from './AuthContext'
import { espaceDe } from './roles'

// Pour "/" et les adresses inconnues : chacun est renvoyé vers son espace,
// ou vers la connexion s'il n'est pas connecté.
export function RedirigerVersEspace() {
  const { user } = useAuth()
  return <Navigate to={user ? espaceDe(user) : '/login'} replace />
}
