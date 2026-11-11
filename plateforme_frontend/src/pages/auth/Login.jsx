import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import api from '../../api/axios'
import { useAuth } from '../../auth/AuthContext'
import { espaceDe } from '../../auth/roles'
import { colors } from '../../theme'

const FEATURES = [
  {
    bg: colors.white,
    title: 'Des cours accessibles',
    text: 'Vidéos, documents et supports clairs',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={colors.primary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2zM22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z" />
      </svg>
    ),
  },
  {
    bg: colors.cardOrangeBg,
    title: 'Des exercices pour progresser',
    text: 'QCM et mises en situation',
    icon: (
      <div style={{ width: 28, height: 28, borderRadius: 8, background: colors.brandAmber, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={colors.white} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 7l2 2 4-4M3 17l2 2 4-4" />
          <line x1="13" y1="6" x2="21" y2="6" />
          <line x1="13" y1="18" x2="21" y2="18" />
        </svg>
      </div>
    ),
  },
  {
    bg: colors.cardGreenBg,
    title: 'Un suivi personnalisé',
    text: 'Avancez à votre rythme',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24">
        <rect x="2" y="13" width="4.5" height="9" rx="1" fill={colors.brandTeal} />
        <rect x="9.5" y="7" width="4.5" height="15" rx="1" fill={colors.brandTeal} />
        <rect x="17" y="2" width="4.5" height="20" rx="1" fill={colors.brandTeal} />
      </svg>
    ),
  },
]

export default function Login() {
  const [identifiant, setIdentifiant] = useState('')
  const [password, setPassword] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { data } = await api.post('/login', { email: identifiant, password })
      login(data.user, data.token)
      const destination = location.state?.from
        ? `${location.state.from.pathname}${location.state.from.search || ''}`
        : espaceDe(data.user)
      navigate(destination, { replace: true })
    } catch (err) {
      setError(err.response?.data?.message || 'Identifiants incorrects.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        width: '100%',
        minHeight: '100vh',
        fontFamily: "'Inter', system-ui, sans-serif",
        color: colors.text,
        background: 'linear-gradient(135deg, #EAF6F3 0%, #EEF3FC 55%, #F3F8FC 100%)',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 48,
        padding: '48px 6vw',
        boxSizing: 'border-box',
        textAlign: 'left',
      }}
    >
      {/* Panneau de gauche — présentation */}
      <div style={{ flex: '1 1 480px', maxWidth: 560 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 30 }}>
          <svg width="40" height="40" viewBox="0 0 24 24">
            <path d="M12 5C9.5 3.3 5.8 2.9 2 3.5v14.2c3.8-.6 7.5-.2 10 1.5z" fill={colors.brandTeal} />
            <path d="M12 5c2.5-1.7 6.2-2.1 10-1.5v14.2c-3.8-.6-7.5-.2-10 1.5z" fill={colors.brandSlate} />
          </svg>
          <div>
            <div style={{ fontWeight: 800, fontSize: 24, lineHeight: 1.1, color: colors.text }}>ESCGM</div>
            <div style={{ fontSize: 12.5, color: colors.brandSlate, lineHeight: 1.35 }}>
              École Supérieure de Commerce
              <br />
              et de Gestion de Mayotte
            </div>
          </div>
        </div>

        <h1 style={{ margin: 0, fontSize: 38, fontWeight: 800, lineHeight: 1.25, color: colors.text }}>
          Bienvenue sur votre Espace pédagogique
        </h1>
        <p style={{ marginTop: 14, fontSize: 15, color: colors.textMuted, lineHeight: 1.5, maxWidth: 460 }}>
          Apprenez, progressez et développez vos compétences avec des formations certifiantes.
        </p>

        <div style={{ display: 'flex', gap: 14, marginTop: 28, flexWrap: 'nowrap' }}>
          {FEATURES.map((f) => (
            <div
              key={f.title}
              style={{
                flex: '1 1 0',
                minWidth: 0,
                background: f.bg,
                borderRadius: 16,
                padding: 16,
                boxSizing: 'border-box',
              }}
            >
              <div style={{ marginBottom: 10 }}>{f.icon}</div>
              <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{f.title}</div>
              <div style={{ fontSize: 12.5, color: colors.textMuted, lineHeight: 1.4 }}>{f.text}</div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 40, position: 'relative', height: 170 }}>
          {/* Moniteur */}
          <div
            style={{
              position: 'absolute',
              left: 90,
              top: 0,
              width: 200,
              height: 120,
              borderRadius: 14,
              border: `3px solid ${colors.text}`,
              background: colors.white,
              padding: 10,
              boxSizing: 'border-box',
              display: 'flex',
              gap: 8,
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5, paddingTop: 2 }}>
              {[0, 1, 2, 3].map((i) => (
                <span key={i} style={{ width: 5, height: 5, borderRadius: '50%', background: colors.border, display: 'block' }} />
              ))}
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <div
                style={{
                  flex: 1,
                  borderRadius: 8,
                  background: colors.primary,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <div
                  style={{
                    width: 0,
                    height: 0,
                    borderTop: '9px solid transparent',
                    borderBottom: '9px solid transparent',
                    borderLeft: `14px solid ${colors.white}`,
                    marginLeft: 3,
                  }}
                />
              </div>
              <div style={{ display: 'flex', gap: 5, marginTop: 8 }}>
                <span style={{ flex: 1, height: 14, borderRadius: 4, background: colors.brandTeal }} />
                <span style={{ flex: 1, height: 14, borderRadius: 4, background: '#C4B5FD' }} />
                <span style={{ flex: 1, height: 14, borderRadius: 4, background: colors.brandAmber }} />
              </div>
            </div>
          </div>

          {/* Pied / surface */}
          <div
            style={{
              position: 'absolute',
              left: 0,
              top: 128,
              width: 330,
              height: 5,
              borderRadius: 3,
              background: colors.border,
            }}
          />

          {/* Pile de livres */}
          <div style={{ position: 'absolute', left: 0, top: 108, width: 75 }}>
            <div style={{ height: 11, borderRadius: '4px 4px 0 0', background: colors.brandTeal, marginBottom: 2 }} />
            <div style={{ height: 11, borderRadius: '0 0 4px 4px', background: colors.brandAmber }} />
          </div>

          {/* Plante */}
          <svg width="60" height="80" viewBox="0 0 60 80" style={{ position: 'absolute', left: 300, top: 48 }}>
            <rect x="18" y="58" width="16" height="16" rx="3" fill={colors.white} stroke={colors.border} strokeWidth="2" />
            <path
              d="M26 58c0-16-16-20-16-34 12 1 17 13 17 26M26 58c0-18 14-23 14-37-12 1-16 16-16 29"
              fill={colors.success}
              stroke={colors.success}
              strokeWidth="1"
            />
          </svg>

          {/* Casque */}
          <svg width="56" height="64" viewBox="0 0 56 64" style={{ position: 'absolute', left: 365, top: 58 }}>
            <path d="M6 36V26a22 22 0 0144 0v10" fill="none" stroke={colors.text} strokeWidth="4" strokeLinecap="round" />
            <rect x="1" y="32" width="11" height="18" rx="5" fill={colors.text} />
            <rect x="44" y="32" width="11" height="18" rx="5" fill={colors.text} />
          </svg>
        </div>
      </div>

      {/* Panneau de droite — formulaire */}
      <section
        style={{
          flex: '0 1 420px',
          width: '100%',
          maxWidth: 420,
          background: colors.white,
          borderRadius: 28,
          padding: '40px 36px',
          boxSizing: 'border-box',
          boxShadow: '0 20px 60px rgba(15,30,61,0.08)',
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
        }}
      >
        <div
          style={{
            alignSelf: 'center',
            width: 88,
            height: 88,
            borderRadius: '50%',
            background: colors.primaryLight,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <svg aria-hidden="true" width="46" height="46" viewBox="0 0 24 24" fill={colors.primary}>
            <circle cx="12" cy="7" r="3.2" />
            <circle cx="5.5" cy="8.5" r="2.4" />
            <circle cx="18.5" cy="8.5" r="2.4" />
            <path d="M6.5 19c0-3.6 2.4-6 5.5-6s5.5 2.4 5.5 6zM1.5 18.5c0-2.6 1.6-4.4 3.8-4.4 1 0 1.7.3 2.4.8-1 1.2-1.6 2.6-1.7 3.6zM22.5 18.5c0-2.6-1.6-4.4-3.8-4.4-1 0-1.7.3-2.4.8 1 1.2 1.6 2.6 1.7 3.6z" />
          </svg>
        </div>
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ margin: 0, fontSize: 28, fontWeight: 800 }}>Connexion</h2>
          <p style={{ margin: '6px 0 0', fontSize: 14.5, color: colors.textSoft }}>
            Accédez à votre espace personnel
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 7, fontSize: 13.5, fontWeight: 700 }}>
            Identifiant
            <span
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                minHeight: 50,
                border: `1.5px solid ${colors.border}`,
                borderRadius: 10,
                padding: '0 14px',
              }}
            >
              <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="1.8">
                <circle cx="12" cy="8" r="4" />
                <path d="M4 21c0-4 3.6-7 8-7s8 3 8 7" />
              </svg>
              <input
                type="text"
                required
                value={identifiant}
                onChange={(e) => setIdentifiant(e.target.value)}
                placeholder="Votre identifiant"
                style={{ flex: 1, border: 0, outline: 'none', fontSize: 14.5, fontFamily: 'inherit' }}
              />
            </span>
          </label>

          <label style={{ display: 'flex', flexDirection: 'column', gap: 7, fontSize: 13.5, fontWeight: 700 }}>
            Mot de passe
            <span
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                minHeight: 50,
                border: `1.5px solid ${colors.border}`,
                borderRadius: 10,
                padding: '0 14px',
              }}
            >
              <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="1.8">
                <rect x="5" y="10" width="14" height="11" rx="2" />
                <path d="M8 10V7a4 4 0 018 0v3" />
              </svg>
              <input
                type={showPwd ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Votre mot de passe"
                style={{ flex: 1, border: 0, outline: 'none', fontSize: 14.5, fontFamily: 'inherit' }}
              />
              <button
                type="button"
                onClick={() => setShowPwd((v) => !v)}
                aria-label="Afficher le mot de passe"
                style={{ border: 0, background: 'transparent', cursor: 'pointer', padding: 4 }}
              >
                <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="1.8">
                  <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              </button>
            </span>
          </label>

          <div style={{ textAlign: 'right' }}>
            <a href="#" style={{ fontSize: 13, color: colors.primary, textDecoration: 'none', fontWeight: 600 }}>
              Mot de passe oublié ?
            </a>
          </div>

          {error && <p style={{ margin: 0, color: colors.danger, fontSize: 14 }}>{error}</p>}

          <button
            type="submit"
            disabled={loading}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              minHeight: 50,
              border: 0,
              borderRadius: 10,
              background: colors.primary,
              color: colors.white,
              fontSize: 15,
              fontWeight: 700,
              cursor: loading ? 'default' : 'pointer',
              opacity: loading ? 0.7 : 1,
            }}
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={colors.white} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 3h6a2 2 0 012 2v14a2 2 0 01-2 2H9M15 12H3m0 0l4-4m-4 4l4 4" />
            </svg>
            {loading ? 'Connexion…' : 'Se connecter'}
          </button>

          <p style={{ margin: 0, fontSize: 12, color: colors.textMuted, fontStyle: 'italic', textAlign: 'center' }}>
            Prototype : saisissez « admin », « formateur » ou « stagiaire » comme identifiant.
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '2px 0' }}>
            <span style={{ flex: 1, height: 1, background: colors.divider }} />
            <span style={{ fontSize: 12, color: colors.textMuted }}>ou</span>
            <span style={{ flex: 1, height: 1, background: colors.divider }} />
          </div>

          <button
            type="button"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
              minHeight: 54,
              border: `1.5px solid ${colors.primary}`,
              borderRadius: 10,
              background: colors.white,
              color: colors.primary,
              cursor: 'pointer',
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={colors.primary} strokeWidth="1.8">
              <rect x="3" y="3" width="7" height="7" rx="1" />
              <rect x="14" y="3" width="7" height="7" rx="1" />
              <rect x="3" y="14" width="7" height="7" rx="1" />
              <path d="M14 14h3v3h-3zM19 14h2v2h-2zM14 19h2v2h-2zM19 19h2v2h-2z" />
            </svg>
            <span style={{ textAlign: 'left' }}>
              <span style={{ display: 'block', fontSize: 14, fontWeight: 700 }}>Se connecter avec un code</span>
              <span style={{ display: 'block', fontSize: 11.5, color: colors.textMuted, fontWeight: 400 }}>
                Si vous avez un code d'accès
              </span>
            </span>
          </button>
        </form>
      </section>
    </div>
  )
}
