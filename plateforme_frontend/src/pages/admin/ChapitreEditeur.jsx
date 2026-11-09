import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import api from '../../api/axios'
import Badge from '../../components/Badge'
import Modal, { Field, inputStyle } from '../../components/Modal'
import ConfirmDialog from '../../components/ConfirmDialog'
import { colors } from '../../theme'

const STORAGE_BASE = api.defaults.baseURL.replace(/\/api\/?$/, '/storage')

const TYPE_LABELS = { cours: 'Cours', document: 'Document', tp: 'TP', evaluation: 'Évaluation' }
const TYPE_META = {
  cours: { bg: colors.primaryLight, color: colors.primary },
  document: { bg: '#FEE2E2', color: '#B91C1C' },
  tp: { bg: colors.cardOrangeBg, color: colors.brandAmber },
  evaluation: { bg: colors.cardGreenBg, color: colors.success },
}

const EMPTY_FORM = { titre: '', type: 'cours', description: '', methode: 'fichier', fichier: null, url: '' }

export default function ChapitreEditeur() {
  const { chapitreId } = useParams()
  const { state } = useLocation()
  const navigate = useNavigate()

  const breadcrumb = state
    ? `${state.formationTitre} · Module ${state.moduleIndex} : ${state.moduleTitre}`
    : 'Formation · Module'

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [titre, setTitre] = useState('')
  const [statut, setStatut] = useState('Brouillon')
  const [ressources, setRessources] = useState([])
  const [saved, setSaved] = useState('')
  const [modal, setModal] = useState(null) // { mode: 'create' | 'edit', id? }
  const [form, setForm] = useState(EMPTY_FORM)
  const [toDelete, setToDelete] = useState(null)
  const fileInputRef = useRef(null)

  const load = () => {
    setLoading(true)
    api
      .get(`/admin/chapitres/${chapitreId}`)
      .then(({ data }) => {
        setTitre(data.titre)
        setStatut(data.statut)
        setRessources(data.ressources || [])
      })
      .catch(() => setError('Impossible de charger ce chapitre.'))
      .finally(() => setLoading(false))
  }

  useEffect(load, [chapitreId])

  const save = async (nextStatut) => {
    try {
      await api.put(`/admin/chapitres/${chapitreId}`, { titre, statut: nextStatut })
      setStatut(nextStatut)
      setSaved(nextStatut === 'Publié' ? 'Publié.' : 'Enregistré en brouillon.')
      setTimeout(() => setSaved(''), 2500)
    } catch {
      setError("L'enregistrement a échoué.")
    }
  }

  const openCreate = () => {
    setForm(EMPTY_FORM)
    setModal({ mode: 'create' })
  }

  const openEdit = (r) => {
    setForm({ titre: r.titre, type: r.type, description: r.description || '', methode: 'fichier', fichier: null, url: r.url || '' })
    setModal({ mode: 'edit', id: r.id })
  }

  const closeModal = () => setModal(null)

  const submitModal = async () => {
    try {
      if (modal.mode === 'create') {
        const body = new FormData()
        body.append('titre', form.titre)
        body.append('type', form.type)
        body.append('description', form.description)
        if (form.methode === 'fichier' && form.fichier) body.append('fichier', form.fichier)
        if (form.methode === 'url' && form.url) body.append('url', form.url)
        const { data } = await api.post(`/admin/chapitres/${chapitreId}/ressources`, body, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
        setRessources((prev) => [...prev, data])
      } else {
        const { data } = await api.put(`/admin/chapitres/${chapitreId}/ressources/${modal.id}`, {
          titre: form.titre,
          description: form.description,
          url: form.url,
        })
        setRessources((prev) => prev.map((r) => (r.id === data.id ? data : r)))
      }
      closeModal()
    } catch {
      setError("L'enregistrement de la ressource a échoué.")
    }
  }

  const confirmDelete = async () => {
    await api.delete(`/admin/chapitres/${chapitreId}/ressources/${toDelete.id}`)
    setRessources((prev) => prev.filter((r) => r.id !== toDelete.id))
    setToDelete(null)
  }

  if (loading) {
    return <p style={{ color: colors.textMuted, fontSize: 14 }}>Chargement…</p>
  }

  return (
    <div>
      <Link to="/admin/modules" style={{ fontSize: 13, color: colors.primary, fontWeight: 600, textDecoration: 'none' }}>
        ← Retour aux modules
      </Link>

      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, marginTop: 10, marginBottom: 20 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800 }}>Éditeur pédagogique</h1>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: colors.primary }}>{breadcrumb}</p>
        </div>

        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          {saved && <span style={{ fontSize: 13, color: colors.success, fontWeight: 600 }}>{saved}</span>}
          <button type="button" onClick={() => save('Brouillon')} style={outlineBtnStyle(colors.primary, colors.primary)}>
            Enregistrer en brouillon
          </button>
          <button type="button" onClick={() => save('Publié')} style={fillBtnStyle}>
            Publier
          </button>
        </div>
      </div>

      {error && <div style={{ marginBottom: 12, color: colors.danger, fontSize: 14 }}>{error}</div>}

      <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start', flexWrap: 'wrap' }}>
        <div style={{ flex: '2 1 360px', display: 'flex', flexDirection: 'column', gap: 18 }}>
          <Card>
            <label style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13, fontWeight: 700 }}>
              Titre du chapitre
              <input type="text" value={titre} onChange={(e) => setTitre(e.target.value)} style={inputStyle} />
            </label>
          </Card>

          <Card>
            <h2 style={{ margin: 0, fontSize: 15, fontWeight: 800 }}>Statut</h2>
            <div style={{ marginTop: 10 }}>
              <Badge status={statut} />
            </div>
            <p style={{ margin: '10px 0 0', fontSize: 12.5, color: colors.textMuted, lineHeight: 1.5 }}>
              Un chapitre en brouillon n'est pas visible par les stagiaires.
            </p>
          </Card>
        </div>

        <div style={{ flex: '3 1 480px' }}>
          <Card>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ margin: 0, fontSize: 15, fontWeight: 800 }}>Ressources du chapitre</h2>
              <button type="button" onClick={openCreate} style={{ border: 0, background: 'transparent', color: colors.primary, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
                + Ajouter une ressource
              </button>
            </div>

            {ressources.length === 0 ? (
              <p style={{ margin: '10px 0 0', fontSize: 13, color: colors.textMuted }}>
                Aucune ressource rattachée pour l'instant (cours, document, TP, évaluation…).
              </p>
            ) : (
              <ul style={{ margin: '12px 0 0', padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
                {ressources.map((r) => {
                  const meta = TYPE_META[r.type] || TYPE_META.document
                  return (
                    <li key={r.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, border: `1px solid ${colors.border}`, borderRadius: 12, padding: 12 }}>
                      <span style={{ padding: '2px 8px', borderRadius: 6, background: meta.bg, color: meta.color, fontSize: 11, fontWeight: 800, flexShrink: 0 }}>
                        {TYPE_LABELS[r.type] || r.type}
                      </span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 700, fontSize: 14 }}>{r.titre}</div>
                        {r.description && (
                          <p style={{ margin: '4px 0 0', fontSize: 12.5, color: colors.textMuted, lineHeight: 1.4 }}>{r.description}</p>
                        )}
                        {r.chemin && (
                          <button type="button" onClick={() => window.open(`${STORAGE_BASE}/${r.chemin}`, '_blank')} style={linkBtnStyle}>
                            Voir le fichier
                          </button>
                        )}
                        {r.url && (
                          <a href={r.url} target="_blank" rel="noreferrer" style={{ ...linkBtnStyle, display: 'inline-block' }}>
                            Ouvrir le lien
                          </a>
                        )}
                      </div>
                      <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                        <button type="button" onClick={() => openEdit(r)} style={smallOutlineBtnStyle}>Modifier</button>
                        <button
                          type="button"
                          onClick={() => setToDelete(r)}
                          aria-label={`Retirer ${r.titre}`}
                          style={{ border: 0, background: 'transparent', cursor: 'pointer', color: colors.danger, fontWeight: 800 }}
                        >
                          ×
                        </button>
                      </div>
                    </li>
                  )
                })}
              </ul>
            )}
          </Card>
        </div>
      </div>

      {modal && (
        <Modal
          title={modal.mode === 'create' ? 'Ajouter une ressource' : 'Modifier la ressource'}
          onClose={closeModal}
          onSubmit={submitModal}
          submitLabel={modal.mode === 'create' ? 'Ajouter' : 'Enregistrer'}
        >
          <Field label="Nom">
            <input type="text" required autoFocus value={form.titre} onChange={(e) => setForm({ ...form, titre: e.target.value })} style={inputStyle} />
          </Field>

          {modal.mode === 'create' && (
            <Field label="Type de ressource">
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} style={{ ...inputStyle, background: colors.white }}>
                {Object.entries(TYPE_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </Field>
          )}

          <Field label="Description">
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
              style={{ ...inputStyle, minHeight: 'unset', padding: 12, resize: 'vertical', lineHeight: 1.5 }}
            />
          </Field>

          {modal.mode === 'create' ? (
            <Field label="Contenu">
              <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                <MethodeButton active={form.methode === 'fichier'} onClick={() => setForm({ ...form, methode: 'fichier' })}>Fichier</MethodeButton>
                <MethodeButton active={form.methode === 'url'} onClick={() => setForm({ ...form, methode: 'url' })}>Lien URL</MethodeButton>
              </div>
              {form.methode === 'fichier' ? (
                <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                  <input
                    ref={fileInputRef}
                    type="file"
                    style={{ display: 'none' }}
                    onChange={(e) => setForm({ ...form, fichier: e.target.files?.[0] || null })}
                  />
                  <button type="button" onClick={() => fileInputRef.current?.click()} style={smallOutlineBtnStyle}>Sélectionner un fichier</button>
                  <span style={{ fontSize: 13, color: colors.textMuted }}>{form.fichier ? form.fichier.name : "Aucun fichier sélectionné"}</span>
                </div>
              ) : (
                <input type="text" placeholder="https://..." value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} style={inputStyle} />
              )}
            </Field>
          ) : (
            <Field label="URL (optionnel)">
              <input type="text" placeholder="https://..." value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} style={inputStyle} />
            </Field>
          )}
        </Modal>
      )}

      {toDelete && (
        <ConfirmDialog
          title="Supprimer la ressource"
          text={`« ${toDelete.titre} » sera définitivement supprimée. Continuer ?`}
          cta="Supprimer"
          onCancel={() => setToDelete(null)}
          onConfirm={confirmDelete}
        />
      )}
    </div>
  )
}

function Card({ children }) {
  return (
    <div style={{ background: colors.white, border: `1px solid ${colors.border}`, borderRadius: 16, padding: 18 }}>
      {children}
    </div>
  )
}

function MethodeButton({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        minHeight: 34,
        padding: '0 12px',
        borderRadius: 8,
        fontSize: 12.5,
        fontWeight: 700,
        cursor: 'pointer',
        border: `1px solid ${active ? colors.primary : colors.border}`,
        background: active ? colors.primaryLight : colors.white,
        color: active ? colors.primary : colors.text,
      }}
    >
      {children}
    </button>
  )
}

const linkBtnStyle = {
  marginTop: 6,
  border: 0,
  background: 'transparent',
  color: colors.primary,
  fontSize: 12.5,
  fontWeight: 700,
  cursor: 'pointer',
  padding: 0,
  textDecoration: 'none',
}

const smallOutlineBtnStyle = {
  minHeight: 34,
  padding: '0 12px',
  borderRadius: 8,
  fontSize: 13,
  fontWeight: 700,
  cursor: 'pointer',
  whiteSpace: 'nowrap',
  background: colors.white,
  color: colors.text,
  border: `1px solid ${colors.border}`,
}

const fillBtnStyle = {
  minHeight: 42,
  padding: '0 18px',
  border: 0,
  borderRadius: 10,
  background: colors.primary,
  color: colors.white,
  fontWeight: 700,
  cursor: 'pointer',
  whiteSpace: 'nowrap',
}

function outlineBtnStyle(borderColor, textColor) {
  return {
    minHeight: 42,
    padding: '0 16px',
    border: `1.5px solid ${borderColor}`,
    borderRadius: 10,
    background: colors.white,
    color: textColor,
    fontWeight: 700,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  }
}
