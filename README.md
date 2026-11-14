# PassVault

PassVault is a local-first password manager prototype built as a Chrome Manifest V3 extension and companion web entry.

## Features
- Argon2id key derivation and AES-GCM envelope encryption.
- Website origin, username/email, and password encrypted together in each credential record.
- Required username/email and website address when saving an account.
- Password validation (12+ characters, with a longer-password alternative to character variety).
- Password field detector with a compact inline PassVault launcher. Detection reads field type only, never field values.
- User-triggered fill restricted to an exact website origin. Forms are never submitted automatically.
- Local-first IndexedDB storage; plaintext credentials are not sent to AI or a server.

## Build
```sh
npm ci
npm test
npm run build
```
Load the generated `dist` directory at `chrome://extensions` with Developer mode enabled.

## Companion website
Run `npm run dev -- --host 127.0.0.1` and open `/website.html`. It uses the same interface and cryptographic code, but browser-origin storage is separate from the Chrome extension's storage. Cross-device/extension-to-web sync is not implemented yet; do not assume the vaults share records.

## Security status
This is a development prototype, not an independently audited password manager. Back up important credentials elsewhere until encrypted backup/restore and a security review are complete. Keep NVIDIA API keys in Supabase Edge Function secrets only; never place them in extension source or a VITE_ variable.
