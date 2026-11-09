// Ephemeral only: never persist the unlocked key in storage.
let dek = null;
let indexKey = null;
let lastActivity = 0;
export function setSessionDek(key) { dek = key; indexKey = null; lastActivity = Date.now(); }
export function getSessionDek() {
  if (!dek) throw new Error("Vault is locked.");
  lastActivity = Date.now();
  return dek;
}
export function clearSession() { dek = null; indexKey = null; lastActivity = 0; }
export function touchSession() { if (dek) lastActivity = Date.now(); }
export function isUnlocked() { return Boolean(dek); }
export function getLastActivity() { return lastActivity; }