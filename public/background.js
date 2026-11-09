// PassVault MV3 background service worker scaffold.
// Add narrowly-scoped message handlers here; never expose vault keys to content scripts.
chrome.runtime.onInstalled.addListener(() => {
  console.info("PassVault installed");
});