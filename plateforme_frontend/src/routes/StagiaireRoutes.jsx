import { Route } from 'react-router-dom'
import { RequireRole } from '../auth/RequireRole'
import EspaceLayout from '../layouts/EspaceLayout'
import { STAGIAIRE_NAV } from '../layouts/navigation'
import PageEnPreparation from '../components/PageEnPreparation'

// Routes de l'espace stagiaire, regroupées ici pour ne pas alourdir App.jsx
// (fichier partagé avec l'espace admin).
export const stagiaireRoutes = (
  <Route
    path="/stagiaire"
    element={
      <RequireRole role="stagiaire">
        <EspaceLayout
          nav={STAGIAIRE_NAV}
          ariaLabel="Menu stagiaire"
          searchPlaceholder="Rechercher un cours, un chapitre..."
        />
      </RequireRole>
    }
  >
    <Route index element={<PageEnPreparation titre="Accueil" sousTitre="Reprenez votre formation là où vous l'avez laissée." />} />
    <Route path="formations" element={<PageEnPreparation titre="Mes formations" sousTitre="Les formations de votre groupe." />} />
    <Route path="parcours" element={<PageEnPreparation titre="Mon parcours" sousTitre="Votre progression, module par module." />} />
    <Route path="notes" element={<PageEnPreparation titre="Mes notes" sousTitre="Vos résultats aux QCM." />} />
    <Route path="messages" element={<PageEnPreparation titre="Messages" sousTitre="Échangez avec vos formateurs." />} />
    <Route path="profil" element={<PageEnPreparation titre="Mon profil" sousTitre="Vos informations et votre mot de passe." />} />
  </Route>
)
