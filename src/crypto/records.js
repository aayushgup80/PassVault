import { getSessionDek } from "./session.js";
import { randomBytes, toBase64, fromBase64 } from "./keys.js";
const encoder = new TextEncoder();
const decoder = new TextDecoder();

export async function encryptRecord(record, id) {
  const nonce = randomBytes(12);
  const aad = encoder.encode(`PassVault:record:v1:${id}`);
  const plaintext = encoder.encode(JSON.stringify(record));
  const ciphertext = await crypto.subtle.encrypt({ name:"AES-GCM", iv:nonce, additionalData:aad, tagLength:128 }, getSessionDek(), plaintext);
  plaintext.fill(0);
  return { id, version:1, nonce:toBase64(nonce), ciphertext:toBase64(new Uint8Array(ciphertext)), updatedAt:Date.now() };
}
export async function decryptRecord(row) {
  const aad = encoder.encode(`PassVault:record:v1:${row.id}`);
  const plaintext = await crypto.subtle.decrypt({ name:"AES-GCM", iv:fromBase64(row.nonce), additionalData:aad, tagLength:128 }, getSessionDek(), fromBase64(row.ciphertext));
  return JSON.parse(decoder.decode(plaintext));
}