import { getVaultMetadata, putVaultMetadata } from "../database/repository.js";
import { deriveKek, importDek, randomBytes, toBase64, fromBase64 } from "./keys.js";
import { setSessionDek, clearSession } from "./session.js";

const encoder = new TextEncoder();
const WRAP_AAD = encoder.encode("PassVault:wrapped-DEK:v1");

export async function createVault(masterPassphrase) {
  if (await getVaultMetadata()) throw new Error("A vault already exists on this browser profile.");
  const salt = randomBytes(16);
  const rawDek = randomBytes(32);
  const kek = await deriveKek(masterPassphrase, salt);
  const nonce = randomBytes(12);
  const wrapped = await crypto.subtle.encrypt({ name: "AES-GCM", iv: nonce, additionalData: WRAP_AAD, tagLength: 128 }, kek, rawDek);
  const dek = await importDek(rawDek);
  await putVaultMetadata({
    id: "main", version: 1, kdf: "Argon2id",
    kdfParams: { time: 3, memoryKiB: 65536, parallelism: 1 },
    salt: toBase64(salt), wrapNonce: toBase64(nonce),
    wrappedDEK: toBase64(new Uint8Array(wrapped)), createdAt: Date.now()
  });
  rawDek.fill(0);
  setSessionDek(dek);
}
export async function unlockVault(masterPassphrase) {
  const meta = await getVaultMetadata();
  if (!meta) throw new Error("No vault exists yet.");
  try {
    const kek = await deriveKek(masterPassphrase, fromBase64(meta.salt));
    const rawDek = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: fromBase64(meta.wrapNonce), additionalData: WRAP_AAD, tagLength: 128 },
      kek, fromBase64(meta.wrappedDEK)
    );
    const bytes = new Uint8Array(rawDek);
    const dek = await importDek(bytes);
    bytes.fill(0);
    setSessionDek(dek);
  } catch {
    clearSession();
    throw new Error("Incorrect master passphrase or damaged vault metadata.");
  }
}