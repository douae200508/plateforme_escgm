import axios from 'axios'

// Une seule instance axios pour toute l'app : évite de réécrire l'URL de
// base et l'en-tête d'authentification dans chaque appel.
const api = axios.create({
  baseURL: 'http://127.0.0.1:8000/api',
  // Sans ça, Laravel peut répondre par une redirection HTML au lieu d'un
  // JSON propre sur certaines erreurs (ex. validation échouée).
  headers: { Accept: 'application/json' },
})

// Avant chaque requête, on relit le jeton dans localStorage et on l'ajoute
// automatiquement (Bearer token) — ainsi les pages n'ont jamais à s'en
// occuper elles-mêmes.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Si le jeton est invalide/expiré, l'API répond 401 : on déconnecte
// proprement plutôt que de laisser l'app dans un état incohérent.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  },
)

export default api
