export function canonicalOrigin(input) {
  const url = new URL(input);
  if (!["https:", "http:"].includes(url.protocol)) throw new Error("Unsupported website protocol.");
  if (url.username || url.password) throw new Error("Credential-bearing URLs are not allowed.");
  return url.origin.toLowerCase();
}
export function isExactOriginMatch(savedOrigin, currentOrigin) {
  try { return canonicalOrigin(savedOrigin) === canonicalOrigin(currentOrigin); } catch { return false; }
}