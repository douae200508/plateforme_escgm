import { useMemo, useState } from 'react'
import { inputStyle } from '../../components/Modal'
import { colors } from '../../theme'

// Pur front pour l'instant (pas encore de contrôleur Résultat côté
// Laravel) — données d'exemple reprises de la maquette. Une seule
// formation a un jeu de données complet pour l'instant.
const FORMATIONS_INFO = {
  'Développement Web et Web Mobile': {
    modules: 3,
    chapitres: 12,
    qcms: 8,
    groupes: ['DWWM 2026'],
    stagiaires: [
      { nom: 'Yassine Benali', groupe: 'DWWM 2026', progression: 60, qcmPasses: 6, moyenne: 17 },
      { nom: 'Fatima Ahmed', groupe: 'DWWM 2026', progression: 72, qcmPasses: 7, moyenne: 15.5 },
      { nom: 'Kamal Abdou', groupe: 'DWWM 2026', progression: 45, qcmPasses: 4, moyenne: 12 },
      { nom: 'Naïma Youssouf', groupe: 'DWWM 2026', progression: 58, qcmPasses: 5, moyenne: 14 },
    ],
    tauxReussiteQcm: 75,
  },
  'Technicien Informatique': { modules: 0, chapitres: 0, qcms: 0, groupes: ['TIP 2026'], stagiaires: [], tauxReussiteQcm: 0 },
  'Conseiller en Insertion Professionnelle': { modules: 0, chapitres: 0, qcms: 0, groupes: ['CIP 2026'], stagiaires: [], tauxReussiteQcm: 0 },
}

const FORMATIONS = Object.keys(FORMATIONS_INFO)

function moyenneColor(m) {
  if (m >= 14) return colors.success
  if (m >= 10) return colors.primary
  return colors.danger
}

function formatMoyenne(m) {
  return m % 1 === 0 ? `${m}/20` : `${m.toString().replace('.', ',')}/20`
}

export default function Resultats() {
  const [formation, setFormation] = useState(FORMATIONS[0])
  const [groupe, setGroupe] = useState('all')
  const [search, setSearch] = useState('')

  const info = FORMATIONS_INFO[formation]

  const rows = useMemo(() => {
    return info.stagiaires.filter((s) => {
      const matchesGroupe = groupe === 'all' || s.groupe === groupe
      const matchesSearch = s.nom.toLowerCase().includes(search.toLowerCase())
      return matchesGroupe && matchesSearch
    })
  }, [info, groupe, search])

  const stagiairesSuivis = rows.length
  const progressionMoyenne = rows.length ? Math.round(rows.reduce((sum, s) => sum + s.progression, 0) / rows.length) : 0
  const moyenneGenerale = rows.length ? rows.reduce((sum, s) => sum + s.moyenne, 0) / rows.length : 0

  const exportCsv = () => {
    const header = ['Stagiaire', 'Groupe', 'Progression (%)', 'QCM passés', 'Moyenne'].join(';')
    const lines = rows.map((s) => [s.nom, s.groupe, s.progression, `${s.qcmPasses}/${info.qcms}`, formatMoyenne(s.moyenne)].join(';'))
    const csv = [header, ...lines].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `resultats_${formation.replace(/\s+/g, '_')}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div>
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-end', gap: 16, marginBottom: 20 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800 }}>Résultats et progression</h1>
          <p style={{ margin: '6px 0 0', color: colors.textMuted, fontSize: 14 }}>
            Recherche par formation, groupe ou stagiaire.
          </p>
        </div>
        <button onClick={exportCsv} style={outlineBtnStyle}>Exporter (CSV)</button>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, marginBottom: 16 }}>
        <Field label="Formation">
          <select
            value={formation}
            onChange={(e) => { setFormation(e.target.value); setGroupe('all') }}
            style={{ ...inputStyle, minWidth: 260, background: colors.white }}
          >
            {FORMATIONS.map((f) => (
              <option key={f} value={f}>{f}</option>
            ))}
          </select>
        </Field>
        <Field label="Groupe">
          <select value={groupe} onChange={(e) => setGroupe(e.target.value)} style={{ ...inputStyle, minWidth: 220, background: colors.white }}>
            <option value="all">Tous les groupes de la formation</option>
            {info.groupes.map((g) => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
        </Field>
        <Field label="Stagiaire">
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Nom du stagiaire" style={{ ...inputStyle, minWidth: 200 }} />
        </Field>
      </div>

      <div style={{ background: colors.primaryLight, border: `1px solid ${colors.primaryLighter}`, borderRadius: 12, padding: '12px 16px', marginBottom: 20, fontSize: 13 }}>
        <strong>Formation : {formation}</strong>
        <span style={{ color: colors.textSoft }}> · {info.modules} module(s) · {info.chapitres} chapitre(s) · {info.qcms} QCM · la progression correspond aux chapitres terminés de cette formation</span>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, marginBottom: 20 }}>
        <StatCard label="Stagiaires suivis" value={stagiairesSuivis} color={colors.text} />
        <StatCard label="Progression moyenne" value={`${progressionMoyenne} %`} color={colors.primary} />
        <StatCard label="Taux de réussite QCM" value={`${info.tauxReussiteQcm} %`} color={colors.success} />
        <StatCard label="Moyenne générale" value={formatMoyenne(Number(moyenneGenerale.toFixed(1)))} color="#7C3AED" />
      </div>

      <div style={{ background: colors.white, border: `1px solid ${colors.border}`, borderRadius: 16, overflowX: 'auto' }}>
        <table style={{ width: '100%', minWidth: 760, borderCollapse: 'collapse', fontSize: 14 }}>
          <thead>
            <tr style={{ textAlign: 'left', background: colors.tableHead, color: colors.textMuted, fontSize: 11.5, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              <th style={{ padding: '12px 16px', fontWeight: 600 }}>Stagiaire</th>
              <th style={{ padding: '12px 16px', fontWeight: 600 }}>Groupe</th>
              <th style={{ padding: '12px 16px', fontWeight: 600 }}>Progression</th>
              <th style={{ padding: '12px 16px', fontWeight: 600 }}>QCM passés</th>
              <th style={{ padding: '12px 16px', fontWeight: 600 }}>Moyenne</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((s) => (
              <tr key={s.nom} style={{ borderTop: `1px solid ${colors.divider}` }}>
                <td style={{ padding: '12px 16px', fontWeight: 700 }}>{s.nom}</td>
                <td style={{ padding: '12px 16px', color: colors.textMuted }}>{s.groupe}</td>
                <td style={{ padding: '12px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 120, height: 7, borderRadius: 4, background: colors.divider, overflow: 'hidden' }}>
                      <div style={{ width: `${s.progression}%`, height: '100%', background: colors.primary }} />
                    </div>
                    <span style={{ fontSize: 13, color: colors.textMuted }}>{s.progression} %</span>
                  </div>
                </td>
                <td style={{ padding: '12px 16px', color: colors.textMuted }}>{s.qcmPasses} / {info.qcms}</td>
                <td style={{ padding: '12px 16px', fontWeight: 700, color: moyenneColor(s.moyenne) }}>{formatMoyenne(s.moyenne)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 && (
          <div style={{ padding: 20, color: colors.textMuted, fontSize: 14 }}>Aucune donnée pour cette sélection.</div>
        )}
      </div>
    </div>
  )
}

function Field({ label, children }) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12.5, fontWeight: 700, color: colors.textMuted }}>
      {label}
      {children}
    </label>
  )
}

function StatCard({ label, value, color }) {
  return (
    <div style={{ flex: '1 1 200px', background: colors.white, border: `1px solid ${colors.border}`, borderRadius: 14, padding: '16px 18px' }}>
      <div style={{ fontSize: 12.5, color: colors.textMuted, fontWeight: 600, marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 24, fontWeight: 800, color }}>{value}</div>
    </div>
  )
}

const outlineBtnStyle = {
  minHeight: 42,
  padding: '0 16px',
  border: `1.5px solid ${colors.primary}`,
  borderRadius: 10,
  background: colors.white,
  color: colors.primary,
  fontWeight: 700,
  cursor: 'pointer',
  whiteSpace: 'nowrap',
}
