import { useState } from 'react'
import { inputStyle } from '../../components/Modal'
import { colors } from '../../theme'

// Pur front pour l'instant (pas encore de contrôleur QCM/Question/Choix
// côté Laravel) — données d'exemple reprises de la maquette.
const CHAPITRE_OPTIONS = ['Conditions et boucles', 'Structure HTML', 'Mise en forme CSS', 'Flexbox et mise en page']

const MOCK_QCMS = [
  {
    id: 1,
    titre: 'QCM – Mise en forme CSS',
    chapitre: 'Conditions et boucles',
    seuilReussite: 71,
    tentatives: 2,
    afficherCorrection: false,
    questions: [
      {
        id: 1,
        texte: 'Quelle propriété modifie la couleur du texte ?',
        points: 5,
        correctIndex: 1,
        choix: ['background-color', 'color', 'font-color', 'text-style'],
      },
      {
        id: 2,
        texte: 'Quel sélecteur cible la classe « menu » ?',
        points: 5,
        correctIndex: 2,
        choix: ['#menu', '.menu', 'menu', '*menu'],
      },
    ],
  },
]

const TABS = ['Questions', 'Paramètres', 'Aperçu']
const LETTERS = ['A', 'B', 'C', 'D']

let nextQuestionId = 100

export default function GestionQCM() {
  const [qcms, setQcms] = useState(MOCK_QCMS)
  const [qcmId, setQcmId] = useState(MOCK_QCMS[0].id)
  const [tab, setTab] = useState('Questions')
  const [saved, setSaved] = useState(false)

  const qcm = qcms.find((q) => q.id === qcmId)

  const updateQcm = (patch) => {
    setQcms((prev) => prev.map((q) => (q.id === qcmId ? { ...q, ...patch } : q)))
  }

  const updateQuestion = (questionId, patch) => {
    updateQcm({ questions: qcm.questions.map((qu) => (qu.id === questionId ? { ...qu, ...patch } : qu)) })
  }

  const updateChoix = (questionId, index, value) => {
    const question = qcm.questions.find((qu) => qu.id === questionId)
    const choix = [...question.choix]
    choix[index] = value
    updateQuestion(questionId, { choix })
  }

  const deleteQuestion = (questionId) => {
    updateQcm({ questions: qcm.questions.filter((qu) => qu.id !== questionId) })
  }

  const addQuestion = () => {
    updateQcm({
      questions: [
        ...qcm.questions,
        { id: nextQuestionId++, texte: '', points: 5, correctIndex: 0, choix: ['', '', '', ''] },
      ],
    })
  }

  const addQcm = () => {
    const id = nextQuestionId++
    const next = { id, titre: 'Nouveau QCM', chapitre: CHAPITRE_OPTIONS[0], seuilReussite: 70, tentatives: 1, afficherCorrection: false, questions: [] }
    setQcms((prev) => [...prev, next])
    setQcmId(id)
    setTab('Questions')
  }

  const totalPoints = qcm.questions.reduce((sum, q) => sum + Number(q.points || 0), 0)

  const save = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

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
            <select value={qcmId} onChange={(e) => setQcmId(Number(e.target.value))} style={{ ...inputStyle, minWidth: 220, background: colors.white }}>
              {qcms.map((q) => (
                <option key={q.id} value={q.id}>{q.titre}</option>
              ))}
            </select>
          </label>
          <button onClick={addQcm} style={outlineBtnStyle}>+ Nouveau QCM</button>
          <button onClick={save} style={primaryBtnStyle}>{saved ? 'Enregistré ✓' : 'Enregistrer'}</button>
        </div>
      </div>

      <p style={{ margin: '0 0 18px', fontSize: 13.5 }}>
        <strong>{qcm.titre}</strong>
        <span style={{ color: colors.primary, fontWeight: 600 }}> · {qcm.chapitre}</span>
        <span style={{ color: colors.textMuted }}> · {qcm.questions.length} questions · total {totalPoints} points</span>
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
                  const correct = q.correctIndex === cIndex
                  return (
                    <div key={cIndex} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <button
                        onClick={() => updateQuestion(q.id, { correctIndex: cIndex })}
                        aria-label={`Définir ${LETTERS[cIndex]} comme bonne réponse`}
                        style={{
                          width: 26,
                          height: 26,
                          borderRadius: '50%',
                          border: correct ? 'none' : `1.5px solid ${colors.border}`,
                          background: correct ? colors.success : colors.white,
                          color: correct ? colors.white : colors.textMuted,
                          fontSize: 12,
                          fontWeight: 800,
                          cursor: 'pointer',
                          flexShrink: 0,
                        }}
                      >
                        {LETTERS[cIndex]}
                      </button>
                      <input
                        type="text"
                        value={choice}
                        onChange={(e) => updateChoix(q.id, cIndex, e.target.value)}
                        style={{
                          ...inputStyle,
                          flex: 1,
                          background: correct ? '#F0FDF4' : colors.white,
                          border: `1px solid ${correct ? '#86EFAC' : colors.border}`,
                          color: correct ? '#15803D' : colors.text,
                        }}
                      />
                    </div>
                  )
                })}
              </div>
              <p style={{ margin: '8px 0 0', fontSize: 12, color: colors.textMuted, fontStyle: 'italic' }}>
                Cliquez sur une lettre pour définir la bonne réponse.
              </p>
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
            <select value={qcm.chapitre} onChange={(e) => updateQcm({ chapitre: e.target.value })} style={{ ...inputStyle, background: colors.white }}>
              {CHAPITRE_OPTIONS.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </Field>
          <Field label="Seuil de réussite (%)">
            <input type="number" min={0} max={100} value={qcm.seuilReussite} onChange={(e) => updateQcm({ seuilReussite: Number(e.target.value) })} style={inputStyle} />
          </Field>
          <Field label="Nombre de tentatives autorisées">
            <input type="number" min={1} value={qcm.tentatives} onChange={(e) => updateQcm({ tentatives: Number(e.target.value) })} style={inputStyle} />
          </Field>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700 }}>Afficher la correction aux stagiaires</div>
              <div style={{ fontSize: 12.5, color: colors.textMuted }}>Après validation du QCM</div>
            </div>
            <Toggle checked={qcm.afficherCorrection} onChange={(v) => updateQcm({ afficherCorrection: v })} />
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
                      {LETTERS[cIndex]}
                    </span>
                    <span style={{ fontSize: 13.5 }}>{choice}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function Field({ label, children }) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 7, fontSize: 13, fontWeight: 700 }}>
      {label}
      {children}
    </label>
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
