const LOWER = "abcdefghijkmnopqrstuvwxyz";
const UPPER = "ABCDEFGHJKLMNPQRSTUVWXYZ";
const DIGITS = "23456789";
const SYMBOLS = "!@#$%^&*()-_=+[]{}?";
function randomInt(max) {
  const limit = Math.floor(256 / max) * max;
  const b = new Uint8Array(1);
  do { crypto.getRandomValues(b); } while (b[0] >= limit);
  return b[0] % max;
}
export function generatePassword({ length = 20, symbols = true } = {}) {
  if (!Number.isInteger(length) || length < 12 || length > 64) throw new Error("Length must be between 12 and 64.");
  const groups = [LOWER, UPPER, DIGITS, ...(symbols ? [SYMBOLS] : [])];
  const chars = groups.map(group => group[randomInt(group.length)]);
  const alphabet = groups.join("");
  while (chars.length < length) chars.push(alphabet[randomInt(alphabet.length)]);
  for (let i = chars.length - 1; i > 0; i--) { const j = randomInt(i + 1); [chars[i], chars[j]] = [chars[j], chars[i]]; }
  return chars.join("");
}