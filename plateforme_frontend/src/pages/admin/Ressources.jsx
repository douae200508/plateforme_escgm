import { useEffect, useRef, useState } from 'react'
import api from '../../api/axios'
import Modal, { Field, inputStyle } from '../../components/Modal'
import ConfirmDialog from '../../components/ConfirmDialog'
import { colors } from '../../theme'

// Les fichiers sont servis depuis le disque "public" de Laravel (lié par
// `php artisan storage:link`), pas depuis l'API elle-même.
const STORAGE_BASE = api.defaults.baseURL.replace(/\/api\/?$/, '/storage')

const TYPE_META = {
  PDF: { bg: '#FEE2E2', color: '#B91C1C', tabLabel: 'PDF' },
  VID: { bg: '#EDE9FE', color: '#7C3AED', tabLabel: 'Vidéos' },
  PPT: { bg: colors.cardOrangeBg, color: colors.brandAmber, tabLabel: 'Présentations' },
  IMG: { bg: colors.cardGreenBg, color: colors.success, tabLabel: 'Images' },
}
const FALLBACK_META = { bg: '#EEF2F7', color: colors.textMuted }
const TYPE_LABELS = { cours: 'Cours', document: 'Document', tp: 'TP', evaluation: 'Évaluation' }

const TABS = [
  { id: 'all', label: 'Toutes' },
  { id: 'PDF', label: 'PDF' },
  { id: 'VID', label: 'Vidéos' },
  { id: 'IMG', label: 'Images' },
  { id: 'PPT', label: 'Présentations' },
]

const EMPTY_FORM = { titre: '', format: 'PDF', chapitre_id: '', telechargement: true, fichier: null }

function formatTaille(bytes) {
  if (!bytes) return '—'
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} Ko`
  return `${(bytes / (1024 * 1024)).toFixed(1).replace('.', ',')} Mo`
}

export default function Ressources() {
  const [formations, setFormations] = useState([])
  const [formationId, setFormationId] = useState(null)
  const [chapitres, setChapitres] = useState([])
  const [resources, setResources] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [tab, setTab] = useState('all')
  const [chapitreFilter, setChapitreFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [preview, setPreview] = useState(null)
  const [modal, setModal] = useState(null) // { mode: 'create' | 'edit', id? }
  const [form, setForm] = useState(EMPTY_FORM)
  const [toDelete, setToDelete] = useState(null)
  const fileInputRef = useRef(null)

  useEffect(() => {
    api.get('/admin/formations').then(({ data }) => {
      setFormations(data)
      if (data.length) setFormationId(data[0].id)
    })
  }, [])

  useEffect(() => {
    if (!formationId) return
    setChapitreFilter('all')
    api.get('/admin/modules', { params: { formation_id: formationId } }).then(({ data }) => {
      setChapitres(data.flatMap((m) => m.chapitres))
    })
    loadResources()
  }, [formationId])

  const loadResources = () => {
    if (!formationId) return
    setLoading(true)
    api
      .get('/admin/ressources', { params: { formation_id: formationId } })
      .then(({ data }) => setResources(data))
      .catch(() => setError('Impossible de charger les ressources.'))
      .finally(() => setLoading(false))
  }

  const visible = resources.filter((r) => {
    const matchesTab = tab === 'all' || r.format === tab
    const matchesChapitre = chapitreFilter === 'all' || r.chapitre_id === chapitreFilter
    const q = search.toLowerCase()
    const matchesSearch = r.titre.toLowerCase().includes(q) || (r.chapitre?.titre || '').toLowerCase().includes(q)
    return matchesTab && matchesChapitre && matchesSearch
  })

  const toggleTelechargement = async (r) => {
    await api.put(`/admin/ressources/${r.id}`, { telechargement: !r.telechargement })
    loadResources()
  }

  const openCreate = () => {
    setForm({ ...EMPTY_FORM, chapitre_id: chapitres[0]?.id || '' })
    setModal({ mode: 'create' })
  }

  const openEdit = (r) => {
    setForm({ titre: r.titre, format: r.format, type: r.type, chapitre_id: r.chapitre_id, telechargement: r.telechargement, fichier: null })
    setModal({ mode: 'edit', id: r.id })
  }

  const closeModal = () => setModal(null)

  const submitModal = async () => {
    try {
      if (modal.mode === 'create') {
        if (!form.fichier) {
          setError('Choisissez un fichier à importer.')
          return
        }
        const body = new FormData()
        body.append('titre', form.titre)
        body.append('format', form.format)
        body.append('chapitre_id', form.chapitre_id)
        body.append('telechargement', form.telechargement ? '1' : '0')
        body.append('fichier', form.fichier)
        await api.post('/admin/ressources', body, { headers: { 'Content-Type': 'multipart/form-data' } })
      } else {
        await api.put(`/admin/ressources/${modal.id}`, {
          titre: form.titre,
          format: form.format,
          chapitre_id: form.chapitre_id,
          telechargement: form.telechargement,
        })
      }
      closeModal()
      loadResources()
    } catch {
      setError("L'enregistrement a échoué. Vérifiez les champs.")
    }
  }

  const confirmDelete = async () => {
    await api.delete(`/admin/ressources/${toDelete.id}`)
    setToDelete(null)
    loadResources()
  }

  const formationTitre = formations.find((f) => f.id === formationId)?.titre

  return (
    <div>
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-end', gap: 16, marginBottom: 20 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800 }}>Bibliothèque des ressources</h1>
          <p style={{ margin: '6px 0 0', color: colors.textMuted, fontSize: 14 }}>
            PDF, vidéos, images et présentations rattachés aux chapitres.
          </p>
        </div>
        <button onClick={openCreate} disabled={!chapitres.length} style={primaryBtnStyle}>
          + Importer une ressource
        </button>
      </div>

      {error && <div style={{ marginBottom: 12, color: colors.danger, fontSize: 14 }}>{error}</div>}

      <div style={{ background: colors.white, border: `1px solid ${colors.border}`, borderRadius: 16, padding: '16px 20px', marginBottom: 16, display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-end', gap: 12 }}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12.5, fontWeight: 700, color: colors.textMuted }}>
            Formation
            <select
              value={formationId ?? ''}
              onChange={(e) => setFormationId(Number(e.target.value))}
              style={{ ...inputStyle, minWidth: 240, background: colors.white }}
            >
              {formations.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.titre}
                </option>
              ))}
            </select>
          </label>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12.5, fontWeight: 700, color: colors.textMuted }}>
            Chapitre
            <select
              value={chapitreFilter}
              onChange={(e) => setChapitreFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))}
              style={{ ...inputStyle, minWidth: 220, background: colors.white }}
            >
              <option value="all">Tous les chapitres</option>
              {chapitres.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.titre}
                </option>
              ))}
            </select>
          </label>
        </div>
        <span style={{ fontSize: 13, color: colors.textMuted }}>
          {resources.length} ressource(s) · {chapitres.length} chapitre(s)
        </span>
      </div>

      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 12,
          borderBottom: `1px solid ${colors.border}`,
          marginBottom: 16,
        }}
      >
        <div role="tablist" style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
          {TABS.map((t) => {
            const count = t.id === 'all' ? resources.length : resources.filter((r) => r.format === t.id).length
            return (
              <button
                key={t.id}
                role="tab"
                onClick={() => setTab(t.id)}
                style={{
                  minHeight: 44,
                  padding: '0 12px',
                  border: 0,
                  borderBottom: `2px solid ${tab === t.id ? colors.primary : 'transparent'}`,
                  background: 'transparent',
                  cursor: 'pointer',
                  fontSize: 13,
                  fontWeight: 600,
                  color: tab === t.id ? colors.primary : colors.textMuted,
                }}
              >
                {t.label} ({count})
              </button>
            )
          })}
        </div>
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher par titre ou chapitre"
          aria-label="Rechercher par titre ou chapitre"
          style={{ minHeight: 38, minWidth: 240, border: `1px solid ${colors.border}`, borderRadius: 10, padding: '0 12px', fontSize: 13, marginBottom: 6, fontFamily: 'inherit' }}
        />
      </div>

      <div style={{ background: colors.white, border: `1px solid ${colors.border}`, borderRadius: 16, overflowX: 'auto' }}>
        <table style={{ width: '100%', minWidth: 900, borderCollapse: 'collapse', fontSize: 14 }}>
          <thead>
            <tr style={{ textAlign: 'left', background: colors.tableHead, color: colors.textMuted, fontSize: 11.5, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              <th style={{ padding: '12px 16px', fontWeight: 600 }}>Ressource</th>
              <th style={{ padding: '12px 16px', fontWeight: 600 }}>Chapitre</th>
              <th style={{ padding: '12px 16px', fontWeight: 600 }}>Téléchargement</th>
              <th style={{ padding: '12px 16px', fontWeight: 600 }}>Ajoutée le</th>
              <th style={{ padding: '12px 16px' }}></th>
            </tr>
          </thead>
          <tbody>
            {visible.map((r) => {
              const meta = TYPE_META[r.format] || FALLBACK_META
              return (
                <tr key={r.id} style={{ borderTop: `1px solid ${colors.divider}` }}>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <span style={{ width: 38, height: 38, borderRadius: 10, background: meta.bg, color: meta.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 800, flexShrink: 0, textAlign: 'center' }}>
                        {r.format || TYPE_LABELS[r.type] || r.type}
                      </span>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 14 }}>{r.titre}</div>
                        <div style={{ fontSize: 12, color: colors.textMuted }}>{formatTaille(r.taille)}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px', color: colors.primary, fontWeight: 600 }}>{r.chapitre?.titre || '—'}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Toggle checked={r.telechargement} onChange={() => toggleTelechargement(r)} />
                      <span style={{ fontSize: 12.5, color: colors.textMuted }}>{r.telechargement ? 'Autorisé' : 'Lecture seule'}</span>
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px', color: colors.textMuted, fontSize: 13 }}>
                    {new Date(r.created_at).toLocaleDateString('fr-FR')}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end', flexWrap: 'nowrap' }}>
                      {r.chemin && <SmallButton variant="primary" onClick={() => setPreview(r)}>Voir</SmallButton>}
                      {r.chemin && <SquareButton label="Télécharger" onClick={() => window.open(`${STORAGE_BASE}/${r.chemin}`, '_blank')} icon="M12 3v12m0 0l-4-4m4 4l4-4M4 17v2a2 2 0 002 2h12a2 2 0 002-2v-2" />}
                      {!r.chemin && r.url && <SmallButton variant="primary" onClick={() => window.open(r.url, '_blank')}>Ouvrir le lien</SmallButton>}
                      <SmallButton onClick={() => openEdit(r)}>Modifier</SmallButton>
                      <SmallButton variant="danger" onClick={() => setToDelete(r)}>Supprimer</SmallButton>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {!loading && visible.length === 0 && (
          <div style={{ padding: 20, color: colors.textMuted, fontSize: 14 }}>Aucune ressource dans cette catégorie.</div>
        )}
      </div>

      {preview && (
        <PreviewModal resource={preview} formationTitre={formationTitre} onClose={() => setPreview(null)} />
      )}

      {modal && (
        <Modal
          title={modal.mode === 'create' ? 'Importer une ressource' : 'Modifier la ressource'}
          onClose={closeModal}
          onSubmit={submitModal}
          submitLabel={modal.mode === 'create' ? 'Importer' : 'Enregistrer'}
        >
          <Field label="Titre de la ressource">
            <input type="text" required autoFocus value={form.titre} onChange={(e) => setForm({ ...form, titre: e.target.value })} style={inputStyle} />
          </Field>
          <Field label="Type de ressource">
            <select value={form.format || ''} onChange={(e) => setForm({ ...form, format: e.target.value })} style={{ ...inputStyle, background: colors.white }}>
              {!form.format && <option value="" disabled>— Non reconnu{modal.mode === 'edit' ? ` (${TYPE_LABELS[form.type] || form.type})` : ''} —</option>}
              <option value="PDF">PDF</option>
              <option value="VID">Vidéo</option>
              <option value="IMG">Image</option>
              <option value="PPT">Présentation</option>
            </select>
          </Field>
          <Field label="Chapitre associé">
            <select value={form.chapitre_id} onChange={(e) => setForm({ ...form, chapitre_id: Number(e.target.value) })} style={{ ...inputStyle, background: colors.white }}>
              {chapitres.map((c) => (
                <option key={c.id} value={c.id}>{c.titre}</option>
              ))}
            </select>
          </Field>
          {modal.mode === 'create' && (
            <Field label="Fichier">
              <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                <input
                  ref={fileInputRef}
                  type="file"
                  style={{ display: 'none' }}
                  onChange={(e) => setForm({ ...form, fichier: e.target.files?.[0] || null })}
                />
                <button type="button" onClick={() => fileInputRef.current?.click()} style={chooseFileBtnStyle}>Choisir un fichier</button>
                <span style={{ fontSize: 13, color: colors.textMuted }}>{form.fichier ? form.fichier.name : "Aucun fichier n'a été sélectionné"}</span>
              </div>
            </Field>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Toggle checked={form.telechargement} onChange={(v) => setForm({ ...form, telechargement: v })} />
            <span style={{ fontSize: 13.5, fontWeight: 600 }}>Autoriser le téléchargement par les stagiaires</span>
          </div>
          <p style={{ margin: 0, fontSize: 12.5, color: colors.textMuted }}>Formation : {formationTitre}</p>
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

function PreviewModal({ resource, formationTitre, onClose }) {
  const meta = TYPE_META[resource.format] || FALLBACK_META
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 60, background: 'rgba(15,30,61,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }} onClick={onClose}>
      <div role="dialog" aria-label="Aperçu de la ressource" onClick={(e) => e.stopPropagation()} style={{ width: '100%', maxWidth: 560, maxHeight: '90vh', overflowY: 'auto', background: colors.white, borderRadius: 18, padding: 22, boxSizing: 'border-box' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
          <div style={{ display: 'flex', gap: 12 }}>
            <span style={{ width: 36, height: 36, borderRadius: 9, background: meta.bg, color: meta.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9.5, fontWeight: 800, flexShrink: 0, textAlign: 'center' }}>
              {resource.format || TYPE_LABELS[resource.type] || resource.type}
            </span>
            <div>
              <div style={{ fontWeight: 800, fontSize: 16 }}>{resource.titre}</div>
              <div style={{ fontSize: 12.5, color: colors.textMuted, marginTop: 2 }}>
                {formationTitre} · Chapitre : {resource.chapitre?.titre || '—'}
              </div>
              <div style={{ fontSize: 12, color: colors.textMuted }}>
                {formatTaille(resource.taille)} · ajoutée le {new Date(resource.created_at).toLocaleDateString('fr-FR')}
              </div>
            </div>
          </div>
          <button onClick={onClose} aria-label="Fermer" style={{ width: 32, height: 32, border: 0, borderRadius: 8, background: '#F1F5F9', cursor: 'pointer', fontSize: 16, flexShrink: 0 }}>
            ×
          </button>
        </div>

        <div style={{ marginTop: 18, background: colors.bg, border: `1px solid ${colors.border}`, borderRadius: 12, padding: 12 }}>
          <RessourcePreview resource={resource} />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 18, flexWrap: 'wrap', gap: 10 }}>
          <span style={{ fontSize: 13, color: colors.textSoft }}>
            Pour les stagiaires : <strong>{resource.telechargement ? 'téléchargement autorisé' : 'lecture seule'}</strong>
          </span>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={onClose} style={{ minHeight: 42, padding: '0 16px', border: `1px solid ${colors.border}`, borderRadius: 10, background: colors.white, fontWeight: 600, cursor: 'pointer' }}>
              Fermer
            </button>
            <button onClick={() => window.open(`${STORAGE_BASE}/${resource.chemin}`, '_blank')} style={{ minHeight: 42, padding: '0 18px', border: 0, borderRadius: 10, background: colors.primary, color: colors.white, fontWeight: 700, cursor: 'pointer' }}>
              Télécharger
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Montre le vrai fichier (première page du PDF, image, vidéo) plutôt qu'un
// faux aperçu — le navigateur sait nativement afficher ces trois formats.
function RessourcePreview({ resource }) {
  const url = `${STORAGE_BASE}/${resource.chemin}`

  if (resource.format === 'PDF') {
    return <iframe title={resource.titre} src={`${url}#page=1`} style={{ width: '100%', height: 420, border: 0, borderRadius: 8, background: colors.white }} />
  }
  if (resource.format === 'IMG') {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', background: colors.white, borderRadius: 8, padding: 12 }}>
        <img src={url} alt={resource.titre} style={{ maxWidth: '100%', maxHeight: 420, objectFit: 'contain' }} />
      </div>
    )
  }
  if (resource.format === 'VID') {
    return (
      <video controls src={url} style={{ width: '100%', maxHeight: 420, borderRadius: 8, background: '#000' }} />
    )
  }
  return (
    <div style={{ background: colors.white, borderRadius: 8, padding: 32, textAlign: 'center' }}>
      <p style={{ margin: 0, fontSize: 13.5, color: colors.textMuted }}>
        Aperçu non disponible pour ce type de fichier — téléchargez-le pour le consulter.
      </p>
    </div>
  )
}

function Toggle({ checked, onChange }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      style={{
        width: 38,
        height: 21,
        borderRadius: 999,
        border: 0,
        padding: 2,
        background: checked ? colors.primary : colors.border,
        cursor: 'pointer',
        display: 'flex',
        justifyContent: checked ? 'flex-end' : 'flex-start',
        flexShrink: 0,
      }}
    >
      <span style={{ width: 17, height: 17, borderRadius: '50%', background: colors.white, boxShadow: '0 1px 2px rgba(0,0,0,0.25)', display: 'block' }} />
    </button>
  )
}

function SquareButton({ onClick, label, icon }) {
  return (
    <button onClick={onClick} aria-label={label} title={label} style={{ width: 34, height: 34, borderRadius: 8, border: `1px solid ${colors.border}`, background: colors.primaryLight, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={colors.primary} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
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
    <button onClick={onClick} style={{ minHeight: 34, padding: '0 12px', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap', ...styles }}>
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

const chooseFileBtnStyle = {
  minHeight: 38,
  padding: '0 14px',
  border: `1px solid ${colors.border}`,
  borderRadius: 8,
  background: colors.white,
  fontSize: 13,
  fontWeight: 600,
  cursor: 'pointer',
  whiteSpace: 'nowrap',
}
