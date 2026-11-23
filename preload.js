const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("api", {
  check_code: (code) => ipcRenderer.invoke("check-code", code),
  ask: (mode, messages) => ipcRenderer.invoke("ask", mode, messages),
});
