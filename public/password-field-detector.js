(() => {
  if (window.top !== window) return;

  const HOST_ID = "passvault-field-detector";
  let lastCount = 0;
  let host;

  function isVisible(field) {
    if (!(field instanceof HTMLInputElement) || field.disabled || field.type !== "password") return false;
    const style = window.getComputedStyle(field);
    const rect = field.getBoundingClientRect();
    return style.display !== "none" && style.visibility !== "hidden" && rect.width > 0 && rect.height > 0;
  }

  function showIndicator(count) {
    if (!host) {
      host = document.createElement("div");
      host.id = HOST_ID;
      const shadow = host.attachShadow({ mode: "closed" });
      const style = document.createElement("style");
      style.textContent = `
        :host{all:initial;position:fixed;z-index:2147483647;right:16px;bottom:16px;font-family:Arial,sans-serif}
        button{border:1px solid #32685f;border-radius:12px;background:#10251f;color:#d9fff5;padding:10px 13px;font:600 12px Arial,sans-serif;box-shadow:0 8px 28px #0005;cursor:pointer}
        button span{color:#72dfc9;margin-right:6px}
        button:focus-visible{outline:2px solid #72dfc9;outline-offset:3px}
      `;
      const button = document.createElement("button");
      button.type = "button";
      button.innerHTML = '<span>●</span> PassVault · login field found';
      button.title = "Open PassVault from your browser toolbar to manage this login";
      button.addEventListener("click", () => {
        button.textContent = "Open PassVault from the toolbar to save or fill this login";
      });
      shadow.append(style, button);
      (document.documentElement || document.body).append(host);
    }
    host.style.display = "block";
  }

  function scan() {
    const fields = Array.from(document.querySelectorAll('input[type="password"]')).filter(isVisible);
    if (fields.length > 0) {
      showIndicator(fields.length);
      if (fields.length !== lastCount) {
        lastCount = fields.length;
        try {
          chrome.runtime.sendMessage({
            type: "PASSVAULT_PASSWORD_FIELDS_DETECTED",
            count: fields.length
          }, () => void chrome.runtime.lastError);
        } catch {}
      }
    } else if (host) {
      host.style.display = "none";
      lastCount = 0;
    }
  }

  scan();
  const observer = new MutationObserver(() => scan());
  observer.observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ["type", "style", "hidden"] });
})();
