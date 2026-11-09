import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../api/axios'
import Badge from '../../components/Badge'
import ConfirmDialog from '../../components/ConfirmDialog'
import Modal, { Field, inputStyle } from '../../components/Modal'
import { colors } from '../../theme'

export default function ModulesChapitres() {
  const navigate = useNavigate()
  const [formations, setFormations] = useState([])
  const [formationId, setFormationId] = useState(null)
  const [modules, setModules] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [collapsed, setCollapsed] = useState(new Set())
  const [modal, setModal] = useState(null) // {type, moduleId?, chapitreId?}
  const [formValue, setFormValue] = useState({ titre: '', statut: 'Brouillon' })
  const [toDelete, setToDelete] = useState(null) // {moduleId, chapitreId?}

  useEffect(() => {
    api.get('/admin/formations').then(({ data }) => {
      setFormations(data)
      if (data.length) setFormationId(data[0].id)
    })
  }, [])

  const loadModules = () => {
    if (!formationId) return
    setLoading(true)
    api
      .get('/admin/modules', { params: { formation_id: formationId } })
      .then(({ data }) => setModules(data))
      .catch(() => setError('Impossible de charger les modules.'))
      .finally(() => setLoading(false))
  }

  useEffect(loadModules, [formationId])

  const toggleCollapsed = (moduleId) => {
    setCollapsed((prev) => {
      const next = new Set(prev)
      next.has(moduleId) ? next.delete(moduleId) : next.add(moduleId)
      return next
    })
  }

  const moveModule = async (index, dir) => {
    const j = index + dir
    if (j < 0 || j >= modules.length) return
    const next = [...modules]
    ;[next[index], next[j]] = [next[j], next[index]]
    setModules(next)
    await api.post('/admin/modules/reorder', { ids: next.map((m) => m.id) })
  }

  const moveChapitre = async (moduleId, index, dir) => {
    const mod = modules.find((m) => m.id === moduleId)
    const chapitres = [...mod.chapitres]
    const j = index + dir
    if (j < 0 || j >= chapitres.length) return
    ;[chapitres[index], chapitres[j]] = [chapitres[j], chapitres[index]]
    setModules((prev) => prev.map((m) => (m.id === moduleId ? { ...m, chapitres } : m)))
    await api.post('/admin/chapitres/reorder', { ids: chapitres.map((c) => c.id) })
  }

  const openModal = (type, payload = {}) => {
    if (type === 'rename-module') setFormValue({ titre: payload.titre })
    else setFormValue({ titre: '', statut: 'Brouillon' })
    setModal({ type, ...payload })
  }

  const closeModal = () => setModal(null)

  const submitModal = async () => {
    try {
      if (modal.type === 'add-module') {
        await api.post('/admin/modules', { formation_id: formationId, titre: formValue.titre })
      } else if (modal.type === 'rename-module') {
        await api.put(`/admin/modules/${modal.moduleId}`, { titre: formValue.titre })
      } else if (modal.type === 'add-chapitre') {
        await api.post('/admin/chapitres', { module_id: modal.moduleId, titre: formValue.titre, statut: formValue.statut })
      }
      closeModal()
      loadModules()
    } catch {
      setError("L'enregistrement a échoué. Vérifiez les champs.")
    }
  }

  const confirmDelete = async () => {
    if (toDelete.chapitreId) {
      await api.delete(`/admin/chapitres/${toDelete.chapitreId}`)
    } else {
      await api.delete(`/admin/modules/${toDelete.moduleId}`)
    }
    setToDelete(null)
    loadModules()
  }

  const formationTitre = formations.find((f) => f.id === formationId)?.titre

  return (
    <div>
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-end', gap: 16, marginBottom: 20 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800 }}>Modules et chapitres</h1>
          <p style={{ margin: '6px 0 0', color: colors.textMuted, fontSize: 14 }}>
            Organisez les modules et l'ordre des chapitres de chaque formation.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12 }}>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12.5, fontWeight: 700, color: colors.textMuted }}>
            Formation
            <select
              value={formationId ?? ''}
              onChange={(e) => setFormationId(Number(e.target.value))}
              style={{ ...inputStyle, minWidth: 260, background: colors.white }}
            >
              {formations.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.titre}
                </option>
              ))}
            </select>
          </label>
          <button onClick={() => openModal('add-module')} disabled={!formationId} style={primaryBtnStyle}>
            + Ajouter un module
          </button>
        </div>
      </div>

      {error && <div style={{ marginBottom: 12, color: colors.danger, fontSize: 14 }}>{error}</div>}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {modules.map((m, mIndex) => {
          const isCollapsed = collapsed.has(m.id)
          return (
            <div key={m.id} style={{ background: colors.white, border: `1px solid ${colors.border}`, borderRadius: 16 }}>
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 10,
                  padding: '16px 18px',
                  borderBottom: isCollapsed ? 'none' : `1px solid ${colors.divider}`,
                }}
              >
                <button
                  onClick={() => toggleCollapsed(m.id)}
                  style={{ display: 'flex', alignItems: 'center', gap: 10, border: 0, background: 'transparent', cursor: 'pointer', padding: 0 }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={colors.textMuted} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: isCollapsed ? 'rotate(-90deg)' : 'none' }}>
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                  <span style={{ fontSize: 15, fontWeight: 800, color: colors.text }}>
                    Module {mIndex + 1} : {m.titre}
                  </span>
                  <span style={{ fontSize: 13, color: colors.textMuted, fontWeight: 500 }}>{m.chapitres.length} chapitres</span>
                </button>

                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <SquareButton onClick={() => moveModule(mIndex, -1)} label="Monter le module" icon="M12 19V5M5 12l7-7 7 7" />
                  <SquareButton onClick={() => moveModule(mIndex, 1)} label="Descendre le module" icon="M12 5v14M19 12l-7 7-7-7" />
                  <SmallButton onClick={() => openModal('rename-module', { moduleId: m.id, titre: m.titre })}>Renommer</SmallButton>
                  <SmallButton variant="primary" onClick={() => openModal('add-chapitre', { moduleId: m.id })}>+ Chapitre</SmallButton>
                  <SmallButton variant="danger" onClick={() => setToDelete({ moduleId: m.id })}>Supprimer</SmallButton>
                </div>
              </div>

              {!isCollapsed && (
                <div>
                  {m.chapitres.map((c, cIndex) => (
                    <div
                      key={c.id}
                      style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 10,
                        padding: '14px 18px 14px 46px',
                        borderBottom: cIndex === m.chapitres.length - 1 ? 'none' : `1px solid ${colors.divider}`,
                      }}
                    >
                      <span style={{ fontSize: 14, fontWeight: 600, color: colors.primary }}>
                        {cIndex + 1}. {c.titre}
                      </span>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                        <Badge status={c.statut} />
                        <SquareButton onClick={() => moveChapitre(m.id, cIndex, -1)} label="Monter le chapitre" icon="M12 19V5M5 12l7-7 7 7" />
                        <SquareButton onClick={() => moveChapitre(m.id, cIndex, 1)} label="Descendre le chapitre" icon="M12 5v14M19 12l-7 7-7-7" />
                        <SmallButton
                          variant="primary"
                          onClick={() =>
                            navigate(`/admin/modules/editeur/${c.id}`, {
                              state: {
                                moduleTitre: m.titre,
                                moduleIndex: mIndex + 1,
                                formationTitre,
                              },
                            })
                          }
                        >
                          Modifier le contenu
                        </SmallButton>
                        <SmallButton variant="danger" onClick={() => setToDelete({ moduleId: m.id, chapitreId: c.id })}>
                          Supprimer
                        </SmallButton>
                      </div>
                    </div>
                  ))}
                  {m.chapitres.length === 0 && (
                    <p style={{ margin: 0, padding: '14px 18px 18px 46px', fontSize: 13.5, color: colors.textMuted }}>
                      Aucun chapitre pour ce module.
                    </p>
                  )}
                </div>
              )}
            </div>
          )
        })}
        {!loading && modules.length === 0 && (
          <p style={{ fontSize: 14, color: colors.textMuted }}>Aucun module pour cette formation.</p>
        )}
      </div>

      {modal && (
        <Modal
          title={
            {
              'add-module': 'Nouveau module',
              'rename-module': 'Renommer le module',
              'add-chapitre': 'Nouveau chapitre',
            }[modal.type]
          }
          onClose={closeModal}
          onSubmit={submitModal}
          submitLabel={modal.type.startsWith('add') ? 'Créer' : 'Enregistrer'}
        >
          <Field label="Titre">
            <input
              type="text"
              required
              autoFocus
              value={formValue.titre}
              onChange={(e) => setFormValue({ ...formValue, titre: e.target.value })}
              style={inputStyle}
            />
          </Field>
          {modal.type === 'add-chapitre' && (
            <Field label="Statut">
              <select
                value={formValue.statut}
                onChange={(e) => setFormValue({ ...formValue, statut: e.target.value })}
                style={{ ...inputStyle, background: colors.white }}
              >
                <option value="Brouillon">Brouillon</option>
                <option value="Publié">Publié</option>
              </select>
            </Field>
          )}
        </Modal>
      )}

      {toDelete && (
        <ConfirmDialog
          title={toDelete.chapitreId ? 'Supprimer le chapitre' : 'Supprimer le module'}
          text={
            toDelete.chapitreId
              ? 'Cette action est définitive. Continuer ?'
              : 'Cette action supprimera aussi tous ses chapitres. Continuer ?'
          }
          cta="Supprimer"
          onCancel={() => setToDelete(null)}
          onConfirm={confirmDelete}
        />
      )}
    </div>
  )
}

function SquareButton({ onClick, label, icon }) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      style={{
        width: 34,
        height: 34,
        borderRadius: 8,
        border: `1px solid ${colors.border}`,
        background: colors.white,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={colors.textMuted} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d={icon} />
      </svg>
    </button>
  )
}

function SmallButton({ onClick, variant = 'default', children }) {
  const styles = {
    default: { background: colors.white, color: colors.text, border: `1px solid ${colors.border}` },
    primary: { background: colors.primaryLight, color: colors.primary, border: 0 },
    danger: { background: colors.dangerBg, color: colors.danger, border: 0 },
  }[variant]
  return (
    <button
      onClick={onClick}
      style={{
        minHeight: 34,
        padding: '0 12px',
        borderRadius: 8,
        fontSize: 13,
        fontWeight: 700,
        cursor: 'pointer',
        whiteSpace: 'nowrap',
        ...styles,
      }}
    >
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
