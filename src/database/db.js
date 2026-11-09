import { openDB } from "idb";
const DB_NAME = "PassVaultDB";
const DB_VERSION = 1;
export const dbPromise = openDB(DB_NAME, DB_VERSION, {
  upgrade(db) {
    if (!db.objectStoreNames.contains("vault_metadata")) db.createObjectStore("vault_metadata", { keyPath:"id" });
    if (!db.objectStoreNames.contains("credentials")) {
      const store = db.createObjectStore("credentials", { keyPath:"id" });
      store.createIndex("updatedAt", "updatedAt");
    }
    if (!db.objectStoreNames.contains("settings")) db.createObjectStore("settings", { keyPath:"id" });
  }
});