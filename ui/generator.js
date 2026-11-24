// DRuf – Script-Generator (offline). Erzeugt fxmanifest.lua, client.lua, server.lua
// (und bei UI-Menü die html-Dateien) aus festen Vorlagen und den Eingaben des Nutzers.
(function () {
  "use strict";

  // ---------- Hilfsfunktionen ----------
  function lua(s) {
    return String(s == null ? "" : s).replace(/\\/g, "\\\\").replace(/'/g, "\\'").replace(/\r?\n/g, " ");
  }
  function ident(s, def) {
    const v = String(s || "").toLowerCase()
      .replace(/ä/g, "ae").replace(/ö/g, "oe").replace(/ü/g, "ue").replace(/ß/g, "ss")
      .replace(/[\s-]+/g, "_")
      .replace(/[^a-z0-9_]/g, "")
      .replace(/^_+|_+$/g, "");
    return v || def;
  }
  function num(s, def) {
    const n = parseFloat(String(s == null ? "" : s).replace(",", "."));
    return isNaN(n) ? def : n;
  }
  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
  function hexColor(s, def) {
    const v = String(s || "").trim();
    return /^#[0-9a-fA-F]{6}$/.test(v) ? v : def;
  }
  function parseCoords(s) {
    const parts = String(s || "").split(/[,\s;]+/).filter(Boolean).map((x) => parseFloat(x.replace(",", ".")));
    const ok = parts.length >= 3 && parts.slice(0, 3).every((n) => !isNaN(n));
    return ok ? parts.slice(0, 3) : [195.17, -933.77, 30.69];
  }

  // ---------- Bausteine (Framework-abhängig) ----------
  function serverHead(fw) {
    if (fw === "esx") return ["local ESX = exports['es_extended']:getSharedObject()", ""];
    if (fw === "qb") return ["local QBCore = exports['qb-core']:GetCoreObject()", ""];
    return [];
  }

  function serverNotify(fw) {
    let body;
    if (fw === "esx") body = "TriggerClientEvent('esx:showNotification', src, msg)";
    else if (fw === "qb") body = "TriggerClientEvent('QBCore:Notify', src, msg, 'primary')";
    else body = "TriggerClientEvent('chat:addMessage', src, { args = { 'System', msg } })";
    return ["local function notify(src, msg)", "    " + body, "end", ""];
  }

  function clientNotify(fw) {
    let body;
    if (fw === "esx") body = "TriggerEvent('esx:showNotification', msg)";
    else if (fw === "qb") body = "TriggerEvent('QBCore:Notify', msg, 'primary')";
    else body = "TriggerEvent('chat:addMessage', { args = { 'System', msg } })";
    return ["local function notify(msg)", "    " + body, "end", ""];
  }

  function adminCheck(fw) {
    let body;
    if (fw === "esx") {
      body = [
        "    local xPlayer = ESX.GetPlayerFromId(src)",
        "    if not xPlayer then return false end",
        "    local group = xPlayer.getGroup()",
        "    return group == 'admin' or group == 'superadmin'",
      ];
    } else if (fw === "qb") {
      body = ["    return QBCore.Functions.HasPermission(src, 'admin')"];
    } else {
      body = ["    return IsPlayerAceAllowed(src, 'group.admin')"];
    }
    return ["local function isAdmin(src)"].concat(body, ["end", ""]);
  }

  function manifest(res, fw, o) {
    o = o || {};
    const L = [
      "fx_version 'cerulean'", "game 'gta5'", "lua54 'yes'", "",
      "author 'DRuf'", "description '" + lua(o.desc || res) + "'", "version '1.0.0'", "",
    ];
    if (o.oxlib) L.push("shared_script '@ox_lib/init.lua'", "");
    L.push("client_script 'client.lua'", "server_script 'server.lua'");
    if (o.ui) {
      L.push("", "ui_page 'html/index.html'", "", "files {",
        "    'html/index.html',", "    'html/style.css',", "    'html/script.js'", "}");
    }
    const deps = [];
    if (fw === "esx") deps.push("es_extended");
    if (fw === "qb") deps.push("qb-core");
    if (o.oxlib) deps.push("ox_lib");
    if (deps.length) {
      L.push("", "dependencies {");
      deps.forEach((d) => L.push("    '" + d + "',"));
      L.push("}");
    }
    return L.join("\n") + "\n";
  }

  function noAdmin() {
    return ["    if not isAdmin(src) then", "        notify(src, 'Dafür hast du keine Rechte.')", "        return", "    end"];
  }

  // ---------- Generatoren ----------
  const GEN = {
    command(p, fw, res) {
      const cmd = ident(p.cmd, "hallo");
      const S = serverHead(fw).concat(serverNotify(fw));
      if (p.admin) S.push(...adminCheck(fw));
      S.push(`RegisterCommand('${cmd}', function(source)`, "    local src = source",
        "    if src == 0 then return end -- nicht aus der Konsole");
      if (p.admin) S.push(...noAdmin());
      S.push("", `    notify(src, '${lua(p.text)}')`, "end, false)");
      return {
        files: {
          "fxmanifest.lua": manifest(res, fw, { desc: "Chat-Befehl /" + cmd }),
          "client.lua": "-- Für diesen Befehl ist kein Client-Code nötig.\n",
          "server.lua": S.join("\n") + "\n",
        },
        notes: [`Im Spiel: /${cmd}` + (p.admin ? " (nur Admins)" : "")],
      };
    },

    item(p, fw, res) {
      const item = ident(p.item, "bandage");
      const heal = Math.max(1, Math.min(200, Math.round(num(p.heal, 25))));
      const ev = res + ":benutzt";
      const S = serverHead(fw);
      if (fw === "esx") {
        S.push(`ESX.RegisterUsableItem('${item}', function(source)`,
          "    local xPlayer = ESX.GetPlayerFromId(source)",
          "    if not xPlayer then return end",
          `    if xPlayer.getInventoryItem('${item}').count < 1 then return end`, "",
          `    xPlayer.removeInventoryItem('${item}', 1)`,
          `    TriggerClientEvent('${ev}', source)`, "end)");
      } else if (fw === "qb") {
        S.push(`QBCore.Functions.CreateUseableItem('${item}', function(source)`,
          "    local Player = QBCore.Functions.GetPlayer(source)",
          "    if not Player then return end", "",
          `    if Player.Functions.RemoveItem('${item}', 1) then`,
          `        TriggerClientEvent('${ev}', source)`, "    end", "end)");
      } else {
        S.push("-- Standalone hat kein Itemsystem. Darum gibt es hier einen Befehl statt eines Items.",
          `RegisterCommand('${item}', function(source)`, "    if source == 0 then return end",
          `    TriggerClientEvent('${ev}', source)`, "end, false)");
      }
      const C = clientNotify(fw).concat([
        `RegisterNetEvent('${ev}', function()`,
        "    local ped = PlayerPedId()",
        `    local neu = math.min(GetEntityHealth(ped) + ${heal}, GetEntityMaxHealth(ped))`,
        "    SetEntityHealth(ped, neu)",
        `    notify('${lua(p.text)}')`, "end)",
      ]);
      const notes = [`Das Item "${item}" muss in deinem Inventarsystem existieren.`];
      if (fw === "esx") {
        notes.push("Mit ox_inventory wird das Item in ox_inventory/data/items.lua angelegt und dort mit client = { event = '" + ev + "' } verbunden. Dann ist RegisterUsableItem nicht nötig.");
      }
      return {
        files: {
          "fxmanifest.lua": manifest(res, fw, { desc: "Benutzbares Item " + item }),
          "client.lua": C.join("\n") + "\n",
          "server.lua": S.join("\n") + "\n",
        },
        notes,
      };
    },

    notify(p, fw, res) {
      const cmd = ident(p.cmd, "ankuendigung");
      const ev = res + ":anzeigen";
      const S = serverHead(fw).concat(serverNotify(fw), adminCheck(fw), [
        `RegisterCommand('${cmd}', function(source, args)`,
        "    local src = source",
        "    if src ~= 0 and not isAdmin(src) then",
        "        notify(src, 'Dafür hast du keine Rechte.')",
        "        return",
        "    end", "",
        "    local text = table.concat(args, ' '):sub(1, 200)",
        "    if text == '' then return end", "",
        `    TriggerClientEvent('${ev}', -1, text)`,
        "end, false)",
      ]);
      const C = clientNotify(fw).concat([
        `RegisterNetEvent('${ev}', function(text)`,
        "    if type(text) ~= 'string' then return end",
        `    notify('${lua(p.prefix)}' .. text)`, "end)",
      ]);
      return {
        files: {
          "fxmanifest.lua": manifest(res, fw, { desc: "Ankündigung per /" + cmd }),
          "client.lua": C.join("\n") + "\n",
          "server.lua": S.join("\n") + "\n",
        },
        notes: [`Im Spiel (Admin): /${cmd} Dein Text`],
      };
    },

    marker(p, fw, res) {
      const [x, y, z] = parseCoords(p.pos);
      const ev = res + ":aktion";
      const vec = `vector3(${x}, ${y}, ${z})`;
      const S = serverHead(fw).concat(serverNotify(fw), [
        `local ziel = ${vec}`, "",
        `RegisterNetEvent('${ev}', function()`,
        "    local src = source",
        "    local ped = GetPlayerPed(src)",
        "    if ped == 0 then return end", "",
        "    -- Serverseitige Prüfung: Spieler muss wirklich am Marker stehen",
        "    if #(GetEntityCoords(ped) - ziel) > 5.0 then return end", "",
        "    -- Hier kommt deine Aktion hin (Geld geben, Item geben, Job setzen ...)",
        "    notify(src, 'Aktion ausgeführt.')",
        "end)",
      ]);
      const C = [
        `local ziel = ${vec}`,
        `local hilfe = '${lua(p.text)}'`, "",
        "CreateThread(function()",
        "    while true do",
        "        local sleep = 1000",
        "        local pos = GetEntityCoords(PlayerPedId())",
        "        local dist = #(pos - ziel)", "",
        "        if dist < 15.0 then",
        "            sleep = 0",
        "            DrawMarker(1, ziel.x, ziel.y, ziel.z - 1.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,",
        "                1.5, 1.5, 1.0, 124, 92, 255, 150, false, true, 2, false, nil, nil, false)", "",
        "            if dist < 1.5 then",
        "                BeginTextCommandDisplayHelp('STRING')",
        "                AddTextComponentSubstringPlayerName('~INPUT_CONTEXT~ ' .. hilfe)",
        "                EndTextCommandDisplayHelp(0, false, true, -1)", "",
        "                if IsControlJustReleased(0, 38) then -- Taste E",
        `                    TriggerServerEvent('${ev}')`,
        "                end",
        "            end",
        "        end", "",
        "        Wait(sleep)",
        "    end",
        "end)",
      ];
      return {
        files: {
          "fxmanifest.lua": manifest(res, fw, { desc: "Marker mit Aktion" }),
          "client.lua": C.join("\n") + "\n",
          "server.lua": S.join("\n") + "\n",
        },
        notes: [`Marker bei ${x}, ${y}, ${z}. Mit E wird die Aktion in server.lua ausgelöst.`],
      };
    },

    progress(p, fw, res) {
      const cmd = ident(p.cmd, "arbeiten");
      const ms = Math.max(1, Math.min(300, Math.round(num(p.seconds, 5)))) * 1000;
      const ev = res + ":fertig";
      const S = serverHead(fw).concat(serverNotify(fw), [
        `RegisterNetEvent('${ev}', function()`,
        "    local src = source",
        "    -- Achtung: Ein Client kann dieses Event auch ohne Ladebalken auslösen.",
        "    -- Bei Belohnungen deshalb eine Abklingzeit oder Positionsprüfung ergänzen.",
        "    notify(src, 'Fertig!')",
        "end)",
      ]);
      const C = [
        `RegisterCommand('${cmd}', function()`,
        "    local erfolgreich = lib.progressBar({",
        `        duration = ${ms},`,
        `        label = '${lua(p.label)}',`,
        "        useWhileDead = false,",
        "        canCancel = true,",
        "        disable = { move = true, car = true },",
        "    })", "",
        "    if erfolgreich then",
        `        TriggerServerEvent('${ev}')`,
        "    end",
        "end, false)",
      ];
      return {
        files: {
          "fxmanifest.lua": manifest(res, fw, { desc: "Ladebalken /" + cmd, oxlib: true }),
          "client.lua": C.join("\n") + "\n",
          "server.lua": S.join("\n") + "\n",
        },
        notes: ["Dieses Script braucht ox_lib. Es muss in der server.cfg vor dem Script gestartet werden.", `Im Spiel: /${cmd}`],
      };
    },

    vehicle(p, fw, res) {
      const cmd = ident(p.cmd, "auto");
      const model = ident(p.model, "adder");
      const ev = res + ":spawn";
      const S = serverHead(fw).concat(serverNotify(fw), adminCheck(fw), [
        `RegisterCommand('${cmd}', function(source, args)`,
        "    local src = source",
        "    if src == 0 then return end",
        ...noAdmin(), "",
        `    local model = args[1] or '${model}'`,
        "    if not model:match('^[%w_]+$') then",
        "        notify(src, 'Ungültiger Modellname.')",
        "        return",
        "    end", "",
        `    TriggerClientEvent('${ev}', src, model)`,
        "end, false)",
      ]);
      const C = clientNotify(fw).concat([
        `RegisterNetEvent('${ev}', function(modelName)`,
        "    local hash = GetHashKey(modelName)",
        "    if not IsModelInCdimage(hash) or not IsModelAVehicle(hash) then",
        "        notify('Dieses Fahrzeug gibt es nicht.')",
        "        return",
        "    end", "",
        "    RequestModel(hash)",
        "    local versuche = 0",
        "    while not HasModelLoaded(hash) and versuche < 100 do",
        "        Wait(50)",
        "        versuche = versuche + 1",
        "    end",
        "    if not HasModelLoaded(hash) then",
        "        notify('Das Modell konnte nicht geladen werden.')",
        "        return",
        "    end", "",
        "    local ped = PlayerPedId()",
        "    local pos = GetEntityCoords(ped)",
        "    local veh = CreateVehicle(hash, pos.x, pos.y, pos.z, GetEntityHeading(ped), true, false)",
        "    SetPedIntoVehicle(ped, veh, -1)",
        "    SetModelAsNoLongerNeeded(hash)",
        "end)",
      ]);
      return {
        files: {
          "fxmanifest.lua": manifest(res, fw, { desc: "Fahrzeug spawnen mit /" + cmd }),
          "client.lua": C.join("\n") + "\n",
          "server.lua": S.join("\n") + "\n",
        },
        notes: [`Im Spiel (Admin): /${cmd} oder /${cmd} <Modellname>`],
      };
    },

    ui(p, fw, res) {
      const cmd = ident(p.cmd, "menue");
      const title = String(p.title || "Menü").slice(0, 40);
      const labels = String(p.buttons || "Option 1, Option 2, Option 3")
        .split(",").map((s) => s.trim()).filter(Boolean).slice(0, 6);
      if (!labels.length) labels.push("Option 1");
      const key = (String(p.key || "F5").trim().toUpperCase().replace(/[^A-Z0-9]/g, "") || "F5").slice(0, 3);
      const accent = hexColor(p.color, "#7c5cff");
      const ev = res + ":auswahl";

      const C = [
        "local offen = false", "",
        "local function setOffen(status)",
        "    offen = status",
        "    SetNuiFocus(status, status)",
        "    SendNUIMessage({ action = status and 'open' or 'close' })",
        "end", "",
        `RegisterCommand('${cmd}', function()`,
        "    setOffen(not offen)",
        "end, false)", "",
        `RegisterKeyMapping('${cmd}', 'Menü öffnen', 'keyboard', '${key}')`, "",
        "RegisterNUICallback('close', function(_, cb)",
        "    setOffen(false)",
        "    cb('ok')",
        "end)", "",
        "RegisterNUICallback('select', function(data, cb)",
        `    TriggerServerEvent('${ev}', data.id)`,
        "    setOffen(false)",
        "    cb('ok')",
        "end)",
      ];
      const S = serverHead(fw).concat(serverNotify(fw), [
        `RegisterNetEvent('${ev}', function(id)`,
        "    local src = source",
        `    if type(id) ~= 'number' or id < 1 or id > ${labels.length} then return end`, "",
        "    -- Hier kommt die Aktion für die gewählte Option hin",
        "    notify(src, 'Du hast Option ' .. id .. ' gewählt.')",
        "end)",
      ]);

      const buttons = labels
        .map((l, i) => `      <button data-id="${i + 1}">${esc(l)}</button>`).join("\n");
      const html = [
        "<!DOCTYPE html>",
        '<html lang="de">',
        "<head>",
        '  <meta charset="UTF-8">',
        `  <title>${esc(title)}</title>`,
        '  <link rel="stylesheet" href="style.css">',
        "</head>",
        "<body>",
        '  <div id="menu" class="hidden">',
        `    <h1>${esc(title)}</h1>`,
        '    <div id="buttons">',
        buttons,
        "    </div>",
        '    <button id="close" class="close">Schließen</button>',
        "  </div>",
        '  <script src="script.js"></script>',
        "</body>",
        "</html>",
      ].join("\n") + "\n";

      const css = [
        ":root { --accent: " + accent + "; --bg: #12151d; --text: #e6e9f2; }",
        "* { box-sizing: border-box; margin: 0; padding: 0; }",
        "body { background: transparent; font-family: 'Segoe UI', sans-serif; color: var(--text); }",
        ".hidden { display: none; }",
        "#menu {",
        "  position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);",
        "  width: 340px; padding: 26px; border-radius: 18px;",
        "  background: var(--bg); border: 1px solid var(--accent);",
        "  box-shadow: 0 20px 60px rgba(0, 0, 0, .6);",
        "}",
        "h1 { font-size: 20px; margin-bottom: 18px; text-align: center; }",
        "#buttons { display: flex; flex-direction: column; gap: 10px; }",
        "button {",
        "  padding: 12px; border: 0; border-radius: 10px; cursor: pointer;",
        "  font-size: 14px; font-weight: 600; color: #fff; background: var(--accent);",
        "}",
        "button:hover { filter: brightness(1.15); }",
        ".close { margin-top: 14px; width: 100%; background: #232838; }",
      ].join("\n") + "\n";

      const js = [
        "const menu = document.getElementById('menu');", "",
        "function post(name, data) {",
        "  return fetch('https://' + GetParentResourceName() + '/' + name, {",
        "    method: 'POST',",
        "    headers: { 'Content-Type': 'application/json; charset=UTF-8' },",
        "    body: JSON.stringify(data || {}),",
        "  });",
        "}", "",
        "window.addEventListener('message', (e) => {",
        "  if (e.data.action === 'open') menu.classList.remove('hidden');",
        "  if (e.data.action === 'close') menu.classList.add('hidden');",
        "});", "",
        "document.querySelectorAll('#buttons button').forEach((b) => {",
        "  b.addEventListener('click', () => post('select', { id: Number(b.dataset.id) }));",
        "});", "",
        "document.getElementById('close').addEventListener('click', () => post('close'));",
        "document.addEventListener('keyup', (e) => {",
        "  if (e.key === 'Escape') post('close');",
        "});",
      ].join("\n") + "\n";

      return {
        files: {
          "fxmanifest.lua": manifest(res, fw, { desc: "UI-Menü /" + cmd, ui: true }),
          "client.lua": C.join("\n") + "\n",
          "server.lua": S.join("\n") + "\n",
          "html/index.html": html,
          "html/style.css": css,
          "html/script.js": js,
        },
        notes: [`Im Spiel: /${cmd} oder Taste ${key}. Schließen mit ESC.`, "Die Aktionen der Buttons trägst du in server.lua ein."],
      };
    },
  };

  const TYPES = {
    command: {
      label: "Chat-Befehl",
      fields: [
        { id: "cmd", label: "Befehlsname (ohne /)", def: "hallo" },
        { id: "text", label: "Nachricht an den Spieler", def: "Hallo und willkommen!" },
        { id: "admin", label: "Nur für Admins", type: "check", def: false },
      ],
    },
    item: {
      label: "Benutzbares Item (heilt)",
      fields: [
        { id: "item", label: "Item-Name (z. B. bandage)", def: "bandage" },
        { id: "heal", label: "Heilung (Lebenspunkte, 1–200)", def: "25" },
        { id: "text", label: "Nachricht beim Benutzen", def: "Du hast dich verbunden." },
      ],
    },
    notify: {
      label: "Ankündigung an alle (Admin)",
      fields: [
        { id: "cmd", label: "Befehlsname (ohne /)", def: "ankuendigung" },
        { id: "prefix", label: "Text davor", def: "[Ankündigung] " },
      ],
    },
    marker: {
      label: "Marker mit Aktion (Taste E)",
      fields: [
        { id: "pos", label: "Koordinaten (x, y, z)", def: "195.17, -933.77, 30.69" },
        { id: "text", label: "Hilfetext", def: "Drücke E zum Benutzen" },
      ],
    },
    progress: {
      label: "Ladebalken-Aktion (ox_lib)",
      fields: [
        { id: "cmd", label: "Befehlsname (ohne /)", def: "arbeiten" },
        { id: "label", label: "Text im Ladebalken", def: "Du arbeitest..." },
        { id: "seconds", label: "Dauer in Sekunden", def: "5" },
      ],
    },
    vehicle: {
      label: "Fahrzeug spawnen (Admin)",
      fields: [
        { id: "cmd", label: "Befehlsname (ohne /)", def: "auto" },
        { id: "model", label: "Standard-Fahrzeug", def: "adder" },
      ],
    },
    ui: {
      label: "UI-Menü (HTML/CSS/JS)",
      fields: [
        { id: "cmd", label: "Befehlsname (ohne /)", def: "menue" },
        { id: "title", label: "Titel", def: "Mein Menü" },
        { id: "buttons", label: "Buttons (mit Komma trennen, max. 6)", def: "Option 1, Option 2, Option 3" },
        { id: "color", label: "Farbe (Hex, z. B. #7c5cff)", def: "#7c5cff" },
        { id: "key", label: "Taste zum Öffnen", def: "F5" },
      ],
    },
  };

  function generate(type, fw, resName, params) {
    const fn = GEN[type];
    if (!fn) throw new Error("Unbekannter Typ: " + type);
    const res = ident(resName, "mein_script");
    const framework = fw === "qb" || fw === "standalone" ? fw : "esx";
    const out = fn(params || {}, framework, res);
    out.resource = res;
    return out;
  }

  // ---------- Oberfläche ----------
  function el(tag, props, children) {
    const n = document.createElement(tag);
    Object.assign(n, props || {});
    (children || []).forEach((c) => n.appendChild(c));
    return n;
  }

  function render(box) {
    if (box.dataset.ready === "1") return;
    box.dataset.ready = "1";

    let result = null;
    let currentFile = "";

    const note = el("div", {
      className: "vnote",
      textContent:
        "Die Scripts sind Vorlagen aus festen Bausteinen. Teste sie auf einem Testserver, bevor du sie live nutzt. " +
        "Passe Gruppen, Items und Rechte an dein Setup an.",
    });

    const typeSel = el("select", { id: "gType" });
    Object.keys(TYPES).forEach((k) => typeSel.appendChild(el("option", { value: k, textContent: TYPES[k].label })));

    const fwSel = el("select", { id: "gFw" });
    [["esx", "ESX"], ["qb", "QBCore"], ["standalone", "Standalone"]].forEach(([v, t]) =>
      fwSel.appendChild(el("option", { value: v, textContent: t })));

    const resInput = el("input", { type: "text", id: "gRes", value: "mein_script" });

    const fieldsBox = el("div", { className: "vgrid full" });

    function field(label, node, full) {
      const w = el("div", { className: full ? "full" : "" });
      w.appendChild(el("label", { textContent: label }));
      w.appendChild(node);
      return w;
    }

    function renderFields() {
      fieldsBox.innerHTML = "";
      TYPES[typeSel.value].fields.forEach((f) => {
        let input;
        if (f.type === "check") {
          input = el("input", { type: "checkbox", id: "gf_" + f.id, checked: !!f.def });
          const w = el("div", { className: "full" });
          const lab = el("label", { className: "chk" });
          lab.appendChild(input);
          lab.appendChild(document.createTextNode(" " + f.label));
          w.appendChild(lab);
          fieldsBox.appendChild(w);
        } else {
          input = el("input", { type: "text", id: "gf_" + f.id, value: f.def });
          fieldsBox.appendChild(field(f.label, input));
        }
      });
    }
    typeSel.addEventListener("change", renderFields);
    renderFields();

    const grid = el("div", { className: "vgrid" });
    grid.appendChild(field("Art des Scripts", typeSel));
    grid.appendChild(field("Framework", fwSel));
    grid.appendChild(field("Name der Resource (nur a–z, 0–9, _)", resInput, true));
    grid.appendChild(fieldsBox);

    const tabs = el("div", { className: "tabs" });
    const out = el("div", { className: "vout", id: "gOut", textContent: "Eingaben machen und auf „Script erstellen“ klicken." });
    const notesBox = el("div", { className: "gnotes" });
    const status = el("div", { className: "gstatus" });

    function showFile(name) {
      currentFile = name;
      out.textContent = result.files[name];
      Array.from(tabs.children).forEach((t) => t.classList.toggle("active", t.textContent === name));
    }

    function build() {
      const params = {};
      TYPES[typeSel.value].fields.forEach((f) => {
        const n = document.getElementById("gf_" + f.id);
        params[f.id] = f.type === "check" ? n.checked : n.value;
      });
      try {
        result = generate(typeSel.value, fwSel.value, resInput.value, params);
      } catch (e) {
        out.textContent = "Fehler: " + e.message;
        return;
      }
      tabs.innerHTML = "";
      Object.keys(result.files).forEach((name) => {
        const t = el("button", { className: "tab", textContent: name });
        t.addEventListener("click", () => showFile(name));
        tabs.appendChild(t);
      });
      notesBox.innerHTML = "";
      const notes = (result.notes || []).concat([
        `Ordner "${result.resource}" in resources legen und in der server.cfg "ensure ${result.resource}" eintragen.`,
      ]);
      notes.forEach((n) => notesBox.appendChild(el("div", { textContent: "• " + n })));
      status.textContent = "";
      showFile("fxmanifest.lua");
    }

    const genBtn = el("button", { className: "btn", textContent: "Script erstellen" });
    genBtn.addEventListener("click", build);

    const copyBtn = el("button", { className: "btn alt", textContent: "Datei kopieren" });
    copyBtn.addEventListener("click", () => {
      if (!result) return;
      navigator.clipboard.writeText(result.files[currentFile]);
      status.textContent = currentFile + " kopiert.";
    });

    const saveBtn = el("button", { className: "btn alt", textContent: "Als Ordner speichern" });
    saveBtn.addEventListener("click", async () => {
      if (!result) return;
      try {
        const r = await window.api.save_files(result.resource, result.files);
        if (r && r.ok) status.textContent = "Gespeichert in: " + r.path;
        else if (r && r.canceled) status.textContent = "Abgebrochen.";
        else status.textContent = (r && r.error) || "Speichern fehlgeschlagen.";
      } catch (e) {
        status.textContent = "Speichern fehlgeschlagen: " + e;
      }
    });

    const btns = el("div", { className: "row-btns" }, [genBtn, copyBtn, saveBtn]);

    box.appendChild(note);
    box.appendChild(grid);
    box.appendChild(btns);
    box.appendChild(status);
    box.appendChild(tabs);
    box.appendChild(out);
    box.appendChild(notesBox);
  }

  const api = { render, generate, TYPES };
  if (typeof window !== "undefined") window.DrufGen = api;
  if (typeof module !== "undefined") module.exports = api;
})();
