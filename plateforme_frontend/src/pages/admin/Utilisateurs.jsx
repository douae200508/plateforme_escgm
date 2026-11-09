import { useRef, useState } from 'react'
import Badge from '../../components/Badge'
import ConfirmDialog from '../../components/ConfirmDialog'
import Modal, { Field, inputStyle } from '../../components/Modal'
import { colors } from '../../theme'

// Pur front pour l'instant (pas encore de contrôleur Utilisateur côté
// Laravel) — données d'exemple reprises de la maquette.
const GROUPES = ['DWWM 2026', 'TIP 2026', 'CIP 2026']
const ROLES = ['Administrateur', 'Formateur', 'Stagiaire']

const ROLE_STYLE = {
  Administrateur: { bg: colors.primaryLight, color: colors.primary },
  Formateur: { bg: colors.cardGreenBg, color: colors.success },
  Stagiaire: { bg: colors.cardOrangeBg, color: colors.brandAmber },
}

const INITIAL_USERS = [
  { id: 1, prenom: 'Admin', nom: 'ESCGM', email: 'admin@escgm.fr', role: 'Administrateur', groupe: null, statut: 'Actif' },
  { id: 2, prenom: 'Sophie', nom: 'Martin', email: 'sophie@escgm.fr', role: 'Formateur', groupe: 'DWWM 2026', statut: 'Actif' },
  { id: 3, prenom: 'Karim', nom: 'Ali', email: 'karim.ali@escgm.fr', role: 'Formateur', groupe: 'TIP 2026', statut: 'Actif' },
  { id: 4, prenom: 'Mariam', nom: 'Abdallah', email: 'mariam.abdallah@escgm.fr', role: 'Formateur', groupe: 'CIP 2026', statut: 'Actif' },
  { id: 5, prenom: 'Thomas', nom: 'Leroy', email: 'thomas.leroy@escgm.fr', role: 'Formateur', groupe: null, statut: 'Suspendu' },
  { id: 6, prenom: 'Yassine', nom: 'Benali', email: 'yassine.benali@escgm.fr', role: 'Stagiaire', groupe: 'DWWM 2026', statut: 'Actif' },
  { id: 7, prenom: 'Fatima', nom: 'Ahmed', email: 'fatima.ahmed@escgm.fr', role: 'Stagiaire', groupe: 'DWWM 2026', statut: 'Actif' },
  { id: 8, prenom: 'Kamal', nom: 'Abdou', email: 'kamal.abdou@escgm.fr', role: 'Stagiaire', groupe: 'DWWM 2026', statut: 'Actif' },
  { id: 9, prenom: 'Naïma', nom: 'Youssouf', email: 'naima.youssouf@escgm.fr', role: 'Stagiaire', groupe: 'DWWM 2026', statut: 'Actif' },
  { id: 10, prenom: 'Hakim', nom: 'Saïd', email: 'hakim.said@escgm.fr', role: 'Stagiaire', groupe: 'TIP 2026', statut: 'Actif' },
  { id: 11, prenom: 'Amina', nom: 'Said', email: 'amina.said@escgm.fr', role: 'Stagiaire', groupe: 'TIP 2026', statut: 'Suspendu' },
  { id: 12, prenom: 'Nadia', nom: 'Combo', email: 'nadia.combo@escgm.fr', role: 'Stagiaire', groupe: 'CIP 2026', statut: 'Actif' },
  { id: 13, prenom: 'Saïd', nom: 'Abdillah', email: 'said.abdillah@escgm.fr', role: 'Stagiaire', groupe: 'CIP 2026', statut: 'Actif' },
]

const TABS = [
  { id: 'Tous', label: 'Tous' },
  { id: 'Administrateur', label: 'Administrateurs' },
  { id: 'Formateur', label: 'Formateurs' },
  { id: 'Stagiaire', label: 'Stagiaires' },
  { id: 'Suspendus', label: 'Suspendus' },
]

const EMPTY_FORM = { prenom: '', nom: '', email: '', role: 'Stagiaire', groupe: GROUPES[0] }

let nextId = 100

export default function Utilisateurs() {
  const [users, setUsers] = useState(INITIAL_USERS)
  const [tab, setTab] = useState('Tous')
  const [search, setSearch] = useState('')
  const [modal, setModal] = useState(null) // { mode: 'create' | 'edit', id? }
  const [form, setForm] = useState(EMPTY_FORM)
  const [toDelete, setToDelete] = useState(null)
  const [importOpen, setImportOpen] = useState(false)
  const [importFile, setImportFile] = useState(null)
  const importInputRef = useRef(null)

  const counts = {
    Tous: users.length,
    Administrateur: users.filter((u) => u.role === 'Administrateur').length,
    Formateur: users.filter((u) => u.role === 'Formateur').length,
    Stagiaire: users.filter((u) => u.role === 'Stagiaire').length,
    Suspendus: users.filter((u) => u.statut === 'Suspendu').length,
  }

  const visible = users.filter((u) => {
    const matchesTab = tab === 'Tous' ? true : tab === 'Suspendus' ? u.statut === 'Suspendu' : u.role === tab
    const q = search.toLowerCase()
    const matchesSearch = `${u.prenom} ${u.nom}`.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
    return matchesTab && matchesSearch
  })

  const openCreate = () => {
    setForm(EMPTY_FORM)
    setModal({ mode: 'create' })
  }

  const openEdit = (u) => {
    setForm({ prenom: u.prenom, nom: u.nom, email: u.email, role: u.role, groupe: u.groupe || GROUPES[0] })
    setModal({ mode: 'edit', id: u.id })
  }

  const closeModal = () => setModal(null)

  const submitModal = () => {
    const groupe = form.role === 'Administrateur' ? null : form.groupe
    if (modal.mode === 'create') {
      setUsers((prev) => [...prev, { id: nextId++, ...form, groupe, statut: 'Actif' }])
    } else {
      setUsers((prev) => prev.map((u) => (u.id === modal.id ? { ...u, ...form, groupe } : u)))
    }
    closeModal()
  }

  const toggleStatut = (u) => {
    setUsers((prev) => prev.map((x) => (x.id === u.id ? { ...x, statut: x.statut === 'Actif' ? 'Suspendu' : 'Actif' } : x)))
  }

  const confirmDelete = () => {
    setUsers((prev) => prev.filter((u) => u.id !== toDelete.id))
    setToDelete(null)
  }

  const submitImport = () => {
    // Démonstration front : en l'absence de lecture réelle du fichier
    // (ça viendra avec le backend), on ajoute trois comptes fictifs pour
    // montrer le résultat d'un import.
    const demo = [
      { prenom: 'Issa', nom: 'Moussa', email: 'issa.moussa@escgm.fr', role: 'Stagiaire', groupe: GROUPES[0] },
      { prenom: 'Zaïna', nom: 'Hamada', email: 'zaina.hamada@escgm.fr', role: 'Stagiaire', groupe: GROUPES[0] },
      { prenom: 'Rachid', nom: 'Soidiki', email: 'rachid.soidiki@escgm.fr', role: 'Formateur', groupe: GROUPES[1] },
    ].map((u) => ({ id: nextId++, ...u, statut: 'Actif' }))
    setUsers((prev) => [...prev, ...demo])
    setImportOpen(false)
    setImportFile(null)
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
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={() => setImportOpen(true)} style={outlineBtnStyle}>Importer un fichier</button>
          <button onClick={openCreate} style={primaryBtnStyle}>+ Ajouter un utilisateur</button>
        </div>
      </div>

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
              const suspended = u.statut === 'Suspendu'
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
                  <td style={{ padding: '12px 16px' }}>{u.role}</td>
                  <td style={{ padding: '12px 16px', color: u.groupe ? colors.text : colors.textMuted }}>{u.groupe || '—'}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <Badge status={u.statut} />
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
              {ROLES.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </Field>
          {form.role !== 'Administrateur' && (
            <Field label="Groupe">
              <select value={form.groupe} onChange={(e) => setForm({ ...form, groupe: e.target.value })} style={{ ...inputStyle, background: colors.white }}>
                {GROUPES.map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </Field>
          )}
        </Modal>
      )}

      {importOpen && (
        <Modal title="Importer des comptes" onClose={() => setImportOpen(false)} onSubmit={submitImport} submitLabel="Importer">
          <Field label="Fichier CSV ou Excel">
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                border: `1.5px dashed ${colors.border}`,
                borderRadius: 10,
                padding: 12,
              }}
            >
              <input ref={importInputRef} type="file" accept=".csv,.xlsx,.xls" style={{ display: 'none' }} onChange={(e) => setImportFile(e.target.files?.[0] || null)} />
              <button type="button" onClick={() => importInputRef.current?.click()} style={chooseFileBtnStyle}>Choisir un fichier</button>
              <span style={{ fontSize: 13, color: colors.textMuted }}>{importFile ? importFile.name : "Aucun fichier n'a été sélectionné"}</span>
            </div>
          </Field>
          <p style={{ margin: 0, fontSize: 12.5, color: colors.textMuted, lineHeight: 1.6 }}>
            Colonnes attendues : nom, adresse électronique, rôle, groupe.
            <br />
            Démonstration : trois comptes fictifs seront ajoutés.
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

const outlineBtnStyle = {
  minHeight: 42,
  padding: '0 16px',
  border: `1px solid ${colors.border}`,
  borderRadius: 10,
  background: colors.white,
  color: colors.text,
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
