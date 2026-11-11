import { NavLink, Outlet, useLocation } from 'react-router-dom'
import Icon from '../components/Icon'
import { useAuth } from '../auth/AuthContext'
import { LIBELLE_ROLE } from '../auth/roles'
import { colors } from '../theme'

// Mise en page des espaces formateur et stagiaire : même apparence que
// AdminLayout (barre latérale, en-tête, cloche, avatar) pour que les trois
// espaces forment un seul site ; seul le menu change.
//
// nav : [{ id, label, icon, to, exact? }] — exact = actif seulement sur
// l'URL exacte (utile pour la page d'accueil de l'espace).
export default function EspaceLayout({ nav, ariaLabel, searchPlaceholder }) {
  const { user, logout } = useAuth()
  const location = useLocation()

  const isActive = (n) =>
    n.exact ? location.pathname === n.to : location.pathname.startsWith(n.to)

  return (
    <div
      style={{
        height: '100vh',
        overflow: 'hidden',
        background: colors.bg,
        fontFamily: "'Inter', system-ui, sans-serif",
        color: colors.text,
        display: 'flex',
        flexWrap: 'wrap',
      }}
    >
      <nav
        aria-label={ariaLabel}
        style={{
          flex: '1 1 220px',
          maxWidth: 240,
          height: '100%',
          overflowY: 'auto',
          background: colors.sidebar,
          color: colors.white,
          padding: '22px 12px',
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          gap: 3,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0 8px 26px' }}>
          <svg aria-hidden="true" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="1.6" strokeLinejoin="round">
            <path d="M12 2l9 5v10l-9 5-9-5V7z" />
            <path d="M3 7l9 5 9-5M12 12v10" />
          </svg>
          <span style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontWeight: 800, fontSize: 18 }}>ESCGM</span>
            <span style={{ fontSize: 11, color: colors.sidebarMuted }}>Espace pédagogique</span>
          </span>
        </div>

        {nav.map((n) => {
          const active = isActive(n)
          return (
            <NavLink
              key={n.id}
              to={n.to}
              end={n.exact}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                width: '100%',
                minHeight: 42,
                padding: '0 12px',
                borderRadius: 10,
                textDecoration: 'none',
                fontSize: 14,
                background: active ? colors.primary : 'transparent',
                color: active ? colors.white : colors.sidebarText,
                fontWeight: active ? 700 : 500,
                boxSizing: 'border-box',
              }}
            >
              <Icon path={n.icon} size={18} />
              <span style={{ flex: 1 }}>{n.label}</span>
            </NavLink>
          )
        })}

        <div style={{ marginTop: 48, padding: '0 8px' }}>
          <p style={{ margin: 0, fontSize: 13, color: colors.sidebarText }}>
            {user?.prenom} {user?.nom}
          </p>
          <button
            onClick={logout}
            style={{
              marginTop: 8,
              border: 0,
              background: 'transparent',
              color: '#FCA5A5',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              padding: 0,
            }}
          >
            Déconnexion
          </button>
        </div>
      </nav>

      <div style={{ flex: '999 1 640px', minWidth: 0, height: '100%', display: 'flex', flexDirection: 'column' }}>
        <header
          style={{
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            gap: 20,
            padding: '16px 30px',
            background: colors.white,
            borderBottom: `1px solid ${colors.border}`,
          }}
        >
          <div
            style={{
              flex: 1,
              maxWidth: 440,
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              minHeight: 42,
              border: `1px solid ${colors.border}`,
              borderRadius: 10,
              padding: '0 14px',
              background: colors.bg,
            }}
          >
            <svg aria-hidden="true" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={colors.textMuted} strokeWidth="2">
              <circle cx="11" cy="11" r="7" />
              <path d="M21 21l-4.3-4.3" />
            </svg>
            <input
              type="search"
              aria-label="Rechercher"
              placeholder={searchPlaceholder}
              style={{ flex: 1, border: 0, outline: 'none', background: 'transparent', fontSize: 13.5, fontFamily: 'inherit' }}
            />
          </div>

          <div style={{ flex: 1 }} />

          {/* Cloche : branchée sur les notifications à l'étape Messages. */}
          <button
            aria-label="Notifications"
            style={{ position: 'relative', border: 0, background: 'transparent', cursor: 'pointer', padding: 6 }}
          >
            <svg aria-hidden="true" width="21" height="21" viewBox="0 0 24 24" fill="none" stroke={colors.text} strokeWidth="1.8">
              <path d="M6 10a6 6 0 0112 0c0 4 1.5 5.5 2 6H4c.5-.5 2-2 2-6z" />
              <path d="M10 20a2 2 0 004 0" />
            </svg>
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              aria-hidden="true"
              style={{
                width: 38,
                height: 38,
                borderRadius: '50%',
                background: colors.primaryLight,
                color: colors.primary,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: 13,
              }}
            >
              {user?.prenom?.[0]}{user?.nom?.[0]}
            </div>
            <span style={{ lineHeight: 1.25 }}>
              <span style={{ display: 'block', fontSize: 13.5, fontWeight: 700 }}>
                {user?.prenom} {user?.nom}
              </span>
              <span style={{ display: 'block', fontSize: 11.5, color: colors.textMuted }}>
                {LIBELLE_ROLE[user?.role]}
              </span>
            </span>
          </div>
        </header>

        <main style={{ flex: 1, overflowY: 'auto', padding: '24px 30px 48px', boxSizing: 'border-box' }}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}
