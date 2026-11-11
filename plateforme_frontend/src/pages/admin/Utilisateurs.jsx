import { useEffect, useState } from 'react'
import api from '../../api/axios'
import Badge from '../../components/Badge'
import ConfirmDialog from '../../components/ConfirmDialog'
import Modal, { Field, inputStyle } from '../../components/Modal'
import { colors } from '../../theme'

const ROLE_LABELS = { admin: 'Administrateur', formateur: 'Formateur', stagiaire: 'Stagiaire' }
const ROLE_STYLE = {
  admin: { bg: colors.primaryLight, color: colors.primary },
  formateur: { bg: colors.cardGreenBg, color: colors.success },
  stagiaire: { bg: colors.cardOrangeBg, color: colors.brandAmber },
}

const TABS = [
  { id: 'Tous', label: 'Tous' },
  { id: 'admin', label: 'Administrateurs' },
  { id: 'formateur', label: 'Formateurs' },
  { id: 'stagiaire', label: 'Stagiaires' },
  { id: 'Suspendus', label: 'Suspendus' },
]

const EMPTY_FORM = { prenom: '', nom: '', email: '', role: 'stagiaire', groupe_id: '' }

export default function Utilisateurs() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [users, setUsers] = useState([])
  const [groupes, setGroupes] = useState([])
  const [tab, setTab] = useState('Tous')
  const [search, setSearch] = useState('')
  const [modal, setModal] = useState(null) // { mode: 'create' | 'edit', id? }
  const [form, setForm] = useState(EMPTY_FORM)
  const [toDelete, setToDelete] = useState(null)
  const [generatedPassword, setGeneratedPassword] = useState(null)

  useEffect(() => {
    setLoading(true)
    Promise.all([api.get('/admin/users'), api.get('/admin/groupes')])
      .then(([usersRes, groupesRes]) => {
        setUsers(usersRes.data)
        setGroupes(groupesRes.data)
      })
      .catch(() => setError('Impossible de charger les utilisateurs.'))
      .finally(() => setLoading(false))
  }, [])

  const counts = {
    Tous: users.length,
    admin: users.filter((u) => u.role === 'admin').length,
    formateur: users.filter((u) => u.role === 'formateur').length,
    stagiaire: users.filter((u) => u.role === 'stagiaire').length,
    Suspendus: users.filter((u) => !u.actif).length,
  }

  const visible = users.filter((u) => {
    const matchesTab = tab === 'Tous' ? true : tab === 'Suspendus' ? !u.actif : u.role === tab
    const q = search.toLowerCase()
    const matchesSearch = `${u.prenom} ${u.nom}`.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
    return matchesTab && matchesSearch
  })

  const openCreate = () => {
    setForm({ ...EMPTY_FORM, groupe_id: groupes[0]?.id || '' })
    setModal({ mode: 'create' })
  }

  const openEdit = (u) => {
    setForm({ prenom: u.prenom, nom: u.nom, email: u.email, role: u.role, groupe_id: u.groupe_id || groupes[0]?.id || '' })
    setModal({ mode: 'edit', id: u.id })
  }

  const closeModal = () => setModal(null)

  const submitModal = async () => {
    const groupe_id = form.role === 'admin' ? null : (form.groupe_id || null)
    try {
      if (modal.mode === 'create') {
        const { data } = await api.post('/admin/users', { nom: form.nom, prenom: form.prenom, email: form.email, role: form.role, groupe_id })
        setUsers((prev) => [...prev, data.user])
        setGeneratedPassword({ nom: `${data.user.prenom} ${data.user.nom}`, mot_de_passe: data.mot_de_passe_genere })
      } else {
        const { data } = await api.put(`/admin/users/${modal.id}`, { nom: form.nom, prenom: form.prenom, email: form.email, role: form.role, groupe_id })
        setUsers((prev) => prev.map((u) => (u.id === data.id ? data : u)))
      }
      closeModal()
    } catch {
      setError("L'enregistrement de l'utilisateur a échoué.")
    }
  }

  const toggleStatut = async (u) => {
    const { data } = await api.put(`/admin/users/${u.id}`, { actif: !u.actif })
    setUsers((prev) => prev.map((x) => (x.id === u.id ? data : x)))
  }

  const confirmDelete = async () => {
    try {
      await api.delete(`/admin/users/${toDelete.id}`)
      setUsers((prev) => prev.filter((u) => u.id !== toDelete.id))
      setToDelete(null)
    } catch {
      setError("La suppression a échoué (vous ne pouvez pas supprimer votre propre compte).")
      setToDelete(null)
    }
  }

  if (loading) {
    return <p style={{ color: colors.textMuted, fontSize: 14 }}>Chargement…</p>
  }

  return (
    <div>
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-end', gap: 16, marginBottom: 20 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800 }}>Utilisateurs</h1>
          <p style={{ margin: '6px 0 0', color: colors.textMuted, fontSize: 14 }}>
            Comptes, rôles, groupes, activation et suspension.
          </p>
        </div>
        <button onClick={openCreate} style={primaryBtnStyle}>+ Ajouter un utilisateur</button>
      </div>

      {error && <div style={{ margin: '0 0 16px', color: colors.danger, fontSize: 14 }}>{error}</div>}

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
          {TABS.map((t) => (
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
              {t.label} ({counts[t.id]})
            </button>
          ))}
        </div>
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Nom ou adresse électronique"
          aria-label="Rechercher un utilisateur"
          style={{ minHeight: 38, minWidth: 240, border: `1px solid ${colors.border}`, borderRadius: 10, padding: '0 12px', fontSize: 13, marginBottom: 6, fontFamily: 'inherit' }}
        />
      </div>

      <div style={{ background: colors.white, border: `1px solid ${colors.border}`, borderRadius: 16, overflowX: 'auto' }}>
        <table style={{ width: '100%', minWidth: 820, borderCollapse: 'collapse', fontSize: 14 }}>
          <thead>
            <tr style={{ textAlign: 'left', background: colors.tableHead, color: colors.textMuted, fontSize: 11.5, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              <th style={{ padding: '12px 16px', fontWeight: 600 }}>Utilisateur</th>
              <th style={{ padding: '12px 16px', fontWeight: 600 }}>Rôle</th>
              <th style={{ padding: '12px 16px', fontWeight: 600 }}>Groupe</th>
              <th style={{ padding: '12px 16px', fontWeight: 600 }}>Statut</th>
              <th style={{ padding: '12px 16px' }}></th>
            </tr>
          </thead>
          <tbody>
            {visible.map((u) => {
              const suspended = !u.actif
              const roleStyle = ROLE_STYLE[u.role]
              return (
                <tr key={u.id} style={{ borderTop: `1px solid ${colors.divider}` }}>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, opacity: suspended ? 0.6 : 1 }}>
                      <span
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: '50%',
                          background: roleStyle.bg,
                          color: roleStyle.color,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 800,
                          fontSize: 12,
                          flexShrink: 0,
                        }}
                      >
                        {u.prenom[0]}{u.nom[0]}
                      </span>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 14 }}>{u.prenom} {u.nom}</div>
                        <div style={{ fontSize: 12, color: colors.textMuted }}>{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px' }}>{ROLE_LABELS[u.role]}</td>
                  <td style={{ padding: '12px 16px', color: u.groupe ? colors.text : colors.textMuted }}>{u.groupe?.nom || '—'}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <Badge status={suspended ? 'Suspendu' : 'Actif'} />
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', flexWrap: 'nowrap' }}>
                      <SmallButton onClick={() => openEdit(u)}>Modifier</SmallButton>
                      {suspended ? (
                        <SmallButton variant="success" onClick={() => toggleStatut(u)}>Activer</SmallButton>
                      ) : (
                        <SmallButton variant="warning" onClick={() => toggleStatut(u)}>Suspendre</SmallButton>
                      )}
                      <SmallButton variant="danger" onClick={() => setToDelete(u)}>Supprimer</SmallButton>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {visible.length === 0 && (
          <div style={{ padding: 20, color: colors.textMuted, fontSize: 14 }}>Aucun utilisateur dans cette catégorie.</div>
        )}
      </div>

      {modal && (
        <Modal
          title={modal.mode === 'create' ? 'Ajouter un utilisateur' : 'Modifier l’utilisateur'}
          onClose={closeModal}
          onSubmit={submitModal}
          submitLabel={modal.mode === 'create' ? 'Ajouter' : 'Enregistrer'}
        >
          <Field label="Prénom">
            <input type="text" required autoFocus value={form.prenom} onChange={(e) => setForm({ ...form, prenom: e.target.value })} style={inputStyle} />
          </Field>
          <Field label="Nom">
            <input type="text" required value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} style={inputStyle} />
          </Field>
          <Field label="Adresse électronique">
            <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} style={inputStyle} />
          </Field>
          <Field label="Rôle">
            <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} style={{ ...inputStyle, background: colors.white }}>
              {Object.entries(ROLE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </Field>
          {form.role !== 'admin' && (
            <Field label="Groupe">
              <select value={form.groupe_id} onChange={(e) => setForm({ ...form, groupe_id: Number(e.target.value) })} style={{ ...inputStyle, background: colors.white }}>
                <option value="">Aucun groupe</option>
                {groupes.map((g) => (
                  <option key={g.id} value={g.id}>{g.nom}</option>
                ))}
              </select>
            </Field>
          )}
        </Modal>
      )}

      {generatedPassword && (
        <Modal title="Compte créé" onClose={() => setGeneratedPassword(null)} onSubmit={() => setGeneratedPassword(null)} submitLabel="Fermer">
          <p style={{ margin: '0 0 10px', fontSize: 13.5 }}>
            Mot de passe temporaire pour <strong>{generatedPassword.nom}</strong> (à communiquer, il n'est affiché qu'une seule fois) :
          </p>
          <p style={{ margin: 0, padding: 12, background: colors.primaryLight, borderRadius: 10, fontFamily: 'monospace', fontSize: 15, fontWeight: 700, textAlign: 'center' }}>
            {generatedPassword.mot_de_passe}
          </p>
        </Modal>
      )}

      {toDelete && (
        <ConfirmDialog
          title="Supprimer l'utilisateur"
          text={`« ${toDelete.prenom} ${toDelete.nom} » sera définitivement supprimé(e). Continuer ?`}
          cta="Supprimer"
          onCancel={() => setToDelete(null)}
          onConfirm={confirmDelete}
        />
      )}
    </div>
  )
}

function SmallButton({ onClick, variant = 'default', children }) {
  const styles = {
    default: { background: colors.white, color: colors.text, border: `1px solid ${colors.border}` },
    warning: { background: '#FEF3C7', color: '#92400E', border: 0 },
    success: { background: '#DCFCE7', color: colors.success, border: 0 },
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
