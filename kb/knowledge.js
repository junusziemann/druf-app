// DRuf – eigene Wissensdatenbank (offline, ohne externe KI)
// Jeder Eintrag: mode = scripts | bewerbungen | fragen | alle
// keywords = Stichwörter (klein geschrieben). Treffer werden gewichtet.

module.exports = [
  // ================= SCRIPTS =================
  {
    id: "fxmanifest",
    mode: "scripts",
    keywords: ["fxmanifest", "manifest", "ordnerstruktur", "aufbau", "resource aufbauen"],
    answer: `Jede FiveM-Resource braucht eine fxmanifest.lua im Hauptordner.

\`\`\`lua
fx_version 'cerulean'
game 'gta5'
lua54 'yes'

author 'Dein Name'
description 'Beschreibung'
version '1.0.0'

shared_script '@ox_lib/init.lua' -- nur wenn ox_lib genutzt wird
client_script 'client.lua'
server_script 'server.lua'
\`\`\`

Ordnerstruktur: mein_script/fxmanifest.lua, client.lua, server.lua. Danach in der server.cfg mit "ensure mein_script" laden.`
  },
  {
    id: "command-esx",
    mode: "scripts",
    keywords: ["command", "befehl", "registercommand", "chatbefehl", "chat befehl", "/"],
    answer: `Ein Chat-Befehl wird serverseitig mit RegisterCommand angelegt. Beispiel für ESX (server.lua):

\`\`\`lua
ESX = exports['es_extended']:getSharedObject()

RegisterCommand('hallo', function(source, args)
    local xPlayer = ESX.GetPlayerFromId(source)
    if not xPlayer then return end
    TriggerClientEvent('chat:addMessage', source, {
        args = { 'System', 'Hallo ' .. xPlayer.getName() }
    })
end, false)
\`\`\`

Der dritte Parameter false bedeutet: Jeder Spieler darf den Befehl nutzen. Für Admin-Befehle nutze true und prüfe zusätzlich die Gruppe mit xPlayer.getGroup().`
  },
  {
    id: "notify",
    mode: "scripts",
    keywords: ["notify", "benachrichtigung", "popup", "nachricht anzeigen", "hinweis"],
    answer: `Hinweise für Spieler gibt es je nach Framework:

**ox_lib (client.lua):**
\`\`\`lua
lib.notify({
    title = 'Info',
    description = 'Dein Text hier',
    type = 'success' -- success, error, warning oder inform
})
\`\`\`

**ESX (älterer Weg):**
\`\`\`lua
ESX.ShowNotification('Dein Text hier')
\`\`\`

ox_lib-Notify funktioniert nur, wenn die Resource ox_lib gestartet ist und in der fxmanifest eingebunden wurde.`
  },
  {
    id: "keybind",
    mode: "scripts",
    keywords: ["taste", "keybind", "tastenbelegung", "registerkeymapping", "tastendruck", "knopf"],
    answer: `Eine Taste, die Spieler selbst umbelegen können, legst du so an (client.lua):

\`\`\`lua
RegisterCommand('meinbefehl', function()
    print('Taste wurde gedrückt')
end, false)

RegisterKeyMapping('meinbefehl', 'Beschreibung im Menü', 'keyboard', 'E')
\`\`\`

Der Befehl meinbefehl erscheint dann in den FiveM-Einstellungen unter Tastenbelegung.`
  },
  {
    id: "blip",
    mode: "scripts",
    keywords: ["blip", "karte", "map", "kartenmarker", "addblipforcoord"],
    answer: `Ein Blip ist der Punkt auf der Karte (client.lua):

\`\`\`lua
local blip = AddBlipForCoord(x, y, z)
SetBlipSprite(blip, 1)
SetBlipColour(blip, 3)
SetBlipScale(blip, 0.8)
SetBlipAsShortRange(blip, true)
BeginTextCommandSetBlipName('STRING')
AddTextComponentString('Mein Ort')
EndTextCommandSetBlipName(blip)
\`\`\`

Die Sprite-Nummer bestimmt das Symbol. Eine Übersicht findest du in der Dokumentation von FiveM unter Blips.`
  },
  {
    id: "marker",
    mode: "scripts",
    keywords: ["marker", "drawmarker", "zone", "bereich", "markierung"],
    answer: `Ein Marker zeigt einen Bereich an. Das Beispiel prüft die Entfernung und zeichnet nur in der Nähe (client.lua):

\`\`\`lua
local ziel = vector3(x, y, z)

CreateThread(function()
    while true do
        local sleep = 1000
        local pos = GetEntityCoords(PlayerPedId())
        local dist = #(pos - ziel)
        if dist < 10.0 then
            sleep = 0
            DrawMarker(1, ziel.x, ziel.y, ziel.z - 1.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
                1.5, 1.5, 1.0, 255, 0, 0, 150, false, true, 2, false, nil, nil, false)
        end
        Wait(sleep)
    end
end)
\`\`\`

Die Wait-Zeit auf 1000 ms senkt die Last, wenn niemand in der Nähe ist.`
  },
  {
    id: "progress",
    mode: "scripts",
    keywords: ["progress", "ladebalken", "progressbar", "fortschritt", "balken"],
    answer: `Mit ox_lib zeigst du einen Ladebalken an (client.lua):

\`\`\`lua
local erfolgreich = lib.progressBar({
    duration = 5000,
    label = 'Wird ausgeführt...',
    useWhileDead = false,
    canCancel = true,
    disable = { move = true, car = true }
})

if erfolgreich then
    print('Fertig')
end
\`\`\`

Die Rückgabe ist true, wenn der Balken vollständig lief, und false bei Abbruch.`
  },
  {
    id: "usable-item",
    mode: "scripts",
    keywords: ["item", "usable", "benutzbar", "item nutzen", "useitem", "registerusableitem", "ox_inventory"],
    answer: `Ein Item, das Spieler benutzen können, registrierst du serverseitig. Beispiel für ESX (server.lua):

\`\`\`lua
ESX.RegisterUsableItem('bandage', function(source)
    local xPlayer = ESX.GetPlayerFromId(source)
    if not xPlayer then return end
    if xPlayer.getInventoryItem('bandage').count < 1 then return end

    xPlayer.removeInventoryItem('bandage', 1)
    TriggerClientEvent('meinscript:heilen', source)
end)
\`\`\`

Die Prüfung und das Entfernen des Items passieren auf dem Server. Der Client darf nur den Effekt auslösen. So können Spieler das Item nicht fälschen.`
  },
  {
    id: "server-event",
    mode: "scripts",
    keywords: ["event", "trigger", "triggerserverevent", "sicherheit", "cheater", "absichern", "server event"],
    answer: `Events sind ein häufiger Angriffspunkt. So sicherst du sie ab:

- Prüfe auf dem Server immer Geld, Items, Rechte und Positionen, nie nur auf dem Client.
- Hole die Spieler-ID über source und nicht aus den übergebenen Daten.
- Begrenze Häufigkeit und Werte, zum Beispiel bei Beträgen.

\`\`\`lua
RegisterNetEvent('meinscript:bezahlen', function(betrag)
    local src = source
    local xPlayer = ESX.GetPlayerFromId(src)
    if not xPlayer then return end
    if type(betrag) ~= 'number' or betrag <= 0 or betrag > 10000 then return end
    if xPlayer.getMoney() < betrag then return end
    xPlayer.removeMoney(betrag)
end)
\`\`\``
  },
  {
    id: "mysql",
    mode: "scripts",
    keywords: ["mysql", "datenbank", "oxmysql", "sql", "query", "database", "speichern"],
    answer: `Mit oxmysql liest und schreibt man Daten (server.lua):

\`\`\`lua
-- Lesen (wartet auf das Ergebnis)
local ergebnis = MySQL.query.await('SELECT * FROM users WHERE identifier = ?', { identifier })

-- Schreiben
MySQL.update.await('UPDATE users SET money = ? WHERE identifier = ?', { betrag, identifier })
\`\`\`

Verwende immer Platzhalter mit ? und übergib die Werte in der Liste. So verhinderst du SQL-Injection. Die Resource oxmysql muss vor deinem Script gestartet werden.`
  },
  {
    id: "lua-nil",
    mode: "scripts",
    keywords: ["nil", "attempt to index", "fehler", "error", "bug", "kaputt", "funktioniert nicht"],
    answer: `Die Meldung "attempt to index a nil value" bedeutet: Eine Variable ist nil, und du greifst auf ein Feld davon zu.

Typische Ursachen:
- Das Framework-Objekt wurde nicht geladen, zum Beispiel ESX. Prüfe, ob die Zeile ESX = exports['es_extended']:getSharedObject() existiert und die Resource gestartet ist.
- Ein Spieler ist nicht mehr online. Prüfe mit if not xPlayer then return end.
- Eine Funktion gibt nichts zurück, obwohl du ein Ergebnis erwartest.

Schick mir den genauen Fehler mit der Zeilennummer und den betroffenen Code-Ausschnitt, dann finde ich die Stelle schneller.`
  },
  {
    id: "thread-wait",
    mode: "scripts",
    keywords: ["wait", "thread", "loop", "schleife", "performance", "lag", "fps", "createthread", "ruckeln"],
    answer: `Eine Schleife ohne Wait lässt den Client einfrieren. Immer mindestens ein Wait einbauen:

\`\`\`lua
CreateThread(function()
    while true do
        -- deine Prüfung
        Wait(500)
    end
end)
\`\`\`

Faustregel: In der Nähe kleine Wartezeit (0 bis 100 ms), weit weg 500 bis 1000 ms. Vermeide Prüfungen über alle Spieler in jeder Schleife.`
  },
  {
    id: "animation",
    mode: "scripts",
    keywords: ["animation", "emote", "anim", "playanim", "taskplayanim", "bewegung"],
    answer: `So spielst du eine Animation ab (client.lua):

\`\`\`lua
local dict = 'amb@world_human_hang_out_street@male_a@base'
local anim = 'base'

RequestAnimDict(dict)
while not HasAnimDictLoaded(dict) do
    Wait(10)
end

TaskPlayAnim(PlayerPedId(), dict, anim, 8.0, -8.0, -1, 1, 0, false, false, false)
\`\`\`

Mit ClearPedTasks(PlayerPedId()) beendest du die Animation wieder.`
  },
  {
    id: "vehicle-spawn",
    mode: "scripts",
    keywords: ["fahrzeug", "vehicle", "auto spawnen", "spawn auto", "createvehicle", "wagen"],
    answer: `Ein Fahrzeug spawnen und den Spieler hineinsetzen (client.lua):

\`\`\`lua
local hash = GetHashKey('adder')
RequestModel(hash)
while not HasModelLoaded(hash) do
    Wait(10)
end

local veh = CreateVehicle(hash, x, y, z, heading, true, false)
SetPedIntoVehicle(PlayerPedId(), veh, -1)
SetModelAsNoLongerNeeded(hash)
\`\`\`

Ersetze adder durch den Modellnamen. Auf dem Server sollte zusätzlich geprüft werden, wer den Spawn auslösen darf.`
  },
  {
    id: "prop-spawn",
    mode: "scripts",
    keywords: ["prop", "objekt", "spawn objekt", "createobject", "gegenstand platzieren"],
    answer: `Ein Prop (Objekt) erzeugst du so (client.lua):

\`\`\`lua
local hash = GetHashKey('prop_bench_01a')
RequestModel(hash)
while not HasModelLoaded(hash) do
    Wait(10)
end

local obj = CreateObject(hash, x, y, z, true, true, false)
PlaceObjectOnGroundProperly(obj)
SetModelAsNoLongerNeeded(hash)
\`\`\`

Ersetze prop_bench_01a durch den Namen deines Props.`
  },
  {
    id: "teleport",
    mode: "scripts",
    keywords: ["teleport", "tp", "teleportieren", "setentitycoords", "koordinaten"],
    answer: `Einen Spieler teleportieren (client.lua):

\`\`\`lua
SetEntityCoords(PlayerPedId(), x, y, z, false, false, false, true)
\`\`\`

Wenn du den Befehl für andere Spieler nutzt, mach den Teleport serverseitig über TriggerClientEvent und prüfe vorher die Berechtigung.`
  },

  // ================= FRAGEN =================
  {
    id: "framework",
    mode: "fragen",
    keywords: ["esx", "qbcore", "qb", "framework", "welches framework", "ox_core"],
    answer: `Die gängigsten Frameworks für FiveM:

- **ESX** (es_extended): Sehr verbreitet, viele Scripts sind dafür gemacht. Gute Doku und Community.
- **QBCore** (qb-core): Modern und flexibel, eigene Scripts und Strukturen.
- **ox_core**: Neuer Ansatz mit ox_lib als Basis.

Für Anfänger empfehle ich ESX, weil es die meisten fertigen Scripts gibt. Wichtig ist, dass alle Scripts zum gewählten Framework passen.`
  },
  {
    id: "txadmin",
    mode: "fragen",
    keywords: ["txadmin", "einrichten", "setup", "server starten", "installation", "installieren", "erste schritte"],
    answer: `So richtest du den Server mit txAdmin ein:

1. txAdmin herunterladen (von der offiziellen FiveM-Seite) und das Server-Artefakt entpacken.
2. Die Datei run.cmd (Windows) oder run.sh (Linux) starten.
3. Im Browser die angezeigte Adresse öffnen, meist http://localhost:40120.
4. Den Lizenzschlüssel eintragen. Du bekommst ihn im FiveM-Keymaster.
5. Den Server-Ordner und die Standard-Resourcen auswählen und den Server starten.

Scripts legst du in den Ordner resources. In der server.cfg steht dann ensure NAME für jedes Script.`
  },
  {
    id: "server-cfg",
    mode: "fragen",
    keywords: ["server.cfg", "servercfg", "cfg", "ensure", "reihenfolge", "start reihenfolge"],
    answer: `In der server.cfg legst du fest, welche Resourcen beim Start laufen. Beispiel:

\`\`\`
ensure mysql-async
ensure oxmysql
ensure ox_lib
ensure es_extended
ensure mein_script
\`\`\`

Wichtig ist die Reihenfolge: Abhängigkeiten zuerst (zum Beispiel oxmysql und ox_lib), dann die Scripts, die sie nutzen. Mit ensure startest du eine Resource, mit stop stoppst du sie.`
  },
  {
    id: "resource-not-found",
    mode: "fragen",
    keywords: ["resource not found", "not found", "nicht gefunden", "ressource nicht gefunden", "nicht gefunden fehler"],
    answer: `Die Meldung "resource not found" heißt: Die Resource steht in der server.cfg, ist aber nicht im Ordner resources zu finden.

Prüfe:
- Stimmt der Ordnername genau mit dem Namen in ensure überein? Groß- und Kleinschreibung zählt.
- Liegt der Ordner direkt in resources und nicht in einem Unterordner?
- Fehlt die fxmanifest.lua im Ordner?

Wenn du mir den Namen der Resource und die Ordnerstruktur schreibst, sag ich dir genau, was nicht passt.`
  },
  {
    id: "license",
    mode: "fragen",
    keywords: ["lizenz", "license", "licensekey", "lizenzschluessel", "sv_licensekey", "keymaster"],
    answer: `Der Server braucht einen Lizenzschlüssel (sv_licenseKey). Den holst du dir im FiveM-Keymaster. Trage ihn in der server.cfg oder über txAdmin ein:

\`\`\`
sv_licenseKey "dein_schluessel"
\`\`\`

Den Schlüssel teilst du nicht öffentlich, da jeder damit deinen Server betreiben könnte.`
  },
  {
    id: "performance",
    mode: "fragen",
    keywords: ["server lag", "server langsam", "performance server", "serverlag", "ram", "cpu", "server laggt"],
    answer: `Wenn der Server laggt, prüfe in dieser Reihenfolge:

1. Die Resourcen mit txAdmin: Welche Scripts verbrauchen viel? Die Auslastung steht in der Ansicht Performance.
2. Schleifen ohne Wait in deinen Scripts (siehe Thema Thread und Wait).
3. Zu viele Spieler oder Props in einem Bereich.
4. Die Datenbank: Lange Abfragen in jeder Sekunde sind teuer.
5. Der Arbeitsspeicher: Zu wenig RAM führt zu Stottern.

Sag mir, welche Resource auffällt, dann gehe ich sie mit dir durch.`
  },
  {
    id: "voice",
    mode: "fragen",
    keywords: ["voice", "pma", "pma-voice", "sprache", "reichweite", "sprachchat", "funk"],
    answer: `pma-voice ist das gängige Sprachsystem für FiveM. Die Sprachreichweite ändern Spieler über das Menü oder per Befehl, je nach Script.

Wichtig:
- pma-voice muss in der server.cfg vor Scripts stehen, die es nutzen.
- Funk erreicht man über Channels, nicht über Reichweite. Dafür nutzt man meist exports['pma-voice']:setRadioChannel(channel).`
  },
  {
    id: "lizenz-kosten",
    mode: "fragen",
    keywords: ["kostenlos", "kosten", "preis", "gratis", "bezahlen"],
    answer: `FiveM und die Basis-Software sind kostenlos. Ein eigener Server braucht aber einen Rechner oder einen Hosting-Anbieter, der dauerhaft läuft. Bezahlte Scripts gibt es auf Märkten wie Tebex oder Keymaster. Achte bei kostenlosen Scripts darauf, woher sie stammen, damit du keine Schadsoftware einbaust.`
  },

  // ================= BEWERBUNGEN =================
  {
    id: "staff-bewerbung",
    mode: "bewerbungen",
    keywords: ["staff", "team", "admin", "moderator", "mod", "supporter", "staff bewerbung", "teambewerbung"],
    answer: `Eine gute Staff-Bewerbung hat diese Struktur:

1. **Persönliches:** Name oder Spitzname, Alter (falls gefordert), Zeit, die du online bist.
2. **Erfahrung:** Welche Server du kennst und welche Rolle du dort hattest. Nur wahre Angaben.
3. **Motivation:** Warum du dem Team helfen willst, in zwei bis drei Sätzen.
4. **Fähigkeiten:** Was du gut kannst, zum Beispiel Konflikte ruhig klären, Regeln kennen, geduldig erklären.
5. **Ein Beispiel:** Eine kurze Situation, in der du richtig gehandelt hast.

Halte die Antworten kurz und sachlich. Schreib keine Erfahrungen, die du nicht hast. Das Team merkt das schnell.`
  },
  {
    id: "fraktion-bewerbung",
    mode: "bewerbungen",
    keywords: ["fraktion", "polizei", "lspd", "fbi", "fib", "rp", "roleplay", "rollenspiel bewerbung"],
    answer: `Für eine Fraktionsbewerbung (zum Beispiel Polizei oder Rettungsdienst) zählt vor allem Rollenspiel:

1. **Charakter:** Name, Alter, Herkunft und kurze Hintergrundgeschichte.
2. **Motivation:** Warum dein Charakter in dieser Fraktion arbeiten will.
3. **Verhalten:** Wie dein Charakter in Stresssituationen reagiert. Beschreibe es konkret.
4. **Regelkenntnis:** Zeig, dass du die Fraktionsregeln kennst.
5. **Eigene Ideen:** Eine Szene, die du gerne spielen würdest.

Schreib realistisch. Übertriebene Heldengeschichten wirken unglaubwürdig. Ruhige, glaubwürdige Charaktere kommen meist besser an.`
  },
  {
    id: "content-creator",
    mode: "bewerbungen",
    keywords: ["content creator", "creator", "streamer", "youtube", "tiktok", "twitch", "reichweite"],
    answer: `Für eine Content-Creator-Bewerbung zählen Reichweite und Stil:

- Deine Kanäle mit Links (YouTube, TikTok, Twitch).
- Ungefähre Reichweite und durchschnittliche Zuschauer. Lieber ehrlich klein als übertrieben.
- Welche Art Content du machst und wie oft du postest.
- Ein Beispiel-Video oder ein Clip, der dich zeigt.

Sei ehrlich über deine Zahlen. Teams prüfen die Kanäle häufig nach.`
  },
  {
    id: "bewerbungsgespraech",
    mode: "bewerbungen",
    keywords: ["gespraech", "gespräch", "interview", "vorstellungsgespraech", "fragen im gespraech", "gespraechsfragen"],
    answer: `Typische Fragen im Bewerbungsgespräch und gute Ansätze:

- **Warum willst du zu uns?** Nenn konkrete Dinge am Server, die dir gefallen, und was du beitragen willst.
- **Was machst du bei Streit?** Beschreib ruhige Schritte: zuhören, Regeln prüfen, Entscheidung klar erklären.
- **Wie viel Zeit hast du?** Sei realistisch, lieber weniger versprechen und einhalten.

Bleib ruhig und ehrlich. Wenn du etwas nicht weißt, sag es offen.`
  },
  {
    id: "charakter",
    mode: "bewerbungen",
    keywords: ["charakter", "backstory", "hintergrund", "lebenslauf", "geschichte", "charakterbogen"],
    answer: `Ein guter Charakterhintergrund ist kurz und glaubwürdig:

- Name, Alter, Wohnort und Beruf (passend zum Server).
- Zwei bis drei Lebensstationen, die erklären, wer dein Charakter ist.
- Eine Schwäche und eine Stärke. Ohne Schwäche wirkt der Charakter flach.
- Ein Ziel, das im Spiel verfolgt werden kann.

Vermeide, dass dein Charakter alles kann oder besonders wichtig ist.`
  },
  {
    id: "bewerbung-allgemein",
    mode: "bewerbungen",
    keywords: ["bewerbung", "bewerben", "schreiben", "text", "tipps", "wie schreibe", "bewerbungstext"],
    answer: `Allgemeine Tipps für jede Bewerbung:

- Lies die Anforderungen des Teams genau und beantworte alle Punkte.
- Schreib in ganzen Sätzen, ohne Abkürzungen, die nicht jeder kennt.
- Halte den Text übersichtlich. Abschnitte mit Überschriften helfen.
- Lass ihn vor dem Absenden einmal gegenlesen.
- Sei ehrlich. Teams merken übertriebene Angaben schnell.

Wenn du mir sagst, für welches Team du dich bewirbst, helfe ich dir bei der Struktur.`
  },

  // ================= ALLGEMEIN =================
  {
    id: "begruessung",
    mode: "alle",
    keywords: ["hallo", "hi", "hey", "moin", "servus", "guten tag", "guten morgen", "guten abend"],
    answer: `Hallo! Ich bin DRuf. Wähle links einen Bereich: Scripts, Bewerbungen oder Fragen. Beschreib dann, was du brauchst.`
  },
  {
    id: "was-kannst-du",
    mode: "alle",
    keywords: ["was kannst du", "was kannst", "funktionen", "hilfe", "help", "themen"],
    answer: `Ich kann dir mit diesen Themen helfen:

- **Scripts:** fxmanifest, Befehle, Notify, Keybinds, Blips, Marker, Ladebalken, Items, Events, Datenbank, Animationen, Fahrzeuge, Props, Teleport, Geld, ox_target, NUI und häufige Lua-Fehler.
- **Bewerbungen und Konzepte:** Staff, Whitelist, Fraktionen, Medic, Mechaniker, Content Creator, Charaktere, Fraktions-, Server- und Eventkonzept. Sag "schreib die" für eine fertige Vorlage.
- **Fragen:** Frameworks, txAdmin, server.cfg, Lizenz, Performance, Voice, Jobs, Datenbank, Addon-Fahrzeuge, handling.meta und Konsolenfehler.
- **Fahrzeug-Einstellungen:** handling.meta per Formular erstellen.
- **Script-Generator:** fertige Scripts mit client.lua, server.lua und UI-Menü erzeugen.

Schreib einfach ein Stichwort oder eine Frage.`
  }
];
