import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import api from '../api/axios'
import { useAuth } from '../auth/AuthContext'
import { colors } from '../theme'

export default function QcmPassage() {
  const { token } = useParams()
  const { user, logout } = useAuth()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [qcm, setQcm] = useState(null)
  const [answers, setAnswers] = useState({}) // { [questionId]: number[] }
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState(null)

  useEffect(() => {
    setLoading(true)
    api
      .get(`/qcm/${token}`)
      .then(({ data }) => setQcm(data))
      .catch(() => setError("Ce lien de QCM n'est plus valide."))
      .finally(() => setLoading(false))
  }, [token])

  const toggleChoix = (questionId, choixId) => {
    setAnswers((prev) => {
      const current = prev[questionId] || []
      const next = current.includes(choixId) ? current.filter((id) => id !== choixId) : [...current, choixId]
      return { ...prev, [questionId]: next }
    })
  }

  const submit = async () => {
    setSubmitting(true)
    setError('')
    try {
      const reponses = qcm.questions.map((q) => ({ question_id: q.id, choix_ids: answers[q.id] || [] }))
      const { data } = await api.post(`/qcm/${token}/soumettre`, { reponses })
      setResult(data)
    } catch (err) {
      setError(err.response?.data?.message || "L'envoi du QCM a échoué.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F3F8FC', fontFamily: "'Inter', system-ui, sans-serif", color: colors.text }}>
      <div style={{ maxWidth: 680, margin: '0 auto', padding: '32px 20px 60px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <span style={{ fontWeight: 800, fontSize: 18, color: colors.primary }}>ESCGM</span>
          {user && (
            <span style={{ fontSize: 13, color: colors.textMuted }}>
              {user.prenom} {user.nom} · <button onClick={logout} style={{ border: 0, background: 'transparent', color: colors.primary, cursor: 'pointer', fontWeight: 700, padding: 0 }}>Déconnexion</button>
            </span>
          )}
        </div>

        {loading && <p style={{ color: colors.textMuted, fontSize: 14 }}>Chargement…</p>}

        {!loading && error && !qcm && (
          <div style={{ background: colors.white, border: `1px solid ${colors.border}`, borderRadius: 16, padding: 28, textAlign: 'center' }}>
            <p style={{ margin: 0, color: colors.danger, fontSize: 14 }}>{error}</p>
          </div>
        )}

        {qcm && !result && (
          <div style={{ background: colors.white, border: `1px solid ${colors.border}`, borderRadius: 16, padding: 26 }}>
            <h1 style={{ margin: '0 0 6px', fontSize: 22, fontWeight: 800 }}>{qcm.titre}</h1>
            <p style={{ margin: '0 0 22px', fontSize: 13, color: colors.textMuted }}>
              {qcm.questions.length} question(s) · {qcm.tentatives_restantes} tentative(s) restante(s) sur {qcm.nombre_tentatives}
            </p>

            {error && <div style={{ marginBottom: 16, color: colors.danger, fontSize: 14 }}>{error}</div>}

            {qcm.tentatives_restantes <= 0 ? (
              <p style={{ fontSize: 14, color: colors.danger, fontWeight: 600 }}>
                Vous avez déjà utilisé toutes vos tentatives pour ce QCM.
              </p>
            ) : (
              <>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                  {qcm.questions.map((q, qIndex) => (
                    <div key={q.id}>
                      <p style={{ margin: '0 0 10px', fontSize: 15, fontWeight: 700 }}>
                        {qIndex + 1}. {q.texte} <span style={{ color: colors.textMuted, fontWeight: 500, fontSize: 12.5 }}>({q.points} pt)</span>
                      </p>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {q.choix.map((c) => {
                          const checked = (answers[q.id] || []).includes(c.id)
                          return (
                            <label
                              key={c.id}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 10,
                                minHeight: 44,
                                padding: '0 14px',
                                border: `1.5px solid ${checked ? colors.primary : colors.border}`,
                                background: checked ? colors.primaryLight : colors.white,
                                borderRadius: 10,
                                cursor: 'pointer',
                              }}
                            >
                              <input type="checkbox" checked={checked} onChange={() => toggleChoix(q.id, c.id)} style={{ width: 16, height: 16 }} />
                              <span style={{ fontSize: 14 }}>{c.libelle}</span>
                            </label>
                          )
                        })}
                      </div>
                    </div>
                  ))}
                </div>

                <button onClick={submit} disabled={submitting} style={{ ...primaryBtnStyle, marginTop: 26, width: '100%', opacity: submitting ? 0.7 : 1 }}>
                  {submitting ? 'Envoi…' : 'Envoyer mes réponses'}
                </button>
              </>
            )}
          </div>
        )}

        {result && (
          <div style={{ background: colors.white, border: `1.5px solid ${result.reussite ? colors.success : colors.danger}`, borderRadius: 16, padding: 26 }}>
            <span
              style={{
                display: 'inline-block',
                padding: '4px 12px',
                borderRadius: 999,
                fontSize: 12.5,
                fontWeight: 800,
                marginBottom: 14,
                background: result.reussite ? '#DCFCE7' : colors.dangerBg,
                color: result.reussite ? colors.success : colors.danger,
              }}
            >
              {result.reussite ? 'Réussi' : 'Non atteint'}
            </span>
            <h2 style={{ margin: '0 0 6px', fontSize: 22, fontWeight: 800 }}>
              {result.points_obtenus} / {result.total_points} points
            </h2>
            <p style={{ margin: '0 0 20px', fontSize: 14, color: colors.textMuted }}>Score : {result.pourcentage} %</p>

            {result.afficher_correction && result.correction && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, borderTop: `1px solid ${colors.divider}`, paddingTop: 16 }}>
                {qcm.questions.map((q, qIndex) => {
                  const c = result.correction.find((r) => r.question_id === q.id)
                  return (
                    <p key={q.id} style={{ margin: 0, fontSize: 13.5, color: c.correct ? colors.success : colors.danger, fontWeight: 600 }}>
                      {qIndex + 1}. {q.texte} — {c.correct ? 'correct' : 'incorrect'}
                    </p>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

const primaryBtnStyle = {
  minHeight: 46,
  padding: '0 18px',
  border: 0,
  borderRadius: 10,
  background: colors.primary,
  color: colors.white,
  fontWeight: 700,
  fontSize: 14,
  cursor: 'pointer',
}
