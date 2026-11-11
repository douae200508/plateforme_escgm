import { Route, Routes } from 'react-router-dom'
import { RequireAdmin } from './auth/RequireAdmin'
import { RequireAuth } from './auth/RequireAuth'
import { RedirigerVersEspace } from './auth/RedirigerVersEspace'
import { stagiaireRoutes } from './routes/StagiaireRoutes'
import { formateurRoutes } from './routes/FormateurRoutes'
import AdminLayout from './layouts/AdminLayout'
import Login from './pages/auth/Login'
import QcmPassage from './pages/QcmPassage'
import Dashboard from './pages/admin/Dashboard'
import Formations from './pages/admin/Formations'
import ModulesChapitres from './pages/admin/ModulesChapitres'
import ChapitreEditeur from './pages/admin/ChapitreEditeur'
import Ressources from './pages/admin/Ressources'
import GestionQCM from './pages/admin/GestionQCM'
import Evaluations from './pages/admin/Evaluations'
import Utilisateurs from './pages/admin/Utilisateurs'
import Groupes from './pages/admin/Groupes'
import Resultats from './pages/admin/Resultats'
import Signalements from './pages/admin/Signalements'
import Parametres from './pages/admin/Parametres'

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route
        path="/qcm/:token"
        element={
          <RequireAuth>
            <QcmPassage />
          </RequireAuth>
        }
      />

      <Route
        path="/admin"
        element={
          <RequireAdmin>
            <AdminLayout />
          </RequireAdmin>
        }
      >
        {/* Les autres pages (Modules, QCM, Utilisateurs…) viendront ici au
            fur et à mesure — Formations est le point de départ. */}
        <Route index element={<Dashboard />} />
        <Route path="formations" element={<Formations />} />
        <Route path="modules" element={<ModulesChapitres />} />
        <Route path="modules/editeur/:chapitreId" element={<ChapitreEditeur />} />
        <Route path="ressources" element={<Ressources />} />
        <Route path="qcm" element={<GestionQCM />} />
        <Route path="evaluations" element={<Evaluations />} />
        <Route path="utilisateurs" element={<Utilisateurs />} />
        <Route path="groupes" element={<Groupes />} />
        <Route path="resultats" element={<Resultats />} />
        <Route path="signalements" element={<Signalements />} />
        <Route path="parametres" element={<Parametres />} />
      </Route>

      {formateurRoutes}
      {stagiaireRoutes}

      <Route path="/" element={<RedirigerVersEspace />} />
      <Route path="*" element={<RedirigerVersEspace />} />
    </Routes>
  )
}

export default App
