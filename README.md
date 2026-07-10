<div align="center">
  <img src="https://img.icons8.com/fluency/96/discord-new-logo.png" alt="Discord" width="80"/>
  <img src="https://i.imgur.com/e6Z28RR.png" alt="FiveM" width="80"/>
  <h1 align="true">MindFramework Discord Bot</h1>
  <p>
    <strong>A feature-rich Discord bot for FiveM server management</strong>
  </p>
  <p>
    <a href="#features">Features</a> •
    <a href="#commands">Commands</a> •
    <a href="#setup">Setup</a> •
    <a href="#configuration">Configuration</a> •
    <a href="#deployment">Deployment</a> •
    <a href="#architecture">Architecture</a>
  </p>
  <br>
</div>

---

## About

The **MindFramework Discord Bot** is a comprehensive management tool built for the [MindFramework](https://fivem.net/) FiveM server. It bridges your Discord server with your FiveM game server, providing real-time status monitoring, player management, server administration, and community engagement features — all through Discord slash commands.

Built with [discord.js v14](https://discord.js.org/) and Node.js, this bot integrates directly with the FiveM server API and txAdmin to deliver live server information and administrative controls at your fingertips.

---

## Features

### 🖥️ Server Status
- Real-time server status display with a live-updating embed
- Shows online/offline state, current player count, max players
- Displays the top 20 players currently online
- Server activity status updates
- Automatic voice channel rename with live player count

### 👥 Player Management
- List all online players with paginated navigation (25 per page)
- Search players by name with detailed information
- Quick IP address and join link display

### ⏰ Scheduled Restart System
- Reads restart schedule directly from txAdmin configuration
- Automatic warning messages sent to staff at 30, 15, 10, 5, and 1 minute before restart
- Live countdown displayed in the status embed
- Manual restart scheduling and cancellation

### 🛠️ Server Administration
- **Maintenance Mode** — Toggle maintenance for Discord, FiveM, or both
- **In-Game Broadcast** — Send messages directly to in-game players via HTTP
- **Staff Audit Logging** — All administrative actions logged to a dedicated staff channel
- **Command Cooldowns** — Configurable per-command cooldowns to prevent spam

### 💡 Community Suggestions
- Structured suggestion system with 9 categories
- Rich embed submissions with automatic reaction prompts
- Dedicated suggestions channel integration

---

## Commands

| Command | Description | Access | Cooldown |
|---|---|---|---|
| `/status` | Display server status with online players | Everyone | 5s |
| `/players` | Browse online players (paginated) | Everyone | 10s |
| `/player <naam>` | Search for a specific player by name | Everyone | 5s |
| `/ip` | Show server IP address and port | Everyone | — |
| `/join` | Show join link (CFX.re or fivem://) | Everyone | — |
| `/suggest <categorie> <titel> <beschrijving>` | Submit a server suggestion | Everyone | 30s |
| `/setup <kanaal> [type]` | Configure channel bindings | Administrator | — |
| `/setrestart <tijd>` | Schedule or cancel a server restart | Staff | — |
| `/broadcast <bericht>` | Send a message to in-game players | Staff | — |
| `/maintenance <doelwit> [tijd]` | Toggle maintenance mode | Owner/Admin | — |
| `/test` | Health check command | Everyone | — |

### Suggestion Categories
`general` • `gameplay` • `roleplay` • `economy` • `vehicles` • `staff` • `bugs` • `features` • `other`

---

## Setup

### Prerequisites
- [Node.js](https://nodejs.org/) v16.11.0 or higher
- A [Discord Application](https://discord.com/developers/applications) with a bot token
- A FiveM server with `/info.json` and `/players.json` endpoints exposed (enabled by default)
- _(Optional)_ txAdmin for automatic restart scheduling

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/MindFramework-project/mf_Discordbot.git
   cd mf_Discordbot
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` with your configuration (see [Configuration](#configuration)).

4. **Deploy slash commands**
   ```bash
   npm run deploy
   ```
   This registers all slash commands globally with Discord. Changes can take up to an hour to propagate, or use a test guild for instant updates.

5. **Start the bot**
   ```bash
   npm start
   ```

---

## Configuration

All configuration is managed through environment variables in `.env`:

| Variable | Required | Default | Description |
|---|---|---|---|
| `DISCORD_TOKEN` | ✅ | — | Your Discord bot token |
| `CLIENT_ID` | ✅ | — | Discord application client ID |
| `SERVER_IP` | ❌ | — | FiveM server IP address |
| `SERVER_PORT` | ❌ | — | FiveM server query port |
| `CFX_RE_CODE` | ❌ | — | CFX.re join code (e.g., `oax9p8y`) |
| `STATUS_CHANNEL_ID` | ❌ | — | Fixed channel for status embed |
| `UPDATE_INTERVAL` | ❌ | `30` | Status update interval (seconds) |
| `STAFF_ROLES` | ❌ | — | Comma-separated staff role IDs |
| `OWNER_ROLE_ID` | ❌ | — | Server owner role ID |
| `TXADMIN_CONFIG_PATH` | ❌ | — | Path to txAdmin `config.json` |
| `STAFF_CHANNEL_ID` | ❌ | — | Channel for audit logs |
| `SUGGEST_CHANNEL_ID` | ❌ | — | Channel for suggestions |
| `VOICE_CHANNEL_ID` | ❌ | — | Voice channel for player count |

> **Note:** Channels can also be configured in-game using `/setup`.

---

## Architecture

```
mf_Discordbot/
├── index.js                    # Application entry point
├── deploy-commands.js          # Slash command registration
├── config.js                   # Centralized configuration
├── package.json
├── .env.example                # Environment variable template
├── data/
│   └── settings.json           # Persistent bot settings
└── src/
    ├── bot.js                  # Core bot logic & event handling
    ├── commands/               # Slash command implementations
    │   ├── broadcast.js        # In-game message broadcasting
    │   ├── ip.js               # Server IP display
    │   ├── join.js             # Join link generation
    │   ├── maintenance.js      # Maintenance mode toggle
    │   ├── player.js           # Player search
    │   ├── players.js          # Player list (paginated)
    │   ├── setrestart.js       # Restart scheduling
    │   ├── setup.js            # Channel configuration
    │   ├── status.js           # Server status embed
    │   ├── suggest.js          # Suggestion submission
    │   └── test.js             # Health check
    ├── services/               # Business logic layer
    │   ├── audit.js            # Staff audit logging
    │   ├── fivem.js            # FiveM API client
    │   ├── restartwarn.js      # Restart warning system
    │   ├── status.js           # Status embed loop
    │   ├── time.js             # Time parsing utilities
    │   ├── txadmin.js          # txAdmin config reader
    │   └── voice.js            # Voice channel updater
    ├── storage/
    │   └── index.js            # JSON file-based storage
    └── utils/
        ├── cooldown.js         # Command cooldown system
        └── markdown.js         # Discord markdown escaper
```

### How It Works

1. **Bot Initialization** — On startup, the bot connects to Discord, loads persisted settings, and begins its status update loop.
2. **Status Updates** — Every `UPDATE_INTERVAL` seconds, the bot queries the FiveM server's API endpoints and updates a rich embed in the configured status channel.
3. **Command Handling** — User interactions (slash commands, buttons, modals) are routed to their respective handlers with cooldown enforcement.
4. **Restart Monitoring** — The bot reads the txAdmin schedule to determine upcoming restarts and sends timed warnings to staff.
5. **Audit Trail** — All sensitive administrative actions (broadcasts, maintenance, restarts, setup changes) are logged to the staff channel.

### FiveM Integration

The bot interacts with your FiveM server through:
- **HTTP API** — Queries `http://<ip>:<port>/info.json` and `http://<ip>:<port>/players.json` for server status and player data.
- **Broadcast Resource** — Sends POST requests to a custom FiveM resource endpoint for in-game messages.
- **Status File** — Writes a `.bot_status` marker file to signal bot online status to the server's `mf_info` resource (Linux path).
- **txAdmin** — Reads the `config.json` file for the automated restart schedule.

---

## Development

### Project Status

The bot is currently in active development for the MindFramework FiveM community. Future enhancements may include:

- Database integration (SQLite/MySQL)
- Web dashboard for server management
- Advanced moderation tools
- In-game command execution from Discord
- Automated server backup notifications
- Player statistics and leaderboards
- Multi-server support

### Contributing

Contributions are welcome! Feel free to open issues or submit pull requests.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

<div align="center">
  <p>
    Built with ❤️ for the <strong>MindFramework</strong> community
  </p>
  <p>
    <sub>FiveM is a registered trademark of Cfx.re. This project is not affiliated with or endorsed by Cfx.re.</sub>
  </p>
</div>
