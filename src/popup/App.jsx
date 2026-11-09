import { useState } from "react";
import { ShieldCheck, LockKeyhole, Sparkles, Plus, KeyRound, Settings, Fingerprint } from "lucide-react";
import { createVault, unlockVault } from "../crypto/vault.js";
import { getVaultMetadata, listCredentialRecords } from "../database/repository.js";

export default function App() {
  const [view, setView] = useState("loading");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [count, setCount] = useState(0);

  useState(() => {
    getVaultMetadata().then(meta => setView(meta ? "locked" : "setup")).catch(() => setView("setup"));
  });

  async function submit() {
    setMessage("");
    if (password.length < 14) return setMessage("Use a passphrase of at least 14 characters.");
    if (view === "setup" && password !== confirm) return setMessage("Passphrases do not match.");
    setBusy(true);
    try {
      if (view === "setup") await createVault(password);
      else await unlockVault(password);
      const records = await listCredentialRecords();
      setCount(records.length);
      setPassword(""); setConfirm(""); setView("dashboard");
    } catch (error) {
      setMessage(error.message || "Could not unlock the vault.");
    } finally { setBusy(false); }
  }

  if (view === "loading") return <main className="shell"><p>Loading PassVault…</p></main>;
  if (view === "setup" || view === "locked") return (
    <main className="shell">
      <header className="brand"><div className="logo"><ShieldCheck /></div><div><h1>PassVault</h1><p>Private by design.</p></div></header>
      <section className="panel auth">
        <div className="icon-orb"><LockKeyhole /></div>
        <p className="eyebrow">{view === "setup" ? "CREATE YOUR VAULT" : "WELCOME BACK"}</p>
        <h2>{view === "setup" ? "One key. All your accounts." : "Unlock your vault."}</h2>
        <p className="muted">{view === "setup" ? "Create a strong master passphrase. PassVault never stores it." : "Your encrypted credentials stay on this device."}</p>
        <label>Master passphrase</label>
        <input type="password" autoComplete="new-password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="At least 14 characters" />
        {view === "setup" && <><label>Confirm passphrase</label><input type="password" autoComplete="new-password" value={confirm} onChange={e=>setConfirm(e.target.value)} placeholder="Repeat your passphrase" /></>}
        {message && <p className="error">{message}</p>}
        <button className="primary" disabled={busy || !password} onClick={submit}>{busy ? "Securing vault…" : view === "setup" ? "Create encrypted vault" : "Unlock PassVault"}</button>
        <p className="fine"><Fingerprint size={14}/> Encryption and key derivation run locally.</p>
      </section>
    </main>
  );

  return <main className="shell">
    <header className="brand"><div className="logo"><ShieldCheck /></div><div><h1>PassVault</h1><p>Your passwords. Your device.</p></div><button className="ghost" title="Lock vault" onClick={()=>{setView("locked");setCount(0);}}>Lock</button></header>
    <section className="welcome"><div><p className="eyebrow">YOUR SECURITY SPACE</p><h2>Vault unlocked.</h2><p className="muted">Your credentials are encrypted at rest.</p></div><div className="status"><span/> LOCAL</div></section>
    <section className="stats"><div className="panel stat"><KeyRound/><strong>{count}</strong><span>Saved accounts</span></div><div className="panel stat"><ShieldCheck/><strong>On-device</strong><span>Encryption</span></div></section>
    <section className="panel feature"><div className="feature-icon"><Sparkles/></div><div><h3>PassVault AI</h3><p className="muted">Get help naming accounts and improving security. Your passwords are never sent to AI.</p></div><button className="icon-button" onClick={()=>setMessage("AI assistant will be available after the NVIDIA proxy is configured.")}><Sparkles/></button></section>
    <section className="panel empty"><div className="icon-orb"><KeyRound/></div><h3>Your vault is ready</h3><p className="muted">Password manager features are coming online in the next build step.</p><button className="primary" onClick={()=>setMessage("Credential editor is the next implementation milestone.")}><Plus size={17}/> Add your first password</button>{message && <p className="fine">{message}</p>}</section>
    <footer><span><LockKeyhole size={13}/> Local-first storage</span><span><Settings size={13}/> Settings soon</span></footer>
  </main>;
}