import { useState } from 'react'
import Badge from '../../components/Badge'
import { inputStyle } from '../../components/Modal'
import { colors } from '../../theme'

// Pur front pour l'instant (pas encore de contrôleur Signalement côté
// Laravel) — données d'exemple reprises de la maquette.
const INITIAL_SIGNALEMENTS = [
  {
    id: 1,
    titre: 'Erreur dans un corrigé',
    auteur: 'Sophie Martin',
    type: 'Erreur dans un contenu',
    date: '2026-10-14',
    priorite: 'Haute',
    statut: 'Nouveau',
    message: 'Il y a une erreur dans le corrigé du QCM du chapitre 3 (question 2).',
    reponse: '',
  },
  {
    id: 2,
    titre: 'Document manquant – Réseaux',
    auteur: 'Karim Ali',
    type: 'Document manquant',
    date: '2026-10-13',
    priorite: 'Moyenne',
    statut: 'Nouveau',
    message: "Le support PDF du chapitre réseaux n'est pas encore disponible pour les stagiaires.",
    reponse: '',
  },
  {
    id: 3,
    titre: 'Problème d’accès – Vidéo HTML',
    auteur: 'Mariam Abdallah',
    type: 'Problème technique',
    date: '2026-10-11',
    priorite: 'Basse',
    statut: 'En cours',
    message: 'Un stagiaire signale ne pas pouvoir lire la vidéo du chapitre Structure HTML.',
    reponse: "Nous regardons le souci d'encodage, merci de patienter.",
  },
  {
    id: 4,
    titre: 'Faute dans un énoncé – CSS',
    auteur: 'Sophie Martin',
    type: 'Erreur dans un contenu',
    date: '2026-10-08',
    priorite: 'Moyenne',
    statut: 'Résolu',
    message: 'Le chapitre Mise en forme CSS contient une faute dans l’énoncé du TP.',
    reponse: 'Corrigé, merci du signalement !',
  },
]

const TABS = [
  { id: 'Nouveau', label: 'Nouveau' },
  { id: 'En cours', label: 'En cours' },
  { id: 'Résolu', label: 'Résolu' },
  { id: 'Tous', label: 'Tous' },
]

export default function Signalements() {
  const [signalements, setSignalements] = useState(INITIAL_SIGNALEMENTS)
  const [tab, setTab] = useState('Nouveau')
  const [selectedId, setSelectedId] = useState(INITIAL_SIGNALEMENTS[0].id)
  const [draft, setDraft] = useState('')

  const counts = {
    Nouveau: signalements.filter((s) => s.statut === 'Nouveau').length,
    'En cours': signalements.filter((s) => s.statut === 'En cours').length,
    Résolu: signalements.filter((s) => s.statut === 'Résolu').length,
    Tous: signalements.length,
  }

  const visible = tab === 'Tous' ? signalements : signalements.filter((s) => s.statut === tab)
  const selected = signalements.find((s) => s.id === selectedId) || visible[0]

  const selectSignalement = (s) => {
    setSelectedId(s.id)
    setDraft(s.reponse)
  }

  const update = (id, patch) => {
    setSignalements((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)))
  }

  const changePriorite = (priorite) => update(selected.id, { priorite })

  const envoyerReponse = () => {
    update(selected.id, { reponse: draft, statut: selected.statut === 'Nouveau' ? 'En cours' : selected.statut })
  }

  const marquerResolu = () => {
    update(selected.id, { statut: 'Résolu', reponse: draft })
  }

  return (
    <div>
      <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800 }}>Signalements</h1>
      <p style={{ margin: '6px 0 0', color: colors.textMuted, fontSize: 14 }}>
        Demandes envoyées par les formateurs.
      </p>

      <div style={{ display: 'flex', gap: 22, borderBottom: `1px solid ${colors.border}`, margin: '18px 0 16px' }}>
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              minHeight: 40,
              padding: '0 2px',
              border: 0,
              borderBottom: `2px solid ${tab === t.id ? colors.primary : 'transparent'}`,
              background: 'transparent',
              cursor: 'pointer',
              fontSize: 13.5,
              fontWeight: 600,
              color: tab === t.id ? colors.primary : colors.textMuted,
            }}
          >
            {t.label} ({counts[t.id]})
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start', flexWrap: 'wrap' }}>
        <div style={{ flex: '1 1 260px', maxWidth: 300, display: 'flex', flexDirection: 'column', gap: 10 }}>
          {visible.map((s) => {
            const active = selected?.id === s.id
            return (
              <button
                key={s.id}
                onClick={() => selectSignalement(s)}
                style={{
                  textAlign: 'left',
                  background: active ? colors.primaryLight : colors.white,
                  border: `1px solid ${active ? colors.primary : colors.border}`,
                  borderRadius: 14,
                  padding: 14,
                  cursor: 'pointer',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                  <span style={{ fontWeight: 700, fontSize: 14 }}>{s.titre}</span>
                  <Badge status={s.priorite} />
                </div>
                <div style={{ fontSize: 12, color: colors.textMuted, marginTop: 6 }}>
                  {s.auteur} · {new Date(s.date).toLocaleDateString('fr-FR')} · {s.statut}
                </div>
              </button>
            )
          })}
          {visible.length === 0 && <p style={{ fontSize: 13, color: colors.textMuted }}>Aucun signalement dans cette catégorie.</p>}
        </div>

        {selected && (
          <div style={{ flex: '3 1 480px', minWidth: 300, background: colors.white, border: `1px solid ${colors.border}`, borderRadius: 16, padding: 22 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
              <h2 style={{ margin: 0, fontSize: 19, fontWeight: 800 }}>{selected.titre}</h2>
              <Badge status={selected.statut} />
            </div>
            <p style={{ margin: '6px 0 16px', fontSize: 13, color: colors.textMuted }}>
              {selected.auteur} · {selected.type} · {new Date(selected.date).toLocaleDateString('fr-FR')}
            </p>

            <div style={{ background: colors.bg, border: `1px solid ${colors.border}`, borderRadius: 12, padding: 14, fontSize: 14, marginBottom: 20 }}>
              {selected.message}
            </div>

            <label style={{ display: 'flex', flexDirection: 'column', gap: 7, fontSize: 13, fontWeight: 700, marginBottom: 18 }}>
              Priorité
              <select value={selected.priorite} onChange={(e) => changePriorite(e.target.value)} style={{ ...inputStyle, maxWidth: 220, background: colors.white }}>
                <option value="Haute">Haute</option>
                <option value="Moyenne">Moyenne</option>
                <option value="Basse">Basse</option>
              </select>
            </label>

            <label style={{ display: 'flex', flexDirection: 'column', gap: 7, fontSize: 13, fontWeight: 700, marginBottom: 18 }}>
              Répondre au formateur
              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Votre réponse"
                rows={4}
                style={{ ...inputStyle, minHeight: 'unset', padding: 12, resize: 'vertical', lineHeight: 1.5 }}
              />
            </label>

            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <button onClick={envoyerReponse} style={primaryBtnStyle}>Envoyer la réponse</button>
              <button onClick={marquerResolu} style={outlineSuccessBtnStyle}>Marquer comme résolu</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

const primaryBtnStyle = {
  minHeight: 44,
  padding: '0 18px',
  border: 0,
  borderRadius: 10,
  background: colors.primary,
  color: colors.white,
  fontWeight: 700,
  cursor: 'pointer',
  whiteSpace: 'nowrap',
}

const outlineSuccessBtnStyle = {
  minHeight: 44,
  padding: '0 18px',
  border: `1.5px solid ${colors.success}`,
  borderRadius: 10,
  background: colors.white,
  color: colors.success,
  fontWeight: 700,
  cursor: 'pointer',
  whiteSpace: 'nowrap',
}
