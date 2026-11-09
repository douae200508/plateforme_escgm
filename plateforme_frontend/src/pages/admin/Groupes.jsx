import { useState } from 'react'
import Modal, { Field, inputStyle } from '../../components/Modal'
import ConfirmDialog from '../../components/ConfirmDialog'
import { colors } from '../../theme'

// Pur front pour l'instant (pas encore de contrôleur Groupe côté Laravel)
// — données d'exemple reprises de la maquette.
const FORMATIONS = ['Développement Web et Web Mobile', 'Technicien Informatique', 'Conseiller en Insertion Professionnelle']

const ALL_FORMATEURS = ['Sophie Martin', 'Karim Ali', 'Mariam Abdallah', 'Thomas Leroy']
const ALL_STAGIAIRES = ['Yassine Benali', 'Fatima Ahmed', 'Kamal Abdou', 'Naïma Youssouf', 'Hakim Saïd', 'Amina Said', 'Nadia Combo', 'Saïd Abdillah']

const INITIAL_GROUPES = [
  { id: 1, nom: 'DWWM 2026', formation: 'Développement Web et Web Mobile', formateurs: ['Sophie Martin'], stagiaires: ['Yassine Benali', 'Fatima Ahmed', 'Kamal Abdou', 'Naïma Youssouf'] },
  { id: 2, nom: 'TIP 2026', formation: 'Technicien Informatique', formateurs: ['Karim Ali'], stagiaires: ['Hakim Saïd', 'Amina Said'] },
  { id: 3, nom: 'CIP 2026', formation: 'Conseiller en Insertion Professionnelle', formateurs: ['Mariam Abdallah'], stagiaires: ['Nadia Combo'] },
]

let nextId = 100

export default function Groupes() {
  const [groupes, setGroupes] = useState(INITIAL_GROUPES)
  const [selectedId, setSelectedId] = useState(INITIAL_GROUPES[0].id)
  const [createOpen, setCreateOpen] = useState(false)
  const [createForm, setCreateForm] = useState({ nom: '', formation: FORMATIONS[0] })
  const [pickFormateur, setPickFormateur] = useState('')
  const [pickStagiaire, setPickStagiaire] = useState('')
  const [toDelete, setToDelete] = useState(false)

  const groupe = groupes.find((g) => g.id === selectedId)

  const openCreate = () => {
    setCreateForm({ nom: '', formation: FORMATIONS[0] })
    setCreateOpen(true)
  }

  const submitCreate = () => {
    const id = nextId++
    setGroupes((prev) => [...prev, { id, nom: createForm.nom, formation: createForm.formation, formateurs: [], stagiaires: [] }])
    setSelectedId(id)
    setCreateOpen(false)
  }

  const update = (patch) => {
    setGroupes((prev) => prev.map((g) => (g.id === selectedId ? { ...g, ...patch } : g)))
  }

  const affecterFormateur = () => {
    if (!pickFormateur || groupe.formateurs.includes(pickFormateur)) return
    update({ formateurs: [...groupe.formateurs, pickFormateur] })
    setPickFormateur('')
  }

  const retirerFormateur = (nom) => {
    update({ formateurs: groupe.formateurs.filter((f) => f !== nom) })
  }

  const ajouterStagiaire = () => {
    if (!pickStagiaire || groupe.stagiaires.includes(pickStagiaire)) return
    update({ stagiaires: [...groupe.stagiaires, pickStagiaire] })
    setPickStagiaire('')
  }

  const retirerStagiaire = (nom) => {
    update({ stagiaires: groupe.stagiaires.filter((s) => s !== nom) })
  }

  const confirmDeleteGroupe = () => {
    setGroupes((prev) => {
      const next = prev.filter((g) => g.id !== selectedId)
      if (next.length) setSelectedId(next[0].id)
      return next
    })
    setToDelete(false)
  }

  const formateursDispo = ALL_FORMATEURS.filter((f) => !groupe.formateurs.includes(f))
  const stagiairesDispo = ALL_STAGIAIRES.filter((s) => !groupe.stagiaires.includes(s))

  return (
    <div>
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-end', gap: 16, marginBottom: 20 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800 }}>Groupes</h1>
          <p style={{ margin: '6px 0 0', color: colors.textMuted, fontSize: 14 }}>
            Créez les groupes et affectez les stagiaires et les formateurs.
          </p>
        </div>
        <button onClick={openCreate} style={primaryBtnStyle}>+ Créer un groupe</button>
      </div>

      <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start', flexWrap: 'wrap' }}>
        <div style={{ flex: '1 1 220px', maxWidth: 260, display: 'flex', flexDirection: 'column', gap: 10 }}>
          {groupes.map((g) => {
            const active = g.id === selectedId
            return (
              <button
                key={g.id}
                onClick={() => setSelectedId(g.id)}
                style={{
                  textAlign: 'left',
                  background: colors.white,
                  border: `1.5px solid ${active ? colors.primary : colors.border}`,
                  borderRadius: 14,
                  padding: 14,
                  cursor: 'pointer',
                }}
              >
                <div style={{ fontWeight: 800, fontSize: 14.5 }}>{g.nom}</div>
                <div style={{ fontSize: 12.5, color: colors.textMuted, marginTop: 2 }}>{g.formation}</div>
                <div style={{ fontSize: 12, color: colors.textMuted, marginTop: 4 }}>
                  {g.stagiaires.length} stagiaires · {g.formateurs.length} formateur(s)
                </div>
              </button>
            )
          })}
        </div>

        <div style={{ flex: '3 1 480px', minWidth: 300, background: colors.white, border: `1px solid ${colors.border}`, borderRadius: 16, padding: 22 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 20 }}>
            <div>
              <h2 style={{ margin: 0, fontSize: 19, fontWeight: 800 }}>{groupe.nom}</h2>
              <p style={{ margin: '2px 0 0', fontSize: 13, color: colors.textMuted }}>{groupe.formation}</p>
            </div>
            <button onClick={() => setToDelete(true)} style={dangerBtnStyle}>Supprimer le groupe</button>
          </div>

          <h3 style={{ margin: '0 0 10px', fontSize: 14.5, fontWeight: 800 }}>Formateurs affectés</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
            {groupe.formateurs.map((f) => (
              <span key={f} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 10px', borderRadius: 999, background: colors.cardGreenBg, color: colors.success, fontSize: 13, fontWeight: 700 }}>
                {f}
                <button onClick={() => retirerFormateur(f)} aria-label={`Retirer ${f}`} style={{ border: 0, background: 'transparent', cursor: 'pointer', color: colors.success, fontWeight: 800, lineHeight: 1 }}>×</button>
              </span>
            ))}
            {groupe.formateurs.length === 0 && <span style={{ fontSize: 13, color: colors.textMuted }}>Aucun formateur affecté.</span>}
          </div>
          <div style={{ display: 'flex', gap: 10, marginBottom: 22, flexWrap: 'wrap' }}>
            <select value={pickFormateur} onChange={(e) => setPickFormateur(e.target.value)} style={{ ...inputStyle, minWidth: 200, background: colors.white }}>
              <option value="">Choisir un formateur...</option>
              {formateursDispo.map((f) => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
            <SmallButton onClick={affecterFormateur}>Affecter</SmallButton>
          </div>

          <h3 style={{ margin: '0 0 10px', fontSize: 14.5, fontWeight: 800 }}>Stagiaires ({groupe.stagiaires.length})</h3>
          <div style={{ display: 'flex', gap: 10, marginBottom: 14, flexWrap: 'wrap' }}>
            <select value={pickStagiaire} onChange={(e) => setPickStagiaire(e.target.value)} style={{ ...inputStyle, minWidth: 200, background: colors.white }}>
              <option value="">Choisir un stagiaire...</option>
              {stagiairesDispo.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <SmallButton onClick={ajouterStagiaire}>Ajouter au groupe</SmallButton>
          </div>

          <div>
            {groupe.stagiaires.map((s, i) => (
              <div key={s} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderTop: i === 0 ? `1px solid ${colors.divider}` : `1px solid ${colors.divider}` }}>
                <span style={{ fontSize: 14 }}>{s}</span>
                <button onClick={() => retirerStagiaire(s)} style={{ border: 0, background: 'transparent', color: colors.danger, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>Retirer</button>
              </div>
            ))}
            {groupe.stagiaires.length === 0 && (
              <p style={{ margin: '10px 0 0', fontSize: 13, color: colors.textMuted }}>Aucun stagiaire dans ce groupe.</p>
            )}
          </div>
        </div>
      </div>

      {createOpen && (
        <Modal title="Créer un groupe" onClose={() => setCreateOpen(false)} onSubmit={submitCreate} submitLabel="Créer">
          <Field label="Nom du groupe">
            <input type="text" required autoFocus value={createForm.nom} onChange={(e) => setCreateForm({ ...createForm, nom: e.target.value })} style={inputStyle} />
          </Field>
          <Field label="Formation">
            <select value={createForm.formation} onChange={(e) => setCreateForm({ ...createForm, formation: e.target.value })} style={{ ...inputStyle, background: colors.white }}>
              {FORMATIONS.map((f) => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
          </Field>
        </Modal>
      )}

      {toDelete && (
        <ConfirmDialog
          title="Supprimer le groupe"
          text={`« ${groupe.nom} » sera définitivement supprimé. Les comptes affectés ne seront pas supprimés, seulement détachés du groupe.`}
          cta="Supprimer"
          onCancel={() => setToDelete(false)}
          onConfirm={confirmDeleteGroupe}
        />
      )}
    </div>
  )
}

function SmallButton({ onClick, children }) {
  return (
    <button onClick={onClick} style={{ minHeight: 42, padding: '0 14px', borderRadius: 10, fontSize: 13.5, fontWeight: 700, cursor: 'pointer', background: colors.primaryLight, color: colors.primary, border: 0 }}>
      {children}
    </button>
  )
}

const primaryBtnStyle = {
  minHeight: 42,
  padding: '0 16px',
  border: 0,
  borderRadius: 10,
  background: colors.primary,
  color: colors.white,
  fontWeight: 700,
  cursor: 'pointer',
  whiteSpace: 'nowrap',
}

const dangerBtnStyle = {
  minHeight: 36,
  padding: '0 14px',
  border: 0,
  borderRadius: 8,
  background: colors.dangerBg,
  color: colors.danger,
  fontWeight: 700,
  fontSize: 13,
  cursor: 'pointer',
  whiteSpace: 'nowrap',
}
