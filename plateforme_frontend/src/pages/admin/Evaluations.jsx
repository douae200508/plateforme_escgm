import { useRef, useState } from 'react'
import ConfirmDialog from '../../components/ConfirmDialog'
import Modal, { Field, inputStyle } from '../../components/Modal'
import { colors } from '../../theme'

// Pur front pour l'instant (pas encore de contrôleur Évaluation côté
// Laravel) — données d'exemple reprises de la maquette.
const FORMATIONS = ['Développement Web et Web Mobile', 'Technicien Informatique', 'Gestion de Projet Agile']

const INITIAL_EVALUATIONS = [
  { id: 1, titre: 'Examen final – Développement Web', deposee: '2026-10-15', formationModule: 'Développement Web et Web Mobile · Module 3', sujet: 'sujet_final_dwwm.pdf', corrige: 'corrige_final_dwwm.pdf' },
  { id: 2, titre: 'Contrôle – HTML & CSS', deposee: '2026-10-14', formationModule: 'Développement Web et Web Mobile · Module 2', sujet: 'controle_html_css.pdf', corrige: null },
  { id: 3, titre: 'Examen – Réseaux', deposee: '2026-10-10', formationModule: 'Technicien Informatique · Module 1', sujet: 'examen_reseaux.pdf', corrige: 'corrige_reseaux.pdf' },
  { id: 4, titre: 'Étude de cas – Scrum', deposee: '2026-10-07', formationModule: 'Gestion de Projet Agile · Module 2', sujet: 'cas_scrum.docx', corrige: null },
]

const INITIAL_QCM_CORRECTIONS = [
  { id: 1, titre: 'QCM – Les bases du Web', chapitre: 'Les bases du Web', visible: true },
  { id: 2, titre: 'QCM – Structure HTML', chapitre: 'Structure HTML', visible: true },
  { id: 3, titre: 'QCM – Mise en forme CSS', chapitre: 'Conditions et boucles', visible: false },
]

const TABS = ['Toutes', 'Sans corrigé', 'Corrections des évaluations']

const DEPOT_EMPTY = { titre: '', formation: FORMATIONS[0], module: '' }

let nextId = 100

export default function Evaluations() {
  const [evaluations, setEvaluations] = useState(INITIAL_EVALUATIONS)
  const [qcmCorrections, setQcmCorrections] = useState(INITIAL_QCM_CORRECTIONS)
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

  const sansCorrige = evaluations.filter((e) => !e.corrige)
  const visible = tab === 'Sans corrigé' ? sansCorrige : evaluations

  const openDepot = () => {
    setDepotForm(DEPOT_EMPTY)
    setDepotSujet(null)
    setDepotCorrige(null)
    setDepotOpen(true)
  }

  const submitDepot = () => {
    setEvaluations((prev) => [
      {
        id: nextId++,
        titre: depotForm.titre,
        deposee: new Date().toISOString().slice(0, 10),
        formationModule: `${depotForm.formation} · ${depotForm.module}`,
        sujet: depotSujet?.name || '—',
        corrige: depotCorrige?.name || null,
      },
      ...prev,
    ])
    setDepotOpen(false)
  }

  const submitImport = () => {
    setEvaluations((prev) => prev.map((e) => (e.id === importTarget.id ? { ...e, corrige: importFile?.name || e.corrige } : e)))
    setImportTarget(null)
    setImportFile(null)
  }

  const confirmDelete = () => {
    setEvaluations((prev) => prev.filter((e) => e.id !== toDelete.id))
    setToDelete(null)
  }

  const toggleQcmCorrection = (id) => {
    setQcmCorrections((prev) => prev.map((q) => (q.id === id ? { ...q, visible: !q.visible } : q)))
  }

  return (
    <div>
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-end', gap: 16, marginBottom: 16 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800 }}>Gestion des évaluations</h1>
          <p style={{ margin: '6px 0 0', color: colors.textMuted, fontSize: 14 }}>
            Sujets de fin de module et corrigés, et publication des corrections de QCM.
          </p>
        </div>
        <button onClick={openDepot} style={primaryBtnStyle}>+ Déposer une évaluation</button>
      </div>

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
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Formation / Module</th>
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
                    <div style={{ fontSize: 12, color: colors.textMuted }}>Déposée le {new Date(e.deposee).toLocaleDateString('fr-FR')}</div>
                  </td>
                  <td style={{ padding: '12px 16px', color: colors.primary, fontWeight: 600 }}>{e.formationModule}</td>
                  <td style={{ padding: '12px 16px', color: colors.primary, fontWeight: 600 }}>{e.sujet}</td>
                  <td style={{ padding: '12px 16px' }}>
                    {e.corrige ? <Pill tone="green">{e.corrige}</Pill> : <Pill tone="amber">Manquant</Pill>}
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
          {qcmCorrections.map((q, i) => (
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
                <div style={{ fontSize: 12.5, color: colors.primary, fontWeight: 600 }}>Chapitre : {q.chapitre}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 12.5, fontWeight: 600, color: q.visible ? colors.primary : colors.textMuted }}>
                  {q.visible ? 'Correction visible' : 'Correction masquée'}
                </span>
                <Toggle checked={q.visible} onChange={() => toggleQcmCorrection(q.id)} />
              </div>
            </div>
          ))}
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
          <Field label="Formation">
            <select value={depotForm.formation} onChange={(e) => setDepotForm({ ...depotForm, formation: e.target.value })} style={{ ...inputStyle, background: colors.white }}>
              {FORMATIONS.map((f) => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
          </Field>
          <Field label="Module">
            <input type="text" value={depotForm.module} onChange={(e) => setDepotForm({ ...depotForm, module: e.target.value })} placeholder="Ex. Module 2 : HTML & CSS" style={inputStyle} />
          </Field>
          <Field label="Sujet">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <input ref={sujetInputRef} type="file" style={{ display: 'none' }} onChange={(e) => setDepotSujet(e.target.files?.[0] || null)} />
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
