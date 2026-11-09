import { dbPromise } from "./db.js";
export async function getVaultMetadata() { return (await dbPromise).get("vault_metadata", "main"); }
export async function putVaultMetadata(value) { return (await dbPromise).put("vault_metadata", value); }
export async function putCredentialRecord(value) { return (await dbPromise).put("credentials", value); }
export async function getCredentialRecord(id) { return (await dbPromise).get("credentials", id); }
export async function listCredentialRecords() { return (await dbPromise).getAll("credentials"); }
export async function deleteCredentialRecord(id) { return (await dbPromise).delete("credentials", id); }