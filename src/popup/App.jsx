import { useEffect, useState } from "react";
import { ShieldCheck, LockKeyhole, Sparkles, Plus, KeyRound, Settings, Fingerprint, Copy, Trash2, X, Eye, EyeOff } from "lucide-react";
import { createVault, unlockVault } from "../crypto/vault.js";
import { clearSession } from "../crypto/session.js";
import { encryptRecord, decryptRecord } from "../crypto/records.js";
import { getVaultMetadata, listCredentialRecords, putCredentialRecord, deleteCredentialRecord } from "../database/repository.js";

export default function App() {
  const [view, setView] = useState("loading");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [credentials, setCredentials] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [site, setSite] = useState("");
  const [username, setUsername] = useState("");
  const [secret, setSecret] = useState("");
  const [visibleIds, setVisibleIds] = useState([]);

  useEffect(() => {
    let active = true;
    getVaultMetadata()
      .then(meta => { if (active) setView(meta ? "locked" : "setup"); })
      .catch(() => { if (active) setView("setup"); });
    return () => { active = false; };
  }, []);

  async function refreshCredentials() {
    const rows = await listCredentialRecords();
    const decrypted = await Promise.all(rows.map(async row => ({ id: row.id, ...(await decryptRecord(row)) })));
    setCredentials(decrypted.sort((a, b) => a.site.localeCompare(b.site)));
  }

  async function submit() {
    setMessage("");
    if (password.length < 14) return setMessage("Use a passphrase of at least 14 characters.");
    if (view === "setup" && password !== confirm) return setMessage("Passphrases do not match.");
    setBusy(true);
    try {
      if (view === "setup") await createVault(password);
      else await unlockVault(password);
      await refreshCredentials();
      setPassword("");
      setConfirm("");
      setView("dashboard");
    } catch (error) {
      setMessage(error.message || "Could not unlock the vault.");
    } finally { setBusy(false); }
  }

  async function saveCredential(event) {
    event.preventDefault();
    setMessage("");
    if (!site.trim() || !secret) return setMessage("Website/account name and password are required.");
    try {
      const id = crypto.randomUUID();
      const encrypted = await encryptRecord({ site: site.trim(), username: username.trim(), password: secret }, id);
      await putCredentialRecord(encrypted);
      await refreshCredentials();
      setSite(""); setUsername(""); setSecret(""); setShowForm(false);
    } catch (error) {
      setMessage(error.message || "Could not save this account.");
    }
  }

  async function removeCredential(id) {
    if (!window.confirm("Delete this saved account? This cannot be undone.")) return;
    await deleteCredentialRecord(id);
    await refreshCredentials();
  }

  async function copyPassword(value) {
    try {
      await navigator.clipboard.writeText(value);
      setMessage("Password copied to clipboard.");
    } catch {
      setMessage("Clipboard access was blocked by the browser.");
    }
  }

  function lockVault() {
    clearSession();
    setCredentials([]);
    setVisibleIds([]);
    setPassword(""); setConfirm("");
    setView("locked");
    setMessage("");
  }

  if (view === "loading") return <main className="shell loading"><div className="brand"><div className="logo"><ShieldCheck /></div><div><h1>PassVault</h1><p>Private by design.</p></div></div><p className="muted">Preparing your encrypted vault…</p></main>;

  if (view === "setup" || view === "locked") return (
    <main className="shell auth-shell">
      <header className="brand"><div className="logo"><ShieldCheck /></div><div><h1>PassVault</h1><p>Private by design.</p></div></header>
      <section className="panel auth">
        <div className="icon-orb"><LockKeyhole /></div>
        <p className="eyebrow">{view === "setup" ? "CREATE YOUR VAULT" : "WELCOME BACK"}</p>
        <h2>{view === "setup" ? "One key. All your accounts." : "Unlock your vault."}</h2>
        <p className="muted">{view === "setup" ? "Create a strong master passphrase. PassVault never stores it." : "Your encrypted credentials stay on this device."}</p>
        <form onSubmit={submit}>
          <label htmlFor="master-password">Master passphrase</label>
          <input id="master-password" type="password" autoComplete="new-password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="At least 14 characters" />
          {view === "setup" && <><label htmlFor="confirm-password">Confirm passphrase</label><input id="confirm-password" type="password" autoComplete="new-password" value={confirm} onChange={e=>setConfirm(e.target.value)} placeholder="Repeat your passphrase" /></>}
          {message && <p className="error" role="alert">{message}</p>}
          <button className="primary" disabled={busy || !password} type="submit">{busy ? "Securing vault…" : view === "setup" ? "Create encrypted vault" : "Unlock PassVault"}</button>
        </form>
        <p className="fine"><Fingerprint size={14}/> Encryption and key derivation run locally.</p>
      </section>
    </main>
  );

  return <main className="shell">
    <header className="brand"><div className="logo"><ShieldCheck /></div><div><h1>PassVault</h1><p>Your passwords. Your device.</p></div><button className="ghost" title="Lock vault" onClick={lockVault}><LockKeyhole size={15}/> Lock</button></header>
    <section className="welcome"><div><p className="eyebrow">YOUR SECURITY SPACE</p><h2>Vault unlocked.</h2><p className="muted">Your credentials are encrypted at rest.</p></div><div className="status"><span/> LOCAL</div></section>
    <section className="stats"><div className="panel stat"><KeyRound/><strong>{credentials.length}</strong><span>Saved accounts</span></div><div className="panel stat"><ShieldCheck/><strong>On-device</strong><span>Encryption</span></div></section>
    <section className="panel feature"><div className="feature-icon"><Sparkles/></div><div><h3>PassVault AI</h3><p className="muted">AI security guidance is not connected yet. Your passwords are never sent to AI.</p></div><span className="coming-soon">SOON</span></section>
    <section className="panel credentials">
      <div className="section-heading"><div><p className="eyebrow">YOUR COLLECTION</p><h3>Saved accounts</h3></div><button className="primary add-button" onClick={()=>{setMessage("");setShowForm(!showForm);}}>{showForm ? <X size={16}/> : <Plus size={16}/>} {showForm ? "Cancel" : "Add account"}</button></div>
      {message && <p className="notice" role="status">{message}</p>}
      {showForm && <form className="credential-form" onSubmit={saveCredential}>
        <label htmlFor="site">Website or account name</label><input id="site" value={site} onChange={e=>setSite(e.target.value)} placeholder="e.g. GitHub" required />
        <label htmlFor="username">Username or email</label><input id="username" value={username} onChange={e=>setUsername(e.target.value)} placeholder="you@example.com" />
        <label htmlFor="saved-password">Password</label><input id="saved-password" type="password" value={secret} onChange={e=>setSecret(e.target.value)} placeholder="Enter password" required />
        <button className="primary" type="submit">Encrypt and save</button>
      </form>}
      {credentials.length === 0 && !showForm ? <div className="empty"><div className="icon-orb"><KeyRound/></div><h3>Your vault is ready</h3><p className="muted">Add an account to store its credentials encrypted on this device.</p><button className="primary" onClick={()=>setShowForm(true)}><Plus size={17}/> Add your first password</button></div> : <div className="credential-list">{credentials.map(item => <article className="credential-row" key={item.id}><div className="credential-avatar"><KeyRound size={18}/></div><div className="credential-info"><strong>{item.site}</strong><span>{item.username || "No username"}</span>{visibleIds.includes(item.id) && <code className="revealed-password">{item.password}</code>}</div><div className="credential-actions"><button className="icon-button" title={visibleIds.includes(item.id) ? "Hide password" : "Show password"} onClick={()=>setVisibleIds(ids=>ids.includes(item.id)?ids.filter(x=>x!==item.id):[...ids,item.id])}>{visibleIds.includes(item.id)?<EyeOff size={16}/>:<Eye size={16}/>}</button><button className="icon-button" title="Copy password" onClick={()=>copyPassword(item.password)}><Copy size={16}/></button><button className="icon-button danger" title="Delete account" onClick={()=>removeCredential(item.id)}><Trash2 size={16}/></button></div></article>)}</div>}
    </section>
    <footer><span><LockKeyhole size={13}/> Local-first storage</span><span><Settings size={13}/> Settings soon</span></footer>
  </main>;
}
