import { useEffect, useState } from 'react'
import api from '../../api/axios'
import Badge from '../../components/Badge'
import ConfirmDialog from '../../components/ConfirmDialog'
import Modal, { Field, inputStyle } from '../../components/Modal'
import { colors } from '../../theme'

const TABS = [
  { id: 'all', label: 'Toutes' },
  { id: 'Publiée', label: 'Publiées' },
  { id: 'Brouillon', label: 'Brouillons' },
  { id: 'Masquée', label: 'Masquées' },
  { id: 'Archivée', label: 'Archivées' },
]

const EMPTY_FORM = { titre: '', description: '', statut: 'Brouillon' }

export default function Formations() {
  const [formations, setFormations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [tab, setTab] = useState('all')
  const [search, setSearch] = useState('')
  const [kebabId, setKebabId] = useState(null)
  const [modal, setModal] = useState(null) // null | { mode: 'create'|'edit', id? }
  const [form, setForm] = useState(EMPTY_FORM)
  const [confirmId, setConfirmId] = useState(null)

  const load = () => {
    setLoading(true)
    api
      .get('/admin/formations')
      .then(({ data }) => setFormations(data))
      .catch(() => setError('Impossible de charger les formations.'))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  const visible = formations.filter((f) => {
    const matchesTab = tab === 'all' || f.statut === tab
    const matchesSearch = f.titre.toLowerCase().includes(search.toLowerCase())
    return matchesTab && matchesSearch
  })

  const openCreate = () => {
    setForm(EMPTY_FORM)
    setModal({ mode: 'create' })
  }

  const openEdit = (f) => {
    setForm({ titre: f.titre, description: f.description || '', statut: f.statut })
    setModal({ mode: 'edit', id: f.id })
    setKebabId(null)
  }

  const closeModal = () => setModal(null)

  const submitModal = async () => {
    try {
      if (modal.mode === 'create') {
        await api.post('/admin/formations', form)
      } else {
        await api.put(`/admin/formations/${modal.id}`, form)
      }
      closeModal()
      load()
    } catch {
      setError("L'enregistrement a échoué. Vérifiez les champs.")
    }
  }

  // Bascule rapide Publiée <-> Masquée depuis le menu ⋯, sans ouvrir la
  // fenêtre d'édition complète.
  const toggleStatut = async (f, nextStatut) => {
    setKebabId(null)
    await api.put(`/admin/formations/${f.id}`, { statut: nextStatut })
    load()
  }

  const confirmDelete = async () => {
    await api.delete(`/admin/formations/${confirmId}`)
    setConfirmId(null)
    load()
  }

  return (
    <div>
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          gap: 12,
          marginBottom: 16,
        }}
      >
        <div>
          <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800 }}>Toutes les formations</h1>
          <p style={{ margin: '6px 0 0', color: colors.textMuted, fontSize: 14 }}>
            Créez, publiez, masquez ou archivez les formations.
          </p>
        </div>
        <button
          onClick={openCreate}
          style={{
            minHeight: 44,
            padding: '0 18px',
            border: 0,
            borderRadius: 10,
            background: colors.primary,
            color: colors.white,
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          + Nouvelle formation
        </button>
      </div>

      {error && (
        <div style={{ marginBottom: 12, color: colors.danger, fontSize: 14 }}>{error}</div>
      )}

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
              {t.label}
            </button>
          ))}
        </div>
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filtrer les formations"
          aria-label="Filtrer les formations"
          style={{
            minHeight: 38,
            minWidth: 220,
            border: `1px solid ${colors.border}`,
            borderRadius: 10,
            padding: '0 12px',
            fontSize: 13,
            marginBottom: 6,
            fontFamily: 'inherit',
          }}
        />
      </div>

      <div style={{ background: colors.white, border: `1px solid ${colors.border}`, borderRadius: 16, overflowX: 'auto' }}>
        <table style={{ width: '100%', minWidth: 760, borderCollapse: 'collapse', fontSize: 14 }}>
          <thead>
            <tr
              style={{
                textAlign: 'left',
                background: colors.tableHead,
                color: colors.textMuted,
                fontSize: 12,
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}
            >
              <th style={{ padding: '12px 16px', fontWeight: 600 }}>Formation</th>
              <th style={{ padding: '12px 16px', fontWeight: 600 }}>Modules</th>
              <th style={{ padding: '12px 16px', fontWeight: 600 }}>Stagiaires</th>
              <th style={{ padding: '12px 16px', fontWeight: 600 }}>Statut</th>
              <th style={{ padding: '12px 16px' }}></th>
            </tr>
          </thead>
          <tbody>
            {visible.map((f) => (
              <tr key={f.id} style={{ borderTop: `1px solid ${colors.divider}` }}>
                <td style={{ padding: '14px 16px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontWeight: 700, color: colors.text, fontSize: 14 }}>{f.titre}</span>
                    <span style={{ fontSize: 12, color: colors.textMuted }}>
                      Mise à jour le {new Date(f.updated_at).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                </td>
                <td style={{ padding: '14px 16px' }}>{f.modules_count}</td>
                <td style={{ padding: '14px 16px' }}>{f.stagiaires_count}</td>
                <td style={{ padding: '14px 16px' }}>
                  <Badge status={f.statut} />
                </td>
                <td style={{ padding: '14px 16px', textAlign: 'right', position: 'relative' }}>
                  <button
                    onClick={() => setKebabId(kebabId === f.id ? null : f.id)}
                    aria-label="Actions"
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: 8,
                      border: `1px solid ${colors.border}`,
                      background: colors.white,
                      cursor: 'pointer',
                      fontWeight: 800,
                    }}
                  >
                    ⋯
                  </button>
                  {kebabId === f.id && (
                    <div
                      style={{
                        position: 'absolute',
                        right: 16,
                        top: 50,
                        zIndex: 20,
                        background: colors.white,
                        border: `1px solid ${colors.border}`,
                        borderRadius: 10,
                        boxShadow: '0 10px 24px rgba(15,30,61,0.14)',
                        padding: 4,
                        display: 'flex',
                        flexDirection: 'column',
                        minWidth: 200,
                        textAlign: 'left',
                      }}
                    >
                      <KebabItem onClick={() => openEdit(f)}>Modifier</KebabItem>
                      {f.statut === 'Publiée' ? (
                        <KebabItem onClick={() => toggleStatut(f, 'Masquée')}>Masquer</KebabItem>
                      ) : (
                        <KebabItem onClick={() => toggleStatut(f, 'Publiée')}>Publier</KebabItem>
                      )}
                      {f.statut === 'Archivée' ? (
                        <KebabItem onClick={() => toggleStatut(f, 'Brouillon')}>Désarchiver</KebabItem>
                      ) : (
                        <KebabItem onClick={() => toggleStatut(f, 'Archivée')}>Archiver</KebabItem>
                      )}
                      <KebabItem danger onClick={() => { setKebabId(null); setConfirmId(f.id) }}>
                        Supprimer
                      </KebabItem>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!loading && visible.length === 0 && (
          <div style={{ padding: 20, color: colors.textMuted, fontSize: 14 }}>
            Aucune formation dans cette catégorie.
          </div>
        )}
      </div>

      {modal && (
        <Modal
          title={modal.mode === 'create' ? 'Nouvelle formation' : 'Modifier la formation'}
          onClose={closeModal}
          onSubmit={submitModal}
          submitLabel={modal.mode === 'create' ? 'Créer' : 'Enregistrer'}
        >
          <Field label="Titre">
            <input
              type="text"
              required
              value={form.titre}
              onChange={(e) => setForm({ ...form, titre: e.target.value })}
              style={inputStyle}
            />
          </Field>
          <Field label="Description">
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              style={{ ...inputStyle, minHeight: 80, padding: 12, resize: 'vertical' }}
            />
          </Field>
          <Field label="Statut">
            <select
              value={form.statut}
              onChange={(e) => setForm({ ...form, statut: e.target.value })}
              style={{ ...inputStyle, background: colors.white }}
            >
              <option value="Brouillon">Brouillon</option>
              <option value="Publiée">Publiée</option>
              <option value="Masquée">Masquée</option>
              <option value="Archivée">Archivée</option>
            </select>
          </Field>
        </Modal>
      )}

      {confirmId && (
        <ConfirmDialog
          title="Supprimer la formation"
          text="Cette action est définitive et supprimera aussi ses modules et chapitres. Continuer ?"
          cta="Supprimer"
          onCancel={() => setConfirmId(null)}
          onConfirm={confirmDelete}
        />
      )}
    </div>
  )
}

function KebabItem({ children, danger, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        textAlign: 'left',
        minHeight: 38,
        padding: '0 12px',
        border: 0,
        background: 'transparent',
        cursor: 'pointer',
        fontSize: 13,
        color: danger ? colors.danger : colors.text,
      }}
    >
      {children}
    </button>
  )
}
