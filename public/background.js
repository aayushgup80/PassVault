chrome.runtime.onInstalled.addListener(() => {
  console.info("PassVault installed");
});

chrome.runtime.onMessage.addListener((message, sender) => {
  if (message?.type !== "PASSVAULT_PASSWORD_FIELDS_DETECTED") return;
  const tabId = sender.tab?.id;
  const senderUrl = sender.tab?.url;
  if (!Number.isInteger(tabId) || typeof senderUrl !== "string") return;

  let origin;
  try {
    const parsed = new URL(senderUrl);
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") return;
    origin = parsed.origin;
  } catch {
    return;
  }

  const count = Number.isInteger(message.count) ? Math.max(1, Math.min(message.count, 50)) : 1;
  chrome.storage.session.set({
    lastPasswordFieldDetection: { origin, count, tabId, detectedAt: Date.now() }
  });
});
