import { dbPromise } from "./db.js";
export async function getVaultMetadata() { return (await dbPromise).get("vault_metadata", "main"); }
export async function putVaultMetadata(value) { return (await dbPromise).put("vault_metadata", value); }
export async function putCredentialRecord(value) { return (await dbPromise).put("credentials", value); }
export async function getCredentialRecord(id) { return (await dbPromise).get("credentials", id); }
export async function listCredentialRecords() { return (await dbPromise).getAll("credentials"); }
export async function deleteCredentialRecord(id) { return (await dbPromise).delete("credentials", id); }
export async function replaceVaultSnapshot(metadata, records) {
  const db = await dbPromise;
  const tx = db.transaction(["vault_metadata", "credentials"], "readwrite");
  await Promise.all([tx.objectStore("vault_metadata").clear(), tx.objectStore("credentials").clear()]);
  await tx.objectStore("vault_metadata").put(metadata);
  for (const record of records) await tx.objectStore("credentials").put(record);
  await tx.done;
}
