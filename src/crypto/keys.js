import argon2 from "argon2-browser";

const encoder = new TextEncoder();
const KDF = Object.freeze({ time: 3, mem: 65536, parallelism: 1, hashLen: 32, type: argon2.ArgonType.Argon2id });

export function randomBytes(length) {
  return crypto.getRandomValues(new Uint8Array(length));
}
export function toBase64(bytes) {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}
export function fromBase64(value) {
  const binary = atob(value);
  return Uint8Array.from(binary, c => c.charCodeAt(0));
}
export async function deriveKek(passphrase, salt) {
  if (typeof passphrase !== "string" || passphrase.length < 14) throw new Error("Master passphrase must contain at least 14 characters.");
  const result = await argon2.hash({ pass: passphrase, salt, ...KDF });
  return crypto.subtle.importKey("raw", result.hash, { name: "AES-GCM" }, false, ["encrypt", "decrypt"]);
}
export async function importDek(raw) {
  return crypto.subtle.importKey("raw", raw, { name: "AES-GCM", length: 256 }, false, ["encrypt", "decrypt"]);
}
export async function deriveIndexKey(dek) {
  const raw = await crypto.subtle.exportKey("raw", dek);
  const base = await crypto.subtle.importKey("raw", raw, "HKDF", false, ["deriveKey"]);
  return crypto.subtle.deriveKey(
    { name: "HKDF", hash: "SHA-256", salt: encoder.encode("PassVault-v1-index"), info: encoder.encode("origin-index") },
    base, { name: "HMAC", hash: "SHA-256", length: 256 }, false, ["sign"]
  );
}
export async function originFingerprint(indexKey, origin) {
  const signature = await crypto.subtle.sign("HMAC", indexKey, encoder.encode(origin));
  return toBase64(new Uint8Array(signature));
}