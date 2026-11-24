// DRuf – zusätzliche Wissenseinträge (werden an knowledge.js angehängt)

module.exports = [
  // ================= BEWERBUNGEN / KONZEPTE =================
  {
    id: "whitelist-bewerbung",
    mode: "bewerbungen",
    keywords: ["whitelist", "whitelist bewerbung", "whitelisting", "serverbewerbung", "spielerbewerbung"],
    answer: `Eine Whitelist-Bewerbung besteht meist aus drei Teilen: Angaben zu dir, dein Charakter und Fragen zu den Regeln. Dazu kommt oft eine Beispielsituation.

Wenn du "schreib die" sagst, bekommst du eine fertige Vorlage mit Platzhaltern.`,
  },
  {
    id: "medic-bewerbung",
    mode: "bewerbungen",
    keywords: ["medic bewerbung", "rettungsdienst bewerbung", "sanitäter", "lsmd", "medic", "notarzt", "arzt bewerbung"],
    answer: `Beim Rettungsdienst zählen Ruhe, Eigensicherung und Umgang mit Patienten. Beschreibe, wie dein Charakter bei einem Unfall mit mehreren Verletzten vorgeht und wie er mit Angehörigen spricht.

Wenn du "schreib die" sagst, bekommst du eine fertige Vorlage.`,
  },
  {
    id: "mechaniker-bewerbung",
    mode: "bewerbungen",
    keywords: ["mechaniker", "werkstatt", "mechaniker bewerbung", "bennys", "tuner bewerbung"],
    answer: `Bei einer Mechaniker-Bewerbung zeigst du, was dein Charakter kann (Reparatur, Tuning) und wie er mit Kunden umgeht. Eine Beispielsituation mit einem unzufriedenen Kunden kommt gut an.

Wenn du "schreib die" sagst, bekommst du eine fertige Vorlage.`,
  },
  {
    id: "fraktionskonzept",
    mode: "bewerbungen",
    keywords: ["fraktionskonzept", "konzept fraktion", "fraktion konzept", "konzept schreiben", "konzept", "fraktionsidee"],
    answer: `Ein gutes Fraktionskonzept enthält: Idee und Setting, Aufgaben, Rangordnung, Aufnahme, Regeln, Ausrüstung und Fahrzeuge, Zusammenarbeit und Ziele.

Wenn du "schreib die" sagst, bekommst du eine fertige Vorlage mit Rangtabelle.`,
  },
  {
    id: "serverkonzept",
    mode: "bewerbungen",
    keywords: ["serverkonzept", "server konzept", "konzept server", "servervorstellung", "projektkonzept", "serverprojekt"],
    answer: `Ein Serverkonzept erklärt Grundidee, Zielgruppe, Technik, Spielinhalt, Regelwerk, Team und Roadmap.

Wenn du "schreib die" sagst, bekommst du eine fertige Vorlage.`,
  },
  {
    id: "eventkonzept",
    mode: "bewerbungen",
    keywords: ["eventkonzept", "event konzept", "event planen", "veranstaltung", "event organisieren", "eventplanung"],
    answer: `Ein Eventkonzept braucht Datum, Ort, Idee, Ablauf, Regeln, Preise und einen Ankündigungstext.

Wenn du "schreib die" sagst, bekommst du eine fertige Vorlage.`,
  },

  // ================= SCRIPTS =================
  {
    id: "ox-inventory-item",
    mode: "scripts",
    keywords: ["items.lua", "item hinzufügen", "neues item", "ox_inventory item", "item erstellen", "item anlegen"],
    answer: `Bei ox_inventory legst du Items in ox_inventory/data/items.lua an:

\`\`\`lua
['bandage'] = {
    label = 'Bandage',
    weight = 115,
    stack = true,
    close = true,
    description = 'Zum Verbinden von Wunden.',
    client = {
        event = 'meinscript:bandage',
    },
},
\`\`\`

Mit client.event wird beim Benutzen das Event auf dem Client ausgelöst. Das Item-Bild kommt in ox_inventory/web/images als bandage.png. Nach Änderungen die Resource neu starten.

Den passenden Event-Code erzeugt dir der Script-Generator (Art: Benutzbares Item).`,
  },
  {
    id: "ox-target",
    mode: "scripts",
    keywords: ["ox_target", "target", "alt-auge", "alt auge", "interaktion", "interaktionsmenü", "auge"],
    answer: `Mit ox_target fügst du Optionen für Fahrzeuge, Personen oder Objekte hinzu. Beispiel für alle Fahrzeuge (client.lua):

\`\`\`lua
exports.ox_target:addGlobalVehicle({
    {
        name = 'meinscript_reparieren',
        label = 'Reparieren',
        icon = 'fa-solid fa-wrench',
        distance = 2.5,
        onSelect = function(data)
            -- data.entity ist das Fahrzeug
            SetVehicleFixed(data.entity)
        end,
    },
})
\`\`\`

Die Option erscheint, wenn der Spieler die Alt-Taste hält und das Fahrzeug anschaut. Rechte prüfst du zusätzlich mit canInteract oder serverseitig.`,
  },
  {
    id: "geld-geben",
    mode: "scripts",
    keywords: ["geld geben", "addmoney", "geld hinzufügen", "bank geld", "addaccountmoney", "geld entfernen", "removemoney"],
    answer: `So gibst du einem Spieler Geld (immer serverseitig):

**ESX:**
\`\`\`lua
local xPlayer = ESX.GetPlayerFromId(source)
xPlayer.addMoney(500)                    -- Bargeld
xPlayer.addAccountMoney('bank', 500)     -- Bank
xPlayer.removeMoney(100)
\`\`\`

**QBCore:**
\`\`\`lua
local Player = QBCore.Functions.GetPlayer(source)
Player.Functions.AddMoney('cash', 500)
Player.Functions.AddMoney('bank', 500)
Player.Functions.RemoveMoney('cash', 100)
\`\`\`

Prüfe vorher, ob der Spieler die Aktion wirklich auslösen darf. Beträge nie vom Client übernehmen.`,
  },
  {
    id: "nui-grundlagen",
    mode: "scripts",
    keywords: ["nui", "ui erstellen", "html menü", "menü bauen", "sendnuimessage", "setnuifocus", "html ui", "ui bauen", "oberfläche"],
    answer: `Ein eigenes Menü (NUI) besteht aus drei Teilen:

1. **client.lua:** öffnet das Menü mit SetNuiFocus(true, true) und schickt Daten mit SendNUIMessage.
2. **html-Ordner:** index.html, style.css und script.js. Im JavaScript hörst du mit window.addEventListener('message', ...) auf Nachrichten.
3. **Rückweg:** Das JavaScript meldet Klicks per fetch an https://RESOURCENAME/ereignis. In der client.lua fängst du sie mit RegisterNUICallback ab.

In der fxmanifest.lua brauchst du ui_page 'html/index.html' und files { 'html/**' }.

Ein fertiges Menü mit allen Dateien erzeugt der Script-Generator (Art: UI-Menü).`,
  },
  {
    id: "script-generator-hinweis",
    mode: "scripts",
    keywords: ["komplettes script", "ganzes script", "fertiges script", "script erstellen", "script generieren", "client server script", "client und server"],
    answer: `Fertige Scripts mit fxmanifest.lua, client.lua und server.lua (und bei Bedarf UI-Dateien) erzeugst du im Bereich **Script-Generator** in der Seitenleiste.

Verfügbar sind: Chat-Befehl, benutzbares Item, Ankündigung, Marker mit Aktion, Ladebalken, Fahrzeug spawnen und UI-Menü. Dazu wählst du ESX, QBCore oder Standalone.

Für besondere Wünsche kannst du hier im Chat nach einzelnen Bausteinen fragen, zum Beispiel Blip, Animation oder Datenbank.`,
  },

  // ================= FRAGEN =================
  {
    id: "job-erstellen-esx",
    mode: "fragen",
    keywords: ["job erstellen", "neuen job", "job_grades", "jobs tabelle", "job hinzufügen", "job anlegen", "neuer job"],
    answer: `Bei ESX legst du einen Job in der Datenbank an (Tabellen jobs und job_grades):

\`\`\`sql
INSERT INTO jobs (name, label) VALUES ('mechanic', 'Mechaniker');

INSERT INTO job_grades (job_name, grade, name, label, salary, skin_male, skin_female) VALUES
('mechanic', 0, 'recruit', 'Azubi', 200, '{}', '{}'),
('mechanic', 1, 'worker', 'Mechaniker', 300, '{}', '{}'),
('mechanic', 2, 'boss', 'Chef', 450, '{}', '{}');
\`\`\`

Danach den Server neu starten. Setzen kannst du den Job mit dem Befehl /setjob ID mechanic 0 (je nach Setup nur für Admins).`,
  },
  {
    id: "konsole-fehler",
    mode: "fragen",
    keywords: ["no such export", "such export", "script error", "couldn't load resource", "failed to load script", "konsole", "f8", "fehlermeldung", "konsolenfehler"],
    answer: `Häufige Fehlermeldungen und ihre Ursache:

- **No such export X in resource Y:** Die Resource Y läuft nicht, steht in der server.cfg zu spät, oder der Export heißt anders. Starte Y vor dem Script, das sie nutzt.
- **SCRIPT ERROR: @resource/datei.lua:ZEILE: ...:** Der Fehler steht in genau dieser Datei und Zeile. Schau dir die Zeile an und die Zeile davor.
- **Couldn't load resource X:** Die fxmanifest.lua fehlt oder liegt nicht direkt im Ordner.
- **Failed to load script datei.lua:** Syntaxfehler in der Datei, zum Beispiel ein fehlendes end oder eine fehlende Klammer.
- **attempt to index a nil value:** Eine Variable ist leer (siehe Thema nil).

Schick mir die genaue Meldung, dann sage ich dir, wo du suchen musst.`,
  },
  {
    id: "mysql-verbindung",
    mode: "fragen",
    keywords: ["connection string", "mysql_connection_string", "datenbank verbindung", "unable to establish", "oxmysql fehler", "access denied for user", "datenbank fehler", "verbindung zur datenbank"],
    answer: `Wenn oxmysql keine Verbindung bekommt, prüfe die Zeile in der server.cfg:

\`\`\`
set mysql_connection_string "mysql://benutzer:passwort@localhost/datenbankname?charset=utf8mb4"
\`\`\`

Typische Fehler:
- **Access denied for user:** Benutzername oder Passwort falsch.
- **Unknown database:** Die Datenbank mit diesem Namen existiert nicht. Lege sie an und importiere die .sql-Datei deines Frameworks.
- **Unable to establish connection:** Der MySQL-Server läuft nicht oder Host und Port stimmen nicht.
- Sonderzeichen im Passwort müssen in der Adresse URL-kodiert werden (z. B. @ als %40).`,
  },
  {
    id: "addon-fahrzeug",
    mode: "fragen",
    keywords: ["addon fahrzeug", "addon auto", "stream ordner", "vehicles.meta", "carvariations", "fahrzeug hinzufügen", "auto einbauen", "auto hinzufügen", "addon car"],
    answer: `Ein Addon-Fahrzeug besteht aus zwei Teilen: den Modelldateien (.yft, .ytd) im Ordner stream und den Daten (.meta) im Ordner data. Die fxmanifest.lua dazu:

\`\`\`lua
fx_version 'cerulean'
game 'gta5'

files {
    'data/handling.meta',
    'data/vehicles.meta',
    'data/carvariations.meta',
    'data/carcols.meta',
    'data/vehiclelayouts.meta',
}

data_file 'HANDLING_FILE' 'data/handling.meta'
data_file 'VEHICLE_METADATA_FILE' 'data/vehicles.meta'
data_file 'VEHICLE_VARIATION_FILE' 'data/carvariations.meta'
data_file 'CARCOLS_FILE' 'data/carcols.meta'
data_file 'VEHICLE_LAYOUTS_FILE' 'data/vehiclelayouts.meta'
\`\`\`

Nicht jedes Fahrzeug hat alle Dateien. Trage nur die ein, die vorhanden sind. Der Name im Spiel (Spawnname) steht in der vehicles.meta unter modelName.`,
  },
  {
    id: "handling-meta",
    mode: "fragen",
    keywords: ["handling.meta", "handling", "bodenhaftung", "ftractioncurve", "höchstgeschwindigkeit", "fahrverhalten", "auto schneller"],
    answer: `Die wichtigsten Werte in der handling.meta:

- **fMass:** Gewicht. Schwerer bedeutet träger.
- **fInitialDriveForce:** Beschleunigung. Höher beschleunigt schneller.
- **fInitialDriveMaxFlatVel:** ungefähr die Höchstgeschwindigkeit. Die tatsächliche Endgeschwindigkeit weicht durch Luftwiderstand ab.
- **fBrakeForce:** Bremskraft.
- **fSteeringLock:** Lenkwinkel in Grad. Größer bedeutet engere Kurven.
- **fTractionCurveMax / fTractionCurveMin:** Bodenhaftung. Min darf nicht größer als Max sein.
- **fTractionCurveLateral:** Seitenhaftung in Kurven.

Ändere immer nur wenige Werte auf einmal und teste jede Änderung. Extreme Werte machen das Auto unfahrbar.

Im Bereich **Fahrzeug-Einstellungen** kannst du die Werte eintragen und die Datei erzeugen lassen.`,
  },
  {
    id: "server-cfg-einstellungen",
    mode: "fragen",
    keywords: ["maxclients", "sv_hostname", "endpoint", "port 30120", "slots", "spielerzahl", "server name"],
    answer: `Wichtige Grundeinstellungen in der server.cfg:

\`\`\`
endpoint_add_tcp "0.0.0.0:30120"
endpoint_add_udp "0.0.0.0:30120"

sv_hostname "Mein Server"
sv_maxclients 48
sv_licenseKey "dein_schluessel"
\`\`\`

Der Port 30120 muss in der Firewall und im Router (bei Hosting zu Hause) für TCP und UDP freigegeben sein. Die Spielerzahl hängt von deiner Lizenz ab.`,
  },
];
