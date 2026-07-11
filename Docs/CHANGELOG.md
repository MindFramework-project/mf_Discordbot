# Changelog

Alle belangrijke wijzigingen aan dit project worden hier gedocumenteerd.

## [1.0.0] - 2026-07-11

### ✨ Nieuw Project
Eerste officiële release van de **MindFramework Discord Bot** — een feature-rijke Discord-bot voor FiveM serverbeheer. De bot fungeert als brug tussen een Discord-server en een FiveM-game-server en biedt realtime statusmonitoring, spelerbeheer, serveradministratie en community-engagement via Discord slash commands.

---

### 🚀 Nieuwe Functionaliteiten

#### 📊 Live Server Status
- **Automatisch bijwerkende status-embed** — Een rich embed in een ingesteld Discord-kanaal dat realtime de serverstatus toont (online/offline, spelersaantal X/Y, top 20 spelers op ping, volgende restart countdown)
- **Configureerbare update-interval** — Standaard elke 30 seconden, instelbaar via `UPDATE_INTERVAL` in `.env`
- **Herstel na herstart** — De status-embed message ID wordt opgeslagen in `data/settings.json` en hersteld bij een bot-herstart, zodat de embed niet opnieuw aangemaakt hoeft te worden
- **Force update** — Mogelijkheid om direct een status-update te forceren via `forceUpdate()`

#### Discord Bot Activity
- Dynamische "Watching..." status die de serverstatus reflecteert:
  - `Watching X spelers online` — bij online server met spelers
  - `Watching server is leeg` — bij online server zonder spelers
  - `Watching server is offline` — bij offline server
  - `Watching in onderhoud` — tijdens onderhoudsmodus

#### Live Voice Channel Player Count
- Automatisch hernoemen van een voice channel naar het huidige spelersaantal (bijv. `🎮 12/32 spelers`)
- Werkt alleen als de naam daadwerkelijk verandert, om onnodige API-calls te voorkomen

---

### 🤖 Commands (11 Slash Commands)

#### Algemene Commands

| Commando | Beschrijving | Toegang | Cooldown |
|---|---|---|---|
| `/status` | Toont serverstatus met online spelers (top 10 op ping) | Iedereen | 5s |
| `/players` | Blader door online spelers met paginering (25 per pagina, knoppen) | Iedereen | 10s |
| `/player <naam>` | Zoek een specifieke speler op naam (toont ping, ID, identifiers) | Iedereen | 5s |
| `/ip` | Toont server IP-adres en poort in `connect` formaat | Iedereen | — |
| `/join` | Toont join link (CFX.re of fivem://) | Iedereen | — |
| `/test` | Gezondheidscheck — bevestigt dat de bot online is | Iedereen | — |

#### Community Commands

| Commando | Beschrijving | Toegang | Cooldown |
|---|---|---|---|
| `/suggest <categorie> <titel> <beschrijving>` | Dien een suggestie in voor de server (9 categorieën) | Iedereen | 30s |

**Categorieën:** `voertuigen` (Voertuigen), `huizen` (Huizen/Mapping), `kleding` (Kleding), `scripts` (Scripts/Mechanics), `hulpverlening` (Hulpdiensten), `werk` (Banen), `events` (Events), `bug` (Bug rapport), `anders` (Overig)

#### Staff Commands

| Commando | Beschrijving | Toegang | Cooldown |
|---|---|---|---|
| `/setrestart <tijd>` | Plan een server-restart in of annuleer deze (natuurlijke taal) | Staff | — |
| `/broadcast <bericht>` | Stuur een bericht naar in-game spelers via HTTP POST | Staff | — |
| `/maintenance <doelwit> [tijd]` | Schakel onderhoudsmodus in/uit (FiveM, Discord of Beide) met optionele duur | Eigenaar/Admin | — |

#### Administratie Commands

| Commando | Beschrijving | Toegang |
|---|---|---|
| `/setup <kanaal> [type]` | Configureer kanaalbindingen (status embed, staff logs, suggesties, voice count) | Administrator |

**Setup types:** `status` (Status embed), `staff` (Staff logs), `suggest` (Suggesties), `voice` (Spelersaantal voice channel)

---

### ⚙️ Services (Business Logic Layer)

#### `src/services/status.js` — Live Status Embed Loop
| Functie | Beschrijving |
|---|---|
| `startStatusLoop(client)` | Start periodieke statusupdates op basis van `config.updateInterval` |
| `stopStatusLoop()` | Stopt de interval en wist interne status |
| `updateStatus(client)` | Haalt FiveM-status op, werkt bot-activiteit bij, werkt voice channel bij, bewerkt de status-embed |
| `forceUpdate(client)` | Forceert een directe statusupdate |
| `buildEmbed(status)` | Bouwt de rich embed met serverstatus, spelersaantal, restart countdown en top 20 spelers |
| `buildMaintenanceEmbed(mode)` | Bouwt een onderhoudsmodus-embed met type en duur |
| `buildActivity(status)` | Bepaalt de "Watching..." activiteitstekst van de bot |

#### `src/services/fivem.js` — FiveM HTTP API Client
| Functie | Beschrijving |
|---|---|
| `fetchServerInfo()` | Haalt `http://<ip>:<port>/info.json` op met 5s timeout |
| `fetchPlayers()` | Haalt `http://<ip>:<port>/players.json` op met 5s timeout |
| `getServerStatus()` | Roept beide endpoints parallel aan, retourneert genormaliseerd statusobject |

#### `src/services/restartwarn.js` — Geplande Restart Waarschuwingen
| Functie | Beschrijving |
|---|---|
| `startRestartWarnings(client)` | Start een 30-seconden interval die de volgende restart-tijd controleert |
| `stopRestartWarnings()` | Stopt de interval en wist gewaarschuwde intervallen |
| `sendWarning(client, minutes, target)` | Stuurt een geformatteerde embed naar het staff-kanaal op specifieke intervallen |

**Waarschuwingsintervallen:** 30, 15, 10, 5 en 1 minuut voor een geplande restart. Elk interval wordt slechts één keer gewaarschuwd.

#### `src/services/voice.js` — Voice Channel Updater
| Functie | Beschrijving |
|---|---|
| `updateVoiceChannel(client, playerCount, maxPlayers)` | Hernoemt een geconfigureerd Discord voice channel naar live spelersaantal (bijv. `🎮 12/32 spelers`) |

#### `src/services/audit.js` — Staff Audit Logging
| Functie | Beschrijving |
|---|---|
| `logAudit(client, { action, user, details, color })` | Stuurt een geformatteerde audit-log embed naar het geconfigureerde staff-kanaal |

**Ondersteunde acties:** `broadcast`, `broadcast_failed`, `maintenance_on`, `maintenance_off`, `restart_set`, `restart_cancel`, `setup_channel`, `suggest`

#### `src/services/time.js` — Tijd Parsing Utilities
| Functie | Beschrijving |
|---|---|
| `parseTime(input)` | Parseert natuurlijke taal tijdsexpressies (`cancel`, `in X minuten`, `X uur`, `HH:MM`, `HH`) |
| `getRemainingText(timestamp)` | Genereert mensleesbare countdown-tekst (bijv. "Over 2 uur en 30 minuten") |

#### `src/services/txadmin.js` — txAdmin Configuratie Reader
| Functie | Beschrijving |
|---|---|
| `getNextRestart()` | Leest het txAdmin `config.json` bestand en retourneert de dichtstbijzijnde geplande restart-tijd |

---

### 🗄️ Opslag & Utilities

#### `src/storage/index.js` — JSON Bestandsgebaseerde Opslag
| Functie | Beschrijving |
|---|---|
| `get(key)` | Haal een waarde op per sleutel |
| `set(key, value)` | Stel een waarde in en persisteer naar schijf |
| `remove(key)` | Verwijder een sleutel en persisteer |
| `getAll()` | Haal alle sleutel-waarde paren op |
| `has(key)` | Controleer of een sleutel bestaat |

**Opgeslagen data:** `statusMessageId` (ID van de live status-embed in Discord)

#### `src/utils/cooldown.js` — Command Cooldown Systeem
| Functie | Beschrijving |
|---|---|
| `checkCooldown(userId, commandName, seconds)` | Controleert of een gebruiker een command te snel gebruikt. Retourneert resterende seconden of 0 |
| `clearCooldowns()` | Reset alle cooldowns |

#### `src/utils/markdown.js` — Discord Markdown Escaper
| Functie | Beschrijving |
|---|---|
| `escapeMarkdown(text)` | Escaped Discord markdown speciale karakters (`*`, `_`, `~`, `` ` ``, `|`, `>`) |

---

### 🧩 Externe Integraties

| Integratie | Methode | Details |
|---|---|---|
| **Discord API** | discord.js v14 (WebSocket + REST) | Slash commands, embeds, buttons, modals, channel management, voice channel renaming |
| **FiveM Server API** | HTTP GET | Bevraagt `http://<ip>:<port>/info.json` en `/players.json` voor serverstatus en spelersdata |
| **FiveM Broadcast Resource** | HTTP POST | Stuurt `POST /broadcast` met JSON `{message, source}` voor in-game berichten |
| **txAdmin** | Bestandssysteem | Leest `config.json` uit de txAdmin data-directory voor het geautomatiseerde restart-schema |
| **mf_info Resource** | Bestandssysteem | Schrijft/verwijdert `.bot_status` bestand om bot online-status te signaleren aan een FiveM-resource |

---

### 🏗️ Architectuur

```
index.js
  └── startBot() [src/bot.js]
        ├── Discord Client (GatewayIntentBits.Guilds)
        ├── 11 slash commands in Collection
        ├── On ClientReady:
        │     ├── setBotOnline() → .bot_status bestand
        │     ├── Laad opgeslagen channel ID's uit storage
        │     ├── startStatusLoop(client) → elke N seconden
        │     │     ├── getServerStatus() → info.json + players.json
        │     │     ├── client.user.setActivity() → bot status
        │     │     ├── updateVoiceChannel() → voice channel
        │     │     └── message.edit() → status embed
        │     └── startRestartWarnings(client) → elke 30s
        │           └── sendWarning() → staff embed op 30/15/10/5/1 min
        ├── On InteractionCreate:
        │     ├── ChatInputCommand → cooldown check, execute()
        │     ├── Button → handleButton()
        │     └── ModalSubmit → handleModal()
        └── On exit/signal/crash:
              └── setBotOffline() → verwijder .bot_status
```

---

### ⚙️ Configuratie

Alle configuratie verloopt via **omgevingsvariabelen** in `.env`, geladen door `config.js`:

| Variabele | Vereist | Standaard | Beschrijving |
|---|---|---|---|
| `DISCORD_TOKEN` | ✅ | — | Discord bot token |
| `CLIENT_ID` | ✅ | — | Discord applicatie client ID |
| `SERVER_IP` | ❌ | `127.0.0.1` | FiveM server IP-adres |
| `SERVER_PORT` | ❌ | `30120` | FiveM server query-poort |
| `CFX_RE_CODE` | ❌ | `null` | CFX.re join code (bijv. `oax9p8y`) |
| `STATUS_CHANNEL_ID` | ❌ | `null` | Vast kanaal voor live status embed |
| `UPDATE_INTERVAL` | ❌ | `30` | Status update-interval (seconden) |
| `STAFF_ROLES` | ❌ | `[]` | Komma-gescheiden Discord rol-ID's voor staff |
| `OWNER_ROLE_ID` | ❌ | `null` | Discord rol-ID voor server eigenaar |
| `TXADMIN_CONFIG_PATH` | ❌ | `/home/Daan/fivem/server/txData/default/config.json` | Pad naar txAdmin `config.json` |
| `STAFF_CHANNEL_ID` | ❌ | `null` | Kanaal-ID voor audit logs |
| `SUGGEST_CHANNEL_ID` | ❌ | `null` | Kanaal-ID voor suggesties |
| `VOICE_CHANNEL_ID` | ❌ | `null` | Voice channel-ID voor live spelersaantal |

---

### 🛠️ Technologieën

| Technologie | Versie | Doel |
|---|---|---|
| **Node.js** | 16.11.0+ | JavaScript runtime |
| **discord.js** | ^14.18.0 | Discord API library (v14) |
| **dotenv** | ^16.4.7 | Omgevingsvariabelen laden |
| **FiveM HTTP API** | — | Server endpoints (`/info.json`, `/players.json`) |
| **txAdmin** | — | Server admin panel (config file parsing) |

---

### 📁 Projectstructuur

```
mf-discord-bot/
├── .env                        # Omgevingsvariabelen (configuratie)
├── .env.example                # Template voor omgevingsvariabelen
├── .gitignore                  # node_modules/, .env, prive/
├── CHANGELOG.md                # Huidig changelog
├── LICENSE                     # MIT Licentie
├── README.md                   # Projectdocumentatie
├── config.js                   # Gecentraliseerde configuratie-loader
├── deploy-commands.js          # Slash command registratie-script
├── index.js                    # Applicatie entry point
├── package.json                # NPM package definitie
├── data/
│   └── settings.json           # Persistente bot runtime-instellingen
├── Docs/                       # Documentatie (leeg)
├── prive/                      # Privé-bestanden
├── src/
│   ├── bot.js                  # Core bot logica & event handling
│   ├── commands/               # 11 slash commands
│   │   ├── broadcast.js
│   │   ├── ip.js
│   │   ├── join.js
│   │   ├── maintenance.js
│   │   ├── player.js
│   │   ├── players.js
│   │   ├── setrestart.js
│   │   ├── setup.js
│   │   ├── status.js
│   │   ├── suggest.js
│   │   └── test.js
│   ├── services/               # Business logic
│   │   ├── audit.js
│   │   ├── fivem.js
│   │   ├── restartwarn.js
│   │   ├── status.js
│   │   ├── time.js
│   │   ├── txadmin.js
│   │   └── voice.js
│   ├── storage/                # Persistente opslag
│   │   └── index.js
│   └── utils/                  # Hulpprogramma's
│       ├── cooldown.js
│       └── markdown.js
```

---

### 📄 Licentie

Dit project is gelicenseerd onder de **MIT Licentie** — zie het [LICENSE](../LICENSE) bestand voor details.

---

-->
╔═════════════════════════════════════════════════╗
║  MindFramework Discord Bot — Version 1.0.0      ║
║  Copyright (c) 2026 MindFramework               ║
║  MIT License                                    ║
╚═════════════════════════════════════════════════╝

<--