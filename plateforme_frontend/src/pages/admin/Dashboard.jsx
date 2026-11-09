import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../api/axios'
import Badge from '../../components/Badge'
import { colors } from '../../theme'

const ACTIONS = [
  { to: '/admin/formations', label: 'Nouvelle formation', bg: colors.cardBlueBg, color: colors.primary, icon: <path d="M12 5v14M5 12h14" /> },
  { to: '/admin/utilisateurs', label: 'Ajouter un utilisateur', bg: colors.cardGreenBg, color: colors.success, icon: <path d="M16 20v-1a4 4 0 00-4-4H7a4 4 0 00-4 4v1M9.5 11a3.5 3.5 0 100-7 3.5 3.5 0 000 7M19 8v6M22 11h-6" /> },
  { to: '/admin/ressources', label: 'Importer une ressource', bg: colors.cardOrangeBg, color: colors.brandAmber, icon: <path d="M12 3v12m0 0l-4-4m4 4l4-4M4 17v2a2 2 0 002 2h12a2 2 0 002-2v-2" /> },
  { to: '/admin/qcm', label: 'Nouveau QCM', bg: '#EDE9FE', color: '#7C3AED', icon: <path d="M9 11l3 3 7-7M20 12a8 8 0 11-5-7.4" /> },
]

export default function Dashboard() {
  const [formations, setFormations] = useState(null)
  const [stats, setStats] = useState(null)

  useEffect(() => {
    api
      .get('/admin/formations')
      .then(({ data }) => setFormations(data))
      .catch(() => setFormations([]))

    api
      .get('/admin/resultats/stats')
      .then(({ data }) => setStats(data))
      .catch(() => setStats({ reussis: 0, en_cours: 0, echoues: 0, total: 0 }))
  }, [])

  const latest = (formations || []).slice(0, 3)
  const total = stats?.total || 0
  const pct = (n) => (total ? Math.round((n / total) * 100) : 0)

  return (
    <div>
      <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800 }}>Tableau de bord</h1>
      <p style={{ margin: '6px 0 0', color: colors.textMuted, fontSize: 14 }}>
        Bonjour, voici l'essentiel de la plateforme aujourd'hui.
      </p>

      <div style={{ display: 'flex', gap: 20, marginTop: 24, flexWrap: 'wrap' }}>
        <Card title="Taux de réussite aux QCM" style={{ flex: '1 1 380px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 28, marginTop: 8 }}>
            <Donut pct={total ? pct(stats.reussis) : null} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <LegendRow color={colors.brandTeal} label="Réussis" value={total ? `${pct(stats.reussis)} %` : '—'} />
              <LegendRow color={colors.brandAmber} label="En cours" value={total ? `${pct(stats.en_cours)} %` : '—'} />
              <LegendRow color={colors.danger} label="Échoués" value={total ? `${pct(stats.echoues)} %` : '—'} />
              <Link to="/admin/resultats" style={{ fontSize: 13, color: colors.primary, fontWeight: 600, textDecoration: 'none', marginTop: 4 }}>
                Voir les résultats →
              </Link>
            </div>
          </div>
          {!total && (
            <p style={{ margin: '14px 0 0', fontSize: 12.5, color: colors.textMuted }}>
              Pas encore de résultats de QCM enregistrés.
            </p>
          )}
        </Card>

        <Card title="Actions rapides" style={{ flex: '1 1 380px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginTop: 8 }}>
            {ACTIONS.map((a) => (
              <Link
                key={a.label}
                to={a.to}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 10,
                  padding: 16,
                  borderRadius: 14,
                  background: a.bg,
                  textDecoration: 'none',
                  color: colors.text,
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={a.color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  {a.icon}
                </svg>
                <span style={{ fontSize: 13.5, fontWeight: 700 }}>{a.label}</span>
              </Link>
            ))}
          </div>
        </Card>
      </div>

      <div style={{ display: 'flex', gap: 20, marginTop: 20, flexWrap: 'wrap' }}>
        <Card title="Dernières formations" link={{ to: '/admin/formations', label: 'Voir tout →' }} style={{ flex: '1 1 380px' }}>
          {latest.length === 0 ? (
            <EmptyRow text="Aucune formation pour l'instant." />
          ) : (
            latest.map((f) => (
              <div key={f.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderTop: `1px solid ${colors.divider}` }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>{f.titre}</div>
                  <div style={{ fontSize: 12.5, color: colors.textMuted }}>
                    mise à jour le {new Date(f.updated_at).toLocaleDateString('fr-FR')}
                  </div>
                </div>
                <Badge status={f.statut} />
              </div>
            ))
          )}
        </Card>

        <Card title="Derniers signalements" link={{ to: '/admin/signalements', label: 'Voir tout →' }} style={{ flex: '1 1 380px' }}>
          <EmptyRow text="Aucun signalement pour l'instant." />
        </Card>
      </div>
    </div>
  )
}

function Card({ title, link, style, children }) {
  return (
    <div style={{ ...style, background: colors.white, border: `1px solid ${colors.border}`, borderRadius: 16, padding: 20, boxSizing: 'border-box' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ margin: 0, fontSize: 16, fontWeight: 800 }}>{title}</h2>
        {link && (
          <Link to={link.to} style={{ fontSize: 13, color: colors.primary, fontWeight: 600, textDecoration: 'none' }}>
            {link.label}
          </Link>
        )}
      </div>
      {children}
    </div>
  )
}

function LegendRow({ color, label, value }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13.5 }}>
      <span style={{ width: 10, height: 10, borderRadius: 3, background: color }} />
      <span style={{ color: colors.textMuted }}>{label}</span>
      <span style={{ fontWeight: 700 }}>{value}</span>
    </div>
  )
}

function Donut({ pct }) {
  const ring =
    pct == null
      ? colors.divider
      : `conic-gradient(${colors.brandTeal} ${pct}%, ${colors.divider} 0)`

  return (
    <div
      style={{
        width: 110,
        height: 110,
        borderRadius: '50%',
        background: ring,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      <div
        style={{
          width: 80,
          height: 80,
          borderRadius: '50%',
          background: colors.white,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <span style={{ fontSize: 18, fontWeight: 800 }}>{pct == null ? '—' : `${pct} %`}</span>
        <span style={{ fontSize: 10.5, color: colors.textMuted }}>de réussite</span>
      </div>
    </div>
  )
}

function EmptyRow({ text }) {
  return <p style={{ margin: '16px 0 0', fontSize: 13.5, color: colors.textMuted }}>{text}</p>
}
