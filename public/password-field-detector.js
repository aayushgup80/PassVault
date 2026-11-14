(() => {
  if (window.top !== window) return;
  const buttonClass = "passvault-inline-trigger";
  const style = document.createElement("style");
  style.textContent = ".passvault-inline-trigger{position:absolute!important;z-index:2147483646!important;width:25px!important;height:25px!important;padding:0!important;border:1px solid #397c72!important;border-radius:8px!important;background:#10251f!important;color:#8cf1dc!important;font:700 14px/1 Arial!important;cursor:pointer!important;box-shadow:0 2px 10px #0004!important}.passvault-inline-trigger:hover{background:#1b5147!important}";
  (document.head || document.documentElement).append(style);
  function visible(field){if(!(field instanceof HTMLInputElement)||field.disabled||field.type!=="password")return false;const r=field.getBoundingClientRect(),s=getComputedStyle(field);return r.width>0&&r.height>0&&s.display!=="none"&&s.visibility!=="hidden";}
  function attach(field){if(!visible(field)||field.dataset.passvaultBound==="1")return;field.dataset.passvaultBound="1";const button=document.createElement("button");button.type="button";button.className=buttonClass;button.textContent="P";button.title="Open PassVault";button.setAttribute("aria-label","Open PassVault for this login");button.addEventListener("click",e=>{e.preventDefault();e.stopPropagation();try{chrome.runtime.sendMessage({type:"PASSVAULT_OPEN_POPUP"},()=>void chrome.runtime.lastError);}catch{}});const position=()=>{const r=field.getBoundingClientRect();button.style.left=(window.scrollX+r.right-29)+"px";button.style.top=(window.scrollY+r.top+Math.max(0,(r.height-25)/2))+"px";};position();window.addEventListener("scroll",position,{passive:true});window.addEventListener("resize",position,{passive:true});(document.body||document.documentElement).append(button);}
  let lastCount=-1;
  function scan(){const fields=[...document.querySelectorAll('input[type="password"]')].filter(visible);fields.forEach(attach);if(fields.length!==lastCount){lastCount=fields.length;try{chrome.runtime.sendMessage({type:"PASSVAULT_PASSWORD_FIELDS_DETECTED",count:fields.length},()=>void chrome.runtime.lastError);}catch{}}}
  chrome.runtime.onMessage.addListener((message,sender,sendResponse)=>{
    if(message?.type!=="PASSVAULT_FILL_CREDENTIAL")return;
    if(message.origin!==location.origin){sendResponse({ok:false});return;}
    const fields=[...document.querySelectorAll('input[type="password"]')].filter(visible);const passwordField=fields.find(f=>f===document.activeElement)||fields[0];
    if(!passwordField||typeof message.password!=="string"||typeof message.username!=="string"){sendResponse({ok:false});return;}
    const form=passwordField.form||passwordField.closest("form")||document;
    const usernameField=[...form.querySelectorAll('input:not([type="password"]):not([type="hidden"])')].find(f=>/^(text|email|tel)$/i.test(f.type)&&!f.disabled&&(/(user|email|login|account)/i.test((f.name||"")+" "+(f.id||"")+" "+(f.autocomplete||""))||f.type==="email"));
    const setValue=(field,value)=>{const setter=Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,"value")?.set;if(setter)setter.call(field,value);else field.value=value;field.dispatchEvent(new Event("input",{bubbles:true}));field.dispatchEvent(new Event("change",{bubbles:true}));};
    if(usernameField)setValue(usernameField,message.username);setValue(passwordField,message.password);sendResponse({ok:true,usernameFilled:Boolean(usernameField)});
  });
  scan();new MutationObserver(scan).observe(document.documentElement,{childList:true,subtree:true,attributes:true,attributeFilter:["type","style","hidden"]});
})();
