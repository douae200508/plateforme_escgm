import { Route } from 'react-router-dom'
import { RequireRole } from '../auth/RequireRole'
import EspaceLayout from '../layouts/EspaceLayout'
import { FORMATEUR_NAV } from '../layouts/navigation'
import PageEnPreparation from '../components/PageEnPreparation'

// Routes de l'espace formateur, regroupées ici pour ne pas alourdir App.jsx
// (fichier partagé avec l'espace admin).
export const formateurRoutes = (
  <Route
    path="/formateur"
    element={
      <RequireRole role="formateur">
        <EspaceLayout
          nav={FORMATEUR_NAV}
          ariaLabel="Menu formateur"
          searchPlaceholder="Rechercher un cours, un stagiaire..."
        />
      </RequireRole>
    }
  >
    <Route index element={<PageEnPreparation titre="Accueil" sousTitre="Votre formation et votre groupe en un coup d'œil." />} />
    <Route path="cours" element={<PageEnPreparation titre="Cours et ressources" sousTitre="Consultez les cours, téléchargez les supports, présentez en séance." />} />
    <Route path="corrections" element={<PageEnPreparation titre="QCM, TP et évaluations" sousTitre="Corrigés des QCM et des TP, sujets et corrigés des évaluations." />} />
    <Route path="suivi" element={<PageEnPreparation titre="Suivi du groupe" sousTitre="Progression et résultats de vos stagiaires." />} />
    <Route path="signalements" element={<PageEnPreparation titre="Signalements" sousTitre="Signalez un problème à l'administrateur et suivez sa réponse." />} />
    <Route path="messages" element={<PageEnPreparation titre="Messages" sousTitre="Échangez avec vos stagiaires et l'administrateur." />} />
    <Route path="profil" element={<PageEnPreparation titre="Mon profil" sousTitre="Vos informations et votre mot de passe." />} />
  </Route>
)
