import { useRef, useState } from 'react'
import { inputStyle } from '../../components/Modal'
import { colors } from '../../theme'

// Pur front pour l'instant (pas encore de contrôleur Paramètre côté
// Laravel) — valeurs d'exemple reprises de la maquette.
const TABS = ['Général', 'Sécurité', 'Notifications']

export default function Parametres() {
  const [tab, setTab] = useState('Général')
  const [saved, setSaved] = useState(false)

  const [general, setGeneral] = useState({
    nom: 'ESCGM – Espace pédagogique',
    logo: null,
    texteAccueil: 'Bienvenue sur votre Espace pédagogique',
    email: 'contact@escgm.fr',
    adresse: 'Mamoudzou, Mayotte',
  })

  const [securite, setSecurite] = useState({
    doubleAuth: true,
    motsDePasseRenforces: true,
    blocageApresEchecs: true,
  })

  const [notifications, setNotifications] = useState({
    nouveauxInscrits: true,
    nouveauxSignalements: true,
    syntheseHebdomadaire: false,
  })

  const logoInputRef = useRef(null)

  const save = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div>
      <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800 }}>Paramètres</h1>
      <p style={{ margin: '6px 0 0', color: colors.textMuted, fontSize: 14 }}>
        Logo, nom de la plateforme, couleurs, textes d'accueil et informations générales.
      </p>

      <div style={{ display: 'flex', gap: 22, borderBottom: `1px solid ${colors.border}`, margin: '18px 0 20px' }}>
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

      {tab === 'Général' && (
        <div style={{ background: colors.white, border: `1px solid ${colors.border}`, borderRadius: 16, padding: 24, maxWidth: 600, display: 'flex', flexDirection: 'column', gap: 18 }}>
          <Field label="Nom de la plateforme">
            <input type="text" value={general.nom} onChange={(e) => setGeneral({ ...general, nom: e.target.value })} style={inputStyle} />
          </Field>

          <Field label="Logo">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ width: 38, height: 38, borderRadius: 9, background: colors.sidebar, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="1.6" strokeLinejoin="round">
                  <path d="M12 2l9 5v10l-9 5-9-5V7z" />
                  <path d="M3 7l9 5 9-5M12 12v10" />
                </svg>
              </span>
              <input ref={logoInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => setGeneral({ ...general, logo: e.target.files?.[0] || null })} />
              <button type="button" onClick={() => logoInputRef.current?.click()} style={chooseFileBtnStyle}>Choisir un fichier</button>
              <span style={{ fontSize: 13, color: colors.textMuted }}>{general.logo ? general.logo.name : "Aucun fichier n'a été sélectionné"}</span>
            </div>
          </Field>

          <Field label="Texte d'accueil (page de connexion)">
            <textarea
              value={general.texteAccueil}
              onChange={(e) => setGeneral({ ...general, texteAccueil: e.target.value })}
              rows={3}
              style={{ ...inputStyle, minHeight: 'unset', padding: 12, resize: 'vertical', lineHeight: 1.5 }}
            />
          </Field>

          <Field label="Adresse électronique de contact">
            <input type="email" value={general.email} onChange={(e) => setGeneral({ ...general, email: e.target.value })} style={inputStyle} />
          </Field>

          <Field label="Adresse">
            <input type="text" value={general.adresse} onChange={(e) => setGeneral({ ...general, adresse: e.target.value })} style={inputStyle} />
          </Field>

          <SaveRow saved={saved} onSave={save} />
        </div>
      )}

      {tab === 'Sécurité' && (
        <div style={{ background: colors.white, border: `1px solid ${colors.border}`, borderRadius: 16, padding: 24, maxWidth: 600, display: 'flex', flexDirection: 'column', gap: 18 }}>
          <ToggleRow
            title="Double authentification des administrateurs"
            subtitle="Code envoyé par courriel à la connexion"
            checked={securite.doubleAuth}
            onChange={(v) => setSecurite({ ...securite, doubleAuth: v })}
          />
          <ToggleRow
            title="Mots de passe renforcés"
            subtitle="10 caractères minimum, chiffres et majuscules"
            checked={securite.motsDePasseRenforces}
            onChange={(v) => setSecurite({ ...securite, motsDePasseRenforces: v })}
          />
          <ToggleRow
            title="Blocage après 5 échecs"
            subtitle="Compte bloqué 15 minutes"
            checked={securite.blocageApresEchecs}
            onChange={(v) => setSecurite({ ...securite, blocageApresEchecs: v })}
          />
          <SaveRow saved={saved} onSave={save} />
        </div>
      )}

      {tab === 'Notifications' && (
        <div style={{ background: colors.white, border: `1px solid ${colors.border}`, borderRadius: 16, padding: 24, maxWidth: 600, display: 'flex', flexDirection: 'column', gap: 18 }}>
          <ToggleRow
            title="Nouveaux inscrits"
            subtitle="Courriel à chaque création de compte"
            checked={notifications.nouveauxInscrits}
            onChange={(v) => setNotifications({ ...notifications, nouveauxInscrits: v })}
          />
          <ToggleRow
            title="Nouveaux signalements"
            subtitle="Courriel dès qu'un formateur envoie un signalement"
            checked={notifications.nouveauxSignalements}
            onChange={(v) => setNotifications({ ...notifications, nouveauxSignalements: v })}
          />
          <ToggleRow
            title="Synthèse hebdomadaire"
            subtitle="Résultats et progression chaque lundi"
            checked={notifications.syntheseHebdomadaire}
            onChange={(v) => setNotifications({ ...notifications, syntheseHebdomadaire: v })}
          />
          <SaveRow saved={saved} onSave={save} />
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

function ToggleRow({ title, subtitle, checked, onChange }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
      <div>
        <div style={{ fontSize: 14, fontWeight: 700 }}>{title}</div>
        <div style={{ fontSize: 12.5, color: colors.textMuted, marginTop: 2 }}>{subtitle}</div>
      </div>
      <Toggle checked={checked} onChange={onChange} />
    </div>
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
        width: 42,
        height: 23,
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
      <span style={{ width: 19, height: 19, borderRadius: '50%', background: colors.white, boxShadow: '0 1px 2px rgba(0,0,0,0.25)', display: 'block' }} />
    </button>
  )
}

function SaveRow({ saved, onSave }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <button onClick={onSave} style={primaryBtnStyle}>Enregistrer les paramètres</button>
      {saved && <span style={{ fontSize: 13, color: colors.success, fontWeight: 600 }}>Enregistré ✓</span>}
    </div>
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

const primaryBtnStyle = {
  minHeight: 44,
  padding: '0 18px',
  border: 0,
  borderRadius: 10,
  background: colors.primary,
  color: colors.white,
  fontWeight: 700,
  cursor: 'pointer',
  whiteSpace: 'nowrap',
}
