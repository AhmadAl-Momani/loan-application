// AES-256-GCM via Web Crypto. The passphrase is hardcoded because the brief allows it for this
// project; in production derive the key from a user-specific secret.
const PASSPHRASE = 'lendswift-demo-passphrase-v1';
const SALT = new TextEncoder().encode('lendswift-static-salt');

let keyPromise;
function getKey() {
  if (!keyPromise) {
    const enc = new TextEncoder();
    keyPromise = window.crypto.subtle
      .importKey('raw', enc.encode(PASSPHRASE), 'PBKDF2', false, ['deriveKey'])
      .then((base) => window.crypto.subtle.deriveKey(
        {
          name: 'PBKDF2', salt: SALT, iterations: 100000, hash: 'SHA-256',
        },
        base,
        { name: 'AES-GCM', length: 256 },
        false,
        ['encrypt', 'decrypt'],
      ));
  }
  return keyPromise;
}

const toBase64 = (bytes) => {
  let bin = '';
  bytes.forEach((b) => { bin += String.fromCharCode(b); });
  return btoa(bin);
};
const fromBase64 = (b64) => Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));

/** string -> base64(iv ‖ ciphertext) */
export async function encryptString(plain) {
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const key = await getKey();
  const cipher = new Uint8Array(
    await window.crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, new TextEncoder().encode(plain)),
  );
  const out = new Uint8Array(iv.length + cipher.length);
  out.set(iv);
  out.set(cipher, iv.length);
  return toBase64(out);
}

/** Throws if the data was tampered with (GCM auth tag mismatch) or is malformed. */
export async function decryptString(payload) {
  const bytes = fromBase64(payload);
  const key = await getKey();
  const plain = await window.crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: bytes.slice(0, 12) },
    key,
    bytes.slice(12),
  );
  return new TextDecoder().decode(plain);
}
