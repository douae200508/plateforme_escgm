import { useEffect, useState } from 'react'
import api from '../../api/axios'
import Modal, { Field, inputStyle } from '../../components/Modal'
import ConfirmDialog from '../../components/ConfirmDialog'
import { colors } from '../../theme'

export default function Groupes() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [formations, setFormations] = useState([])
  const [formateurs, setFormateurs] = useState([])
  const [stagiaires, setStagiaires] = useState([])
  const [groupes, setGroupes] = useState([])
  const [selectedId, setSelectedId] = useState(null)
  const [groupe, setGroupe] = useState(null)
  const [createOpen, setCreateOpen] = useState(false)
  const [createForm, setCreateForm] = useState({ nom: '', formation_id: '' })
  const [pickFormateur, setPickFormateur] = useState('')
  const [pickStagiaire, setPickStagiaire] = useState('')
  const [toDelete, setToDelete] = useState(false)

  const loadDetail = (id) => {
    api
      .get(`/admin/groupes/${id}`)
      .then(({ data }) => setGroupe(data))
      .catch(() => setError('Impossible de charger ce groupe.'))
  }

  useEffect(() => {
    setLoading(true)
    Promise.all([
      api.get('/admin/formations'),
      api.get('/admin/users', { params: { role: 'formateur' } }),
      api.get('/admin/users', { params: { role: 'stagiaire' } }),
      api.get('/admin/groupes'),
    ])
      .then(([formationsRes, formateursRes, stagiairesRes, groupesRes]) => {
        setFormations(formationsRes.data)
        setFormateurs(formateursRes.data)
        setStagiaires(stagiairesRes.data)
        setGroupes(groupesRes.data)
        if (groupesRes.data.length) {
          setSelectedId(groupesRes.data[0].id)
          loadDetail(groupesRes.data[0].id)
        }
      })
      .catch(() => setError('Impossible de charger les groupes.'))
      .finally(() => setLoading(false))
  }, [])

  const selectGroupe = (id) => {
    setSelectedId(id)
    setGroupe(null)
    loadDetail(id)
  }

  const refreshListEntry = (data) => {
    setGroupes((prev) => prev.map((g) => (g.id === data.id ? { ...g, nom: data.nom, formation: data.formation, stagiaires_count: data.stagiaires.length, formateurs_count: data.formateurs.length } : g)))
  }

  const openCreate = () => {
    setCreateForm({ nom: '', formation_id: formations[0]?.id || '' })
    setCreateOpen(true)
  }

  const submitCreate = async () => {
    try {
      const { data } = await api.post('/admin/groupes', createForm)
      setGroupes((prev) => [...prev, { id: data.id, nom: data.nom, formation: data.formation, formation_id: data.formation_id, stagiaires_count: 0, formateurs_count: 0 }])
      setSelectedId(data.id)
      setGroupe(data)
      setCreateOpen(false)
    } catch {
      setError("La création du groupe a échoué.")
    }
  }

  const affecterFormateur = async () => {
    if (!pickFormateur) return
    try {
      const { data } = await api.post(`/admin/groupes/${selectedId}/formateurs`, { user_id: Number(pickFormateur) })
      setGroupe(data)
      refreshListEntry(data)
      setPickFormateur('')
    } catch {
      setError("L'affectation du formateur a échoué.")
    }
  }

  const retirerFormateur = async (userId) => {
    const { data } = await api.delete(`/admin/groupes/${selectedId}/formateurs/${userId}`)
    setGroupe(data)
    refreshListEntry(data)
  }

  const ajouterStagiaire = async () => {
    if (!pickStagiaire) return
    try {
      const { data } = await api.post(`/admin/groupes/${selectedId}/stagiaires`, { user_id: Number(pickStagiaire) })
      setGroupe(data)
      refreshListEntry(data)
      setPickStagiaire('')
    } catch {
      setError("L'ajout du stagiaire a échoué.")
    }
  }

  const retirerStagiaire = async (userId) => {
    const { data } = await api.delete(`/admin/groupes/${selectedId}/stagiaires/${userId}`)
    setGroupe(data)
    refreshListEntry(data)
  }

  const confirmDeleteGroupe = async () => {
    await api.delete(`/admin/groupes/${selectedId}`)
    const remaining = groupes.filter((g) => g.id !== selectedId)
    setGroupes(remaining)
    setToDelete(false)
    if (remaining.length) {
      setSelectedId(remaining[0].id)
      loadDetail(remaining[0].id)
    } else {
      setSelectedId(null)
      setGroupe(null)
    }
  }

  if (loading) {
    return <p style={{ color: colors.textMuted, fontSize: 14 }}>Chargement…</p>
  }

  const formateursDispo = formateurs.filter((f) => !groupe?.formateurs.some((g) => g.id === f.id))
  const stagiairesDispo = stagiaires.filter((s) => !groupe?.stagiaires.some((g) => g.id === s.id))

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

      {error && <div style={{ margin: '0 0 16px', color: colors.danger, fontSize: 14 }}>{error}</div>}

      {groupes.length === 0 ? (
        <div style={{ background: colors.white, border: `1px solid ${colors.border}`, borderRadius: 16, padding: 32, textAlign: 'center' }}>
          <p style={{ margin: 0, color: colors.textMuted, fontSize: 14 }}>Aucun groupe pour l'instant.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start', flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 220px', maxWidth: 260, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {groupes.map((g) => {
              const active = g.id === selectedId
              return (
                <button
                  key={g.id}
                  onClick={() => selectGroupe(g.id)}
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
                  <div style={{ fontSize: 12.5, color: colors.textMuted, marginTop: 2 }}>{g.formation?.titre}</div>
                  <div style={{ fontSize: 12, color: colors.textMuted, marginTop: 4 }}>
                    {g.stagiaires_count} stagiaires · {g.formateurs_count} formateur(s)
                  </div>
                </button>
              )
            })}
          </div>

          {groupe && (
            <div style={{ flex: '3 1 480px', minWidth: 300, background: colors.white, border: `1px solid ${colors.border}`, borderRadius: 16, padding: 22 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 20 }}>
                <div>
                  <h2 style={{ margin: 0, fontSize: 19, fontWeight: 800 }}>{groupe.nom}</h2>
                  <p style={{ margin: '2px 0 0', fontSize: 13, color: colors.textMuted }}>{groupe.formation?.titre}</p>
                </div>
                <button onClick={() => setToDelete(true)} style={dangerBtnStyle}>Supprimer le groupe</button>
              </div>

              <h3 style={{ margin: '0 0 10px', fontSize: 14.5, fontWeight: 800 }}>Formateurs affectés</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
                {groupe.formateurs.map((f) => (
                  <span key={f.id} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 10px', borderRadius: 999, background: colors.cardGreenBg, color: colors.success, fontSize: 13, fontWeight: 700 }}>
                    {f.prenom} {f.nom}
                    <button onClick={() => retirerFormateur(f.id)} aria-label={`Retirer ${f.prenom} ${f.nom}`} style={{ border: 0, background: 'transparent', cursor: 'pointer', color: colors.success, fontWeight: 800, lineHeight: 1 }}>×</button>
                  </span>
                ))}
                {groupe.formateurs.length === 0 && <span style={{ fontSize: 13, color: colors.textMuted }}>Aucun formateur affecté.</span>}
              </div>
              <div style={{ display: 'flex', gap: 10, marginBottom: 22, flexWrap: 'wrap' }}>
                <select value={pickFormateur} onChange={(e) => setPickFormateur(e.target.value)} style={{ ...inputStyle, minWidth: 200, background: colors.white }}>
                  <option value="">Choisir un formateur...</option>
                  {formateursDispo.map((f) => (
                    <option key={f.id} value={f.id}>{f.prenom} {f.nom}</option>
                  ))}
                </select>
                <SmallButton onClick={affecterFormateur}>Affecter</SmallButton>
              </div>

              <h3 style={{ margin: '0 0 10px', fontSize: 14.5, fontWeight: 800 }}>Stagiaires ({groupe.stagiaires.length})</h3>
              <div style={{ display: 'flex', gap: 10, marginBottom: 14, flexWrap: 'wrap' }}>
                <select value={pickStagiaire} onChange={(e) => setPickStagiaire(e.target.value)} style={{ ...inputStyle, minWidth: 200, background: colors.white }}>
                  <option value="">Choisir un stagiaire...</option>
                  {stagiairesDispo.map((s) => (
                    <option key={s.id} value={s.id}>{s.prenom} {s.nom}</option>
                  ))}
                </select>
                <SmallButton onClick={ajouterStagiaire}>Ajouter au groupe</SmallButton>
              </div>

              <div>
                {groupe.stagiaires.map((s, i) => (
                  <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderTop: i === 0 ? `1px solid ${colors.divider}` : `1px solid ${colors.divider}` }}>
                    <span style={{ fontSize: 14 }}>{s.prenom} {s.nom}</span>
                    <button onClick={() => retirerStagiaire(s.id)} style={{ border: 0, background: 'transparent', color: colors.danger, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>Retirer</button>
                  </div>
                ))}
                {groupe.stagiaires.length === 0 && (
                  <p style={{ margin: '10px 0 0', fontSize: 13, color: colors.textMuted }}>Aucun stagiaire dans ce groupe.</p>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {createOpen && (
        <Modal title="Créer un groupe" onClose={() => setCreateOpen(false)} onSubmit={submitCreate} submitLabel="Créer">
          <Field label="Nom du groupe">
            <input type="text" required autoFocus value={createForm.nom} onChange={(e) => setCreateForm({ ...createForm, nom: e.target.value })} style={inputStyle} />
          </Field>
          <Field label="Formation">
            <select value={createForm.formation_id} onChange={(e) => setCreateForm({ ...createForm, formation_id: Number(e.target.value) })} style={{ ...inputStyle, background: colors.white }}>
              {formations.map((f) => (
                <option key={f.id} value={f.id}>{f.titre}</option>
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
