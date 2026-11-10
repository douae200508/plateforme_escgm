import { useEffect, useState } from 'react'
import api from '../../api/axios'
import Modal, { Field, inputStyle } from '../../components/Modal'
import ConfirmDialog from '../../components/ConfirmDialog'
import { colors } from '../../theme'

const TABS = ['Questions', 'Paramètres', 'Aperçu']

function letterFor(index) {
  return String.fromCharCode(65 + index)
}

let nextQuestionId = 100

function chapitreLabel(c) {
  return `${c.formation_titre} · ${c.module_titre} · ${c.titre}`
}

export default function GestionQCM() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [chapitres, setChapitres] = useState([])
  const [qcms, setQcms] = useState([])
  const [qcmId, setQcmId] = useState(null)
  const [qcm, setQcm] = useState(null)
  const [tab, setTab] = useState('Questions')
  const [saved, setSaved] = useState(false)
  const [newQcmModal, setNewQcmModal] = useState(false)
  const [newQcmForm, setNewQcmForm] = useState({ titre: '', chapitre_id: '' })
  const [toDelete, setToDelete] = useState(false)
  const [linkCopied, setLinkCopied] = useState(false)

  const copyLink = async () => {
    const link = `${window.location.origin}/qcm/${qcm.token}`
    try {
      await navigator.clipboard.writeText(link)
    } catch {
      window.prompt('Copiez ce lien :', link)
    }
    setLinkCopied(true)
    setTimeout(() => setLinkCopied(false), 2000)
  }

  const loadQcmDetail = (id) => {
    api
      .get(`/admin/qcms/${id}`)
      .then(({ data }) => setQcm(data))
      .catch(() => setError('Impossible de charger ce QCM.'))
  }

  useEffect(() => {
    setLoading(true)
    Promise.all([api.get('/admin/chapitres'), api.get('/admin/qcms')])
      .then(([chapitresRes, qcmsRes]) => {
        setChapitres(chapitresRes.data)
        setQcms(qcmsRes.data)
        if (qcmsRes.data.length) {
          setQcmId(qcmsRes.data[0].id)
          loadQcmDetail(qcmsRes.data[0].id)
        }
      })
      .catch(() => setError('Impossible de charger les QCM.'))
      .finally(() => setLoading(false))
  }, [])

  const selectQcm = (id) => {
    setQcmId(id)
    setQcm(null)
    loadQcmDetail(id)
  }

  const updateQcm = (patch) => setQcm((prev) => ({ ...prev, ...patch }))

  const updateQuestion = (questionId, patch) => {
    updateQcm({ questions: qcm.questions.map((qu) => (qu.id === questionId ? { ...qu, ...patch } : qu)) })
  }

  const updateChoixLibelle = (questionId, index, value) => {
    const question = qcm.questions.find((qu) => qu.id === questionId)
    const choix = question.choix.map((c, i) => (i === index ? { ...c, libelle: value } : c))
    updateQuestion(questionId, { choix })
  }

  const toggleChoixCorrect = (questionId, index) => {
    const question = qcm.questions.find((qu) => qu.id === questionId)
    const choix = question.choix.map((c, i) => (i === index ? { ...c, correct: !c.correct } : c))
    updateQuestion(questionId, { choix })
  }

  const addChoix = (questionId) => {
    const question = qcm.questions.find((qu) => qu.id === questionId)
    updateQuestion(questionId, { choix: [...question.choix, { libelle: '', correct: false }] })
  }

  const removeChoix = (questionId, index) => {
    const question = qcm.questions.find((qu) => qu.id === questionId)
    if (question.choix.length <= 2) return
    updateQuestion(questionId, { choix: question.choix.filter((_, i) => i !== index) })
  }

  const deleteQuestion = (questionId) => {
    updateQcm({ questions: qcm.questions.filter((qu) => qu.id !== questionId) })
  }

  const addQuestion = () => {
    updateQcm({
      questions: [
        ...qcm.questions,
        {
          id: `new-${nextQuestionId++}`,
          texte: '',
          points: 5,
          choix: [{ libelle: '', correct: false }, { libelle: '', correct: false }, { libelle: '', correct: false }, { libelle: '', correct: false }],
        },
      ],
    })
  }

  const openNewQcmModal = () => {
    setNewQcmForm({ titre: '', chapitre_id: chapitres[0]?.id || '' })
    setNewQcmModal(true)
  }

  const submitNewQcm = async () => {
    try {
      const { data } = await api.post('/admin/qcms', { titre: newQcmForm.titre, chapitre_id: newQcmForm.chapitre_id })
      setQcms((prev) => [...prev, { id: data.id, titre: data.titre, chapitre: data.chapitre, questions_count: 0, total_points: 0 }])
      setQcmId(data.id)
      setQcm(data)
      setTab('Questions')
      setNewQcmModal(false)
    } catch {
      setError('La création du QCM a échoué.')
    }
  }

  const confirmDeleteQcm = async () => {
    await api.delete(`/admin/qcms/${qcmId}`)
    const remaining = qcms.filter((q) => q.id !== qcmId)
    setQcms(remaining)
    setToDelete(false)
    if (remaining.length) {
      setQcmId(remaining[0].id)
      loadQcmDetail(remaining[0].id)
    } else {
      setQcmId(null)
      setQcm(null)
    }
  }

  const save = async () => {
    try {
      const { data } = await api.put(`/admin/qcms/${qcmId}`, {
        titre: qcm.titre,
        chapitre_id: qcm.chapitre_id,
        seuil_reussite: qcm.seuil_reussite,
        nombre_tentatives: qcm.nombre_tentatives,
        afficher_correction: qcm.afficher_correction,
        questions: qcm.questions.map((q) => ({ texte: q.texte, points: q.points, choix: q.choix.map((c) => ({ libelle: c.libelle, correct: c.correct })) })),
      })
      setQcm(data)
      setQcms((prev) => prev.map((q) => (q.id === data.id ? { ...q, titre: data.titre, chapitre: data.chapitre, questions_count: data.questions.length, total_points: data.questions.reduce((sum, qu) => sum + Number(qu.points || 0), 0) } : q)))
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch {
      setError("L'enregistrement a échoué.")
    }
  }

  if (loading) {
    return <p style={{ color: colors.textMuted, fontSize: 14 }}>Chargement…</p>
  }

  if (!qcm) {
    return (
      <div>
        <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800 }}>Gestion des QCM</h1>
        {error && <div style={{ margin: '12px 0', color: colors.danger, fontSize: 14 }}>{error}</div>}
        <div style={{ marginTop: 20, background: colors.white, border: `1px solid ${colors.border}`, borderRadius: 16, padding: 32, textAlign: 'center' }}>
          <p style={{ margin: '0 0 14px', color: colors.textMuted, fontSize: 14 }}>Aucun QCM pour l'instant.</p>
          <button onClick={openNewQcmModal} style={primaryBtnStyle}>+ Nouveau QCM</button>
        </div>
        {newQcmModal && (
          <NewQcmModal chapitres={chapitres} form={newQcmForm} setForm={setNewQcmForm} onClose={() => setNewQcmModal(false)} onSubmit={submitNewQcm} />
        )}
      </div>
    )
  }

  const totalPoints = qcm.questions.reduce((sum, q) => sum + Number(q.points || 0), 0)

  return (
    <div>
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, marginBottom: 6 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800 }}>Gestion des QCM</h1>
          <p style={{ margin: '6px 0 0', color: colors.textMuted, fontSize: 14 }}>
            Questions, choix de réponses, bonnes réponses et points.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10 }}>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12.5, fontWeight: 700, color: colors.textMuted }}>
            QCM
            <select value={qcmId} onChange={(e) => selectQcm(Number(e.target.value))} style={{ ...inputStyle, minWidth: 220, background: colors.white }}>
              {qcms.map((q) => (
                <option key={q.id} value={q.id}>{q.titre}</option>
              ))}
            </select>
          </label>
          <button onClick={copyLink} style={outlineBtnStyle}>{linkCopied ? 'Lien copié ✓' : 'Copier le lien'}</button>
          <button onClick={openNewQcmModal} style={outlineBtnStyle}>+ Nouveau QCM</button>
          <button onClick={save} style={primaryBtnStyle}>{saved ? 'Enregistré ✓' : 'Enregistrer'}</button>
        </div>
      </div>

      {error && <div style={{ margin: '0 0 12px', color: colors.danger, fontSize: 14 }}>{error}</div>}

      <p style={{ margin: '0 0 18px', fontSize: 13.5 }}>
        <strong>{qcm.titre}</strong>
        {qcm.chapitre && <span style={{ color: colors.primary, fontWeight: 600 }}> · {qcm.chapitre.titre}</span>}
        <span style={{ color: colors.textMuted }}> · {qcm.questions.length} questions · total {totalPoints} points</span>
        <button onClick={() => setToDelete(true)} style={{ ...linkBtnStyle, marginLeft: 10 }}>Supprimer ce QCM</button>
      </p>

      <div style={{ display: 'flex', gap: 22, borderBottom: `1px solid ${colors.border}`, marginBottom: 18 }}>
        {TABS.map((t) => (
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
            {t}
          </button>
        ))}
      </div>

      {tab === 'Questions' && (
        <div style={{ background: colors.white, border: `1px solid ${colors.border}`, borderRadius: 16, padding: 20, display: 'flex', flexDirection: 'column', gap: 24 }}>
          {qcm.questions.map((q, qIndex) => (
            <div key={q.id} style={{ paddingBottom: qIndex === qcm.questions.length - 1 ? 0 : 20, borderBottom: qIndex === qcm.questions.length - 1 ? 'none' : `1px solid ${colors.divider}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, flexWrap: 'wrap', gap: 10 }}>
                <span style={{ fontSize: 14, fontWeight: 800, color: colors.primary }}>Question {qIndex + 1}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12.5, fontWeight: 700, color: colors.textMuted }}>
                    Points
                    <input
                      type="number"
                      min={0}
                      value={q.points}
                      onChange={(e) => updateQuestion(q.id, { points: Number(e.target.value) })}
                      style={{ ...inputStyle, width: 56, minHeight: 34, padding: '0 8px' }}
                    />
                  </label>
                  <button onClick={() => deleteQuestion(q.id)} style={smallDangerBtnStyle}>Supprimer</button>
                </div>
              </div>

              <input
                type="text"
                value={q.texte}
                onChange={(e) => updateQuestion(q.id, { texte: e.target.value })}
                placeholder="Énoncé de la question"
                style={{ ...inputStyle, width: '100%', marginBottom: 12 }}
              />

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {q.choix.map((choice, cIndex) => {
                  const correct = choice.correct
                  return (
                    <div key={cIndex} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <button
                        type="button"
                        onClick={() => toggleChoixCorrect(q.id, cIndex)}
                        aria-label={`${correct ? 'Retirer' : 'Marquer'} ${letterFor(cIndex)} comme bonne réponse`}
                        style={{
                          width: 26,
                          height: 26,
                          borderRadius: 6,
                          border: correct ? 'none' : `1.5px solid ${colors.border}`,
                          background: correct ? colors.success : colors.white,
                          color: correct ? colors.white : colors.textMuted,
                          fontSize: 12,
                          fontWeight: 800,
                          cursor: 'pointer',
                          flexShrink: 0,
                        }}
                      >
                        {letterFor(cIndex)}
                      </button>
                      <input
                        type="text"
                        value={choice.libelle}
                        onChange={(e) => updateChoixLibelle(q.id, cIndex, e.target.value)}
                        style={{
                          ...inputStyle,
                          flex: 1,
                          background: correct ? '#F0FDF4' : colors.white,
                          border: `1px solid ${correct ? '#86EFAC' : colors.border}`,
                          color: correct ? '#15803D' : colors.text,
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => removeChoix(q.id, cIndex)}
                        disabled={q.choix.length <= 2}
                        aria-label="Supprimer cette proposition"
                        style={{ border: 0, background: 'transparent', cursor: q.choix.length <= 2 ? 'not-allowed' : 'pointer', color: q.choix.length <= 2 ? colors.border : colors.danger, fontWeight: 800, flexShrink: 0 }}
                      >
                        ×
                      </button>
                    </div>
                  )
                })}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
                <button type="button" onClick={() => addChoix(q.id)} style={smallOutlineBtnStyle}>+ Ajouter une proposition</button>
                <p style={{ margin: 0, fontSize: 12, color: colors.textMuted, fontStyle: 'italic' }}>
                  Cochez une ou plusieurs lettres pour définir les bonnes réponses.
                </p>
              </div>
            </div>
          ))}

          <button
            onClick={addQuestion}
            style={{
              minHeight: 48,
              border: `1.5px dashed ${colors.primary}`,
              borderRadius: 12,
              background: colors.primaryLight,
              color: colors.primary,
              fontWeight: 700,
              fontSize: 13.5,
              cursor: 'pointer',
            }}
          >
            + Ajouter une question
          </button>
        </div>
      )}

      {tab === 'Paramètres' && (
        <div style={{ background: colors.white, border: `1px solid ${colors.border}`, borderRadius: 16, padding: 24, maxWidth: 520, display: 'flex', flexDirection: 'column', gap: 18 }}>
          <Field label="Titre du QCM">
            <input type="text" value={qcm.titre} onChange={(e) => updateQcm({ titre: e.target.value })} style={inputStyle} />
          </Field>
          <Field label="Chapitre associé">
            <select value={qcm.chapitre_id || ''} onChange={(e) => updateQcm({ chapitre_id: Number(e.target.value) })} style={{ ...inputStyle, background: colors.white }}>
              {chapitres.map((c) => (
                <option key={c.id} value={c.id}>{chapitreLabel(c)}</option>
              ))}
            </select>
          </Field>
          <Field label="Seuil de réussite (%)">
            <input type="number" min={0} max={100} value={qcm.seuil_reussite} onChange={(e) => updateQcm({ seuil_reussite: Number(e.target.value) })} style={inputStyle} />
          </Field>
          <Field label="Nombre de tentatives autorisées">
            <input type="number" min={1} value={qcm.nombre_tentatives} onChange={(e) => updateQcm({ nombre_tentatives: Number(e.target.value) })} style={inputStyle} />
          </Field>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700 }}>Afficher la correction aux stagiaires</div>
              <div style={{ fontSize: 12.5, color: colors.textMuted }}>Après validation du QCM</div>
            </div>
            <Toggle checked={qcm.afficher_correction} onChange={(v) => updateQcm({ afficher_correction: v })} />
          </div>
        </div>
      )}

      {tab === 'Aperçu' && (
        <div style={{ border: `1.5px solid ${colors.primary}`, borderRadius: 16, padding: 22, maxWidth: 640 }}>
          <span style={{ display: 'inline-block', padding: '4px 10px', borderRadius: 999, background: colors.primaryLight, color: colors.primary, fontSize: 11.5, fontWeight: 700, marginBottom: 14 }}>
            Aperçu stagiaire
          </span>
          <h2 style={{ margin: '0 0 16px', fontSize: 18, fontWeight: 800 }}>{qcm.titre}</h2>

          {qcm.questions.map((q, qIndex) => (
            <div key={q.id} style={{ marginBottom: 18 }}>
              <p style={{ margin: '0 0 10px', fontSize: 14, fontWeight: 700 }}>
                {qIndex + 1}. {q.texte} <span style={{ color: colors.textMuted, fontWeight: 500, fontSize: 12.5 }}>({q.points} pt)</span>
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {q.choix.map((choice, cIndex) => (
                  <div
                    key={cIndex}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      minHeight: 40,
                      padding: '0 12px',
                      border: `1px solid ${colors.border}`,
                      borderRadius: 10,
                    }}
                  >
                    <span style={{ width: 22, height: 22, borderRadius: '50%', border: `1.5px solid ${colors.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: colors.textMuted, flexShrink: 0 }}>
                      {letterFor(cIndex)}
                    </span>
                    <span style={{ fontSize: 13.5 }}>{choice.libelle}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {newQcmModal && (
        <NewQcmModal chapitres={chapitres} form={newQcmForm} setForm={setNewQcmForm} onClose={() => setNewQcmModal(false)} onSubmit={submitNewQcm} />
      )}

      {toDelete && (
        <ConfirmDialog
          title="Supprimer le QCM"
          text={`« ${qcm.titre} » sera définitivement supprimé. Continuer ?`}
          cta="Supprimer"
          onCancel={() => setToDelete(false)}
          onConfirm={confirmDeleteQcm}
        />
      )}
    </div>
  )
}

function NewQcmModal({ chapitres, form, setForm, onClose, onSubmit }) {
  return (
    <Modal title="Nouveau QCM" onClose={onClose} onSubmit={onSubmit} submitLabel="Créer">
      <Field label="Titre du QCM">
        <input type="text" required autoFocus value={form.titre} onChange={(e) => setForm({ ...form, titre: e.target.value })} style={inputStyle} />
      </Field>
      <Field label="Chapitre associé">
        <select value={form.chapitre_id} onChange={(e) => setForm({ ...form, chapitre_id: Number(e.target.value) })} style={{ ...inputStyle, background: colors.white }}>
          {chapitres.map((c) => (
            <option key={c.id} value={c.id}>{chapitreLabel(c)}</option>
          ))}
        </select>
      </Field>
    </Modal>
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

const outlineBtnStyle = {
  minHeight: 42,
  padding: '0 14px',
  border: `1.5px solid ${colors.primary}`,
  borderRadius: 10,
  background: colors.white,
  color: colors.primary,
  fontWeight: 700,
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

const smallDangerBtnStyle = {
  minHeight: 30,
  padding: '0 10px',
  border: 0,
  borderRadius: 7,
  background: colors.dangerBg,
  color: colors.danger,
  fontSize: 12.5,
  fontWeight: 700,
  cursor: 'pointer',
}

const smallOutlineBtnStyle = {
  minHeight: 34,
  padding: '0 12px',
  borderRadius: 8,
  fontSize: 12.5,
  fontWeight: 700,
  cursor: 'pointer',
  whiteSpace: 'nowrap',
  background: colors.white,
  color: colors.primary,
  border: `1px solid ${colors.primary}`,
}

const linkBtnStyle = {
  border: 0,
  background: 'transparent',
  color: colors.danger,
  fontSize: 12.5,
  fontWeight: 700,
  cursor: 'pointer',
  padding: 0,
}
