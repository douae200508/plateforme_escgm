import { useEffect, useRef, useState } from 'react'
import api from '../../api/axios'
import ConfirmDialog from '../../components/ConfirmDialog'
import Modal, { Field, inputStyle } from '../../components/Modal'
import { colors } from '../../theme'

const STORAGE_BASE = api.defaults.baseURL.replace(/\/api\/?$/, '/storage')

function filename(path) {
  return path ? path.split('/').pop() : null
}

const TABS = ['Toutes', 'Sans corrigé', 'Corrections des évaluations']

const DEPOT_EMPTY = { titre: '', module_id: '' }

export default function Evaluations() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [formations, setFormations] = useState([])
  const [formationId, setFormationId] = useState(null)
  const [modules, setModules] = useState([])
  const [evaluations, setEvaluations] = useState([])
  const [qcms, setQcms] = useState([])
  const [tab, setTab] = useState('Toutes')
  const [toDelete, setToDelete] = useState(null)
  const [importTarget, setImportTarget] = useState(null)
  const [importFile, setImportFile] = useState(null)
  const [depotOpen, setDepotOpen] = useState(false)
  const [depotForm, setDepotForm] = useState(DEPOT_EMPTY)
  const [depotSujet, setDepotSujet] = useState(null)
  const [depotCorrige, setDepotCorrige] = useState(null)
  const importInputRef = useRef(null)
  const sujetInputRef = useRef(null)
  const corrigeInputRef = useRef(null)

  const loadForFormation = (fId) => {
    setLoading(true)
    Promise.all([
      api.get('/admin/modules', { params: { formation_id: fId } }),
      api.get('/admin/evaluations', { params: { formation_id: fId } }),
      api.get('/admin/qcms', { params: { formation_id: fId } }),
    ])
      .then(([modulesRes, evaluationsRes, qcmsRes]) => {
        setModules(modulesRes.data)
        setEvaluations(evaluationsRes.data)
        setQcms(qcmsRes.data)
      })
      .catch(() => setError('Impossible de charger les évaluations.'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    api.get('/admin/formations').then(({ data }) => {
      setFormations(data)
      if (data.length) setFormationId(data[0].id)
      else setLoading(false)
    })
  }, [])

  useEffect(() => {
    if (formationId) loadForFormation(formationId)
  }, [formationId])

  const sansCorrige = evaluations.filter((e) => !e.corrige)
  const visible = tab === 'Sans corrigé' ? sansCorrige : evaluations

  const openDepot = () => {
    setDepotForm({ titre: '', module_id: modules[0]?.id || '' })
    setDepotSujet(null)
    setDepotCorrige(null)
    setDepotOpen(true)
  }

  const submitDepot = async () => {
    try {
      const body = new FormData()
      body.append('titre', depotForm.titre)
      body.append('module_id', depotForm.module_id)
      if (depotSujet) body.append('sujet', depotSujet)
      if (depotCorrige) body.append('corrige', depotCorrige)
      const { data } = await api.post('/admin/evaluations', body, { headers: { 'Content-Type': 'multipart/form-data' } })
      setEvaluations((prev) => [data, ...prev])
      setDepotOpen(false)
    } catch {
      setError("Le dépôt de l'évaluation a échoué.")
    }
  }

  const submitImport = async () => {
    try {
      const body = new FormData()
      body.append('corrige', importFile)
      const { data } = await api.post(`/admin/evaluations/${importTarget.id}/corrige`, body, { headers: { 'Content-Type': 'multipart/form-data' } })
      setEvaluations((prev) => prev.map((e) => (e.id === data.id ? data : e)))
      setImportTarget(null)
      setImportFile(null)
    } catch {
      setError("L'import du corrigé a échoué.")
    }
  }

  const confirmDelete = async () => {
    await api.delete(`/admin/evaluations/${toDelete.id}`)
    setEvaluations((prev) => prev.filter((e) => e.id !== toDelete.id))
    setToDelete(null)
  }

  const toggleQcmCorrection = async (q) => {
    const { data } = await api.put(`/admin/qcms/${q.id}`, { afficher_correction: !q.afficher_correction })
    setQcms((prev) => prev.map((x) => (x.id === q.id ? { ...x, afficher_correction: data.afficher_correction } : x)))
  }

  if (loading) {
    return <p style={{ color: colors.textMuted, fontSize: 14 }}>Chargement…</p>
  }

  return (
    <div>
      <div style={{ marginBottom: 14 }}>
        <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800 }}>Gestion des évaluations</h1>
        <p style={{ margin: '6px 0 0', color: colors.textMuted, fontSize: 14 }}>
          Sujets de fin de module et corrigés, et publication des corrections de QCM.
        </p>
      </div>

      <div style={{ display: 'flex', flexWrap: 'nowrap', justifyContent: 'flex-start', alignItems: 'flex-end', gap: 12, marginBottom: 16, overflowX: 'auto' }}>
        <label style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12.5, fontWeight: 700, color: colors.textMuted, minWidth: 0 }}>
          Formation
          <select value={formationId || ''} onChange={(e) => setFormationId(Number(e.target.value))} style={{ ...inputStyle, width: 220, minWidth: 0, background: colors.white }}>
            {formations.map((f) => (
              <option key={f.id} value={f.id}>{f.titre}</option>
            ))}
          </select>
        </label>

        <button onClick={openDepot} style={{ ...primaryBtnStyle, whiteSpace: 'nowrap', marginLeft: 'auto', flexShrink: 0 }} disabled={!modules.length}>+ Déposer une évaluation</button>
      </div>

      {error && <div style={{ margin: '0 0 16px', color: colors.danger, fontSize: 14 }}>{error}</div>}

      <div style={{ display: 'flex', gap: 22, borderBottom: `1px solid ${colors.border}`, marginBottom: 16 }}>
        {TABS.map((t) => {
          const count = t === 'Toutes' ? evaluations.length : t === 'Sans corrigé' ? sansCorrige.length : null
          return (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                minHeight: 40,
                padding: '0 2px',
                border: 0,
                borderBottom: `2px solid ${tab === t ? colors.primary : 'transparent'}`,
                background: 'transparent',
                cursor: 'pointer',
                fontSize: 13.5,
                fontWeight: 600,
                color: tab === t ? colors.primary : colors.textMuted,
              }}
            >
              {t}{count !== null ? ` (${count})` : ''}
            </button>
          )
        })}
      </div>

      {tab !== 'Corrections des évaluations' ? (
        <div style={{ background: colors.white, border: `1px solid ${colors.border}`, borderRadius: 16, overflowX: 'auto' }}>
          <table style={{ width: '100%', minWidth: 880, borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr style={{ textAlign: 'left', background: colors.tableHead, color: colors.textMuted, fontSize: 11.5, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Évaluation</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Module</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Sujet</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Corrigé</th>
                <th style={{ padding: '12px 16px' }}></th>
              </tr>
            </thead>
            <tbody>
              {visible.map((e) => (
                <tr key={e.id} style={{ borderTop: `1px solid ${colors.divider}` }}>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ fontWeight: 700 }}>{e.titre}</div>
                    <div style={{ fontSize: 12, color: colors.textMuted }}>Déposée le {new Date(e.created_at).toLocaleDateString('fr-FR')}</div>
                  </td>
                  <td style={{ padding: '12px 16px', color: colors.primary, fontWeight: 600 }}>{e.module?.titre}</td>
                  <td style={{ padding: '12px 16px' }}>
                    {e.sujet && (
                      <button type="button" onClick={() => window.open(`${STORAGE_BASE}/${e.sujet}`, '_blank')} style={linkBtnStyle}>
                        {filename(e.sujet)}
                      </button>
                    )}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    {e.corrige ? (
                      <button type="button" onClick={() => window.open(`${STORAGE_BASE}/${e.corrige}`, '_blank')} style={{ border: 0, background: 'transparent', padding: 0, cursor: 'pointer' }}>
                        <Pill tone="green">{filename(e.corrige)}</Pill>
                      </button>
                    ) : (
                      <Pill tone="amber">Manquant</Pill>
                    )}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', flexWrap: 'nowrap' }}>
                      <SmallButton onClick={() => { setImportTarget(e); setImportFile(null) }}>
                        {e.corrige ? 'Remplacer le corrigé' : 'Importer le corrigé'}
                      </SmallButton>
                      <SmallButton variant="danger" onClick={() => setToDelete(e)}>Supprimer</SmallButton>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {visible.length === 0 && (
            <div style={{ padding: 20, color: colors.textMuted, fontSize: 14 }}>Aucune évaluation dans cette catégorie.</div>
          )}
        </div>
      ) : (
        <div style={{ background: colors.white, border: `1px solid ${colors.border}`, borderRadius: 16 }}>
          {qcms.map((q, i) => (
            <div
              key={q.id}
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: 12,
                padding: '16px 20px',
                borderTop: i === 0 ? 'none' : `1px solid ${colors.divider}`,
              }}
            >
              <div>
                <div style={{ fontWeight: 700, fontSize: 14 }}>{q.titre}</div>
                {q.chapitre && <div style={{ fontSize: 12.5, color: colors.primary, fontWeight: 600 }}>Chapitre : {q.chapitre.titre}</div>}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 12.5, fontWeight: 600, color: q.afficher_correction ? colors.primary : colors.textMuted }}>
                  {q.afficher_correction ? 'Correction visible' : 'Correction masquée'}
                </span>
                <Toggle checked={q.afficher_correction} onChange={() => toggleQcmCorrection(q)} />
              </div>
            </div>
          ))}
          {qcms.length === 0 && (
            <div style={{ padding: 20, color: colors.textMuted, fontSize: 14 }}>Aucun QCM pour cette formation.</div>
          )}
        </div>
      )}

      {importTarget && (
        <Modal title="Importer le corrigé" onClose={() => setImportTarget(null)} onSubmit={submitImport} submitLabel="Importer">
          <Field label="Fichier du corrigé">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <input ref={importInputRef} type="file" style={{ display: 'none' }} onChange={(e) => setImportFile(e.target.files?.[0] || null)} />
              <button type="button" onClick={() => importInputRef.current?.click()} style={chooseFileBtnStyle}>Choisir un fichier</button>
              <span style={{ fontSize: 13, color: colors.textMuted }}>{importFile ? importFile.name : "Aucun fichier n'a été sélectionné"}</span>
            </div>
          </Field>
          <p style={{ margin: 0, fontSize: 12.5, color: colors.textMuted }}>
            Évaluation : {importTarget.titre}. Le corrigé reste réservé aux formateurs et administrateurs.
          </p>
        </Modal>
      )}

      {depotOpen && (
        <Modal title="Déposer une évaluation" onClose={() => setDepotOpen(false)} onSubmit={submitDepot} submitLabel="Déposer">
          <Field label="Titre de l'évaluation">
            <input type="text" required autoFocus value={depotForm.titre} onChange={(e) => setDepotForm({ ...depotForm, titre: e.target.value })} style={inputStyle} />
          </Field>
          <Field label="Module">
            <select value={depotForm.module_id} onChange={(e) => setDepotForm({ ...depotForm, module_id: Number(e.target.value) })} style={{ ...inputStyle, background: colors.white }}>
              {modules.map((m) => (
                <option key={m.id} value={m.id}>{m.titre}</option>
              ))}
            </select>
          </Field>
          <Field label="Sujet">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <input ref={sujetInputRef} type="file" required style={{ display: 'none' }} onChange={(e) => setDepotSujet(e.target.files?.[0] || null)} />
              <button type="button" onClick={() => sujetInputRef.current?.click()} style={chooseFileBtnStyle}>Choisir un fichier</button>
              <span style={{ fontSize: 13, color: colors.textMuted }}>{depotSujet ? depotSujet.name : "Aucun fichier n'a été sélectionné"}</span>
            </div>
          </Field>
          <Field label="Corrigé (facultatif)">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <input ref={corrigeInputRef} type="file" style={{ display: 'none' }} onChange={(e) => setDepotCorrige(e.target.files?.[0] || null)} />
              <button type="button" onClick={() => corrigeInputRef.current?.click()} style={chooseFileBtnStyle}>Choisir un fichier</button>
              <span style={{ fontSize: 13, color: colors.textMuted }}>{depotCorrige ? depotCorrige.name : "Aucun fichier n'a été sélectionné"}</span>
            </div>
          </Field>
        </Modal>
      )}

      {toDelete && (
        <ConfirmDialog
          title="Supprimer l'évaluation"
          text={`« ${toDelete.titre} » et son éventuel corrigé seront définitivement supprimés. Continuer ?`}
          cta="Supprimer"
          onCancel={() => setToDelete(null)}
          onConfirm={confirmDelete}
        />
      )}
    </div>
  )
}

function Pill({ tone, children }) {
  const tones = {
    green: { bg: '#DCFCE7', color: '#15803D' },
    amber: { bg: '#FEF3C7', color: '#92400E' },
  }[tone]
  return (
    <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: 999, fontSize: 12, fontWeight: 700, background: tones.bg, color: tones.color }}>
      {children}
    </span>
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

function SmallButton({ onClick, variant = 'default', children }) {
  const styles = {
    default: { background: colors.white, color: colors.text, border: `1px solid ${colors.border}` },
    danger: { background: colors.dangerBg, color: colors.danger, border: 0 },
  }[variant]
  return (
    <button onClick={onClick} style={{ minHeight: 34, padding: '0 12px', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap', ...styles }}>
      {children}
    </button>
  )
}

const linkBtnStyle = {
  border: 0,
  background: 'transparent',
  color: colors.primary,
  fontSize: 13,
  fontWeight: 700,
  cursor: 'pointer',
  padding: 0,
  textAlign: 'left',
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
