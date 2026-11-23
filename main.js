const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");
const { answer } = require("./kb/engine.js");

// Fest eingebaute Zugangscodes als SHA-256-Hashes
const BUILTIN_CODE_HASHES = [
  "89172081e3c49e0e4c432b0371f426cefd982004005282dd6f64956a4653134b",
  "2888a55a6c471aaf44851e3ff3753422448324a5f8d2ca6b69c830c7c6f116dd",
  "257f876dd801f7735cb845ea619c632af521ed691b19ce54e9d6b2e6d37e1bdd",
  "c1c795ec1d533a135d9f45a1534ccc423b369884b2b6d5efa97a9159ff751396",
  "df6bca3325cdd696045967492ffaf52b1d804ceacdfd2bfaaaac83b1559674f4",
  "103e2b6ca228a89a5d553f1b1909dc537b025a5dc14f61abb2eba9c143de12f9",
  "ab938f430d3d2bb581becb59a4478fe20224fd96585601c119abbde7fbc81c74",
  "06ab7f2b2137f266401e0d0aff1faa71e0b778417788a3e8695ec47270ff4ea0",
  "82a69e7ab6d78ed8086a12bcf4dc43a7898dd6d63db16599444e8e2372ad1580",
  "578f5592536a8beb7d833ff7222dcec7ee7f8cb32a105e2f8d2bf0cd3f40700c",
];

function sha256(text) {
  return crypto.createHash("sha256").update(String(text), "utf-8").digest("hex");
}

// Ordner, in dem die .exe liegt (bzw. das Projekt beim Testen)
function appDir() {
  return process.env.PORTABLE_EXECUTABLE_DIR || path.dirname(app.getPath("exe"));
}

function loadCodeHashes() {
  const hashes = new Set(BUILTIN_CODE_HASHES);
  try {
    const cfg = JSON.parse(fs.readFileSync(path.join(appDir(), "config.json"), "utf-8"));
    for (const code of cfg.access_codes || []) {
      const normalized = String(code).trim().toUpperCase();
      if (normalized) hashes.add(sha256(normalized));
    }
  } catch {
    // keine config.json oder fehlerhaft: nur die eingebauten Codes gelten
  }
  return hashes;
}

ipcMain.handle("check-code", (_e, code) => {
  const digest = sha256(String(code || "").trim().toUpperCase());
  return { ok: loadCodeHashes().has(digest) };
});

// Antwort komplett lokal aus der eigenen Wissensdatenbank – kein Netzwerk, kein Key
ipcMain.handle("ask", async (_e, mode, messages) => {
  const last = [...(messages || [])].reverse().find((m) => m.role === "user");
  // kurze Denkpause, damit es sich wie eine Antwort anfühlt
  await new Promise((r) => setTimeout(r, 600));
  return answer(mode, last ? last.content : "");
});

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    title: "DRuf",
    backgroundColor: "#0b0d12",
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });
  win.loadFile(path.join(__dirname, "ui", "index.html"));
}

app.whenReady().then(() => {
  createWindow();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  app.quit();
});
