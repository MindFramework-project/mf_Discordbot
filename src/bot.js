import { Client, Events, GatewayIntentBits, Collection } from 'discord.js'
import { writeFileSync, unlinkSync, existsSync } from 'fs'
import config from '../config.js'
import { startStatusLoop } from './services/status.js'
import { startRestartWarnings } from './services/restartwarn.js'
import * as storage from './storage/index.js'
import { checkCooldown } from './utils/cooldown.js'

const statusFile = '/home/Daan/fivem/Framework/resources/[dev]/mf_info/.bot_status'

function setBotOnline() {
    writeFileSync(statusFile, 'online', 'utf-8')
}

function setBotOffline() {
    if (existsSync(statusFile)) {
        unlinkSync(statusFile)
    }
}

import * as cmdIp from './commands/ip.js'
import * as cmdJoin from './commands/join.js'
import * as cmdPlayers from './commands/players.js'
import * as cmdStatus from './commands/status.js'
import * as cmdSetup from './commands/setup.js'
import * as cmdSetRestart from './commands/setrestart.js'
import * as cmdMaintenance from './commands/maintenance.js'
import * as cmdPlayer from './commands/player.js'
import * as cmdBroadcast from './commands/broadcast.js'
import * as cmdSuggest from './commands/suggest.js'

const commands = [cmdIp, cmdJoin, cmdPlayers, cmdStatus, cmdSetup, cmdSetRestart, cmdMaintenance, cmdPlayer, cmdBroadcast, cmdSuggest]
const commandsData = commands.map((c) => c.data.toJSON())

export async function startBot() {
    const client = new Client({
        intents: [
            GatewayIntentBits.Guilds,
        ],
    })

    client.commands = new Collection()
    for (const cmd of commands) {
        client.commands.set(cmd.data.name, cmd)
    }

    client.once(Events.ClientReady, async () => {
        console.log(`✅ Bot online als ${client.user.tag}`)
        setBotOnline()

        const savedChannelId = storage.get('statusChannelId')
        if (savedChannelId && !config.statusChannelId) {
            global.statusChannelId = savedChannelId
        }

        const savedStaffChannel = storage.get('staffChannelId')
        if (savedStaffChannel) {
            global.staffChannelId = savedStaffChannel
        }

        const savedSuggestChannel = storage.get('suggestChannelId')
        if (savedSuggestChannel) {
            global.suggestChannelId = savedSuggestChannel
        }

        const savedVoiceChannel = storage.get('voiceChannelId')
        if (savedVoiceChannel) {
            global.voiceChannelId = savedVoiceChannel
        }

        if (config.statusChannelId) {
            global.statusChannelId = config.statusChannelId
        }

        startStatusLoop(client)
        startRestartWarnings(client)
    })

    client.on(Events.InteractionCreate, async (interaction) => {
        if (interaction.isChatInputCommand()) {
            const cmd = client.commands.get(interaction.commandName)
            if (!cmd) return

            const cooldown = cmd.cooldown || 0
            if (cooldown > 0) {
                const remaining = checkCooldown(interaction.user.id, interaction.commandName, cooldown)
                if (remaining > 0) {
                    await interaction.reply({
                        content: `⏳ Dit commando is nog **${remaining} seconde${remaining !== 1 ? 'n' : ''}** in cooldown.`,
                        ephemeral: true,
                    })
                    return
                }
            }

            try {
                await cmd.execute(interaction)
            } catch (err) {
                console.error(`❌ Fout bij /${interaction.commandName}:`, err)
                const reply = {
                    content: 'Er is een fout opgetreden bij dit commando.',
                    ephemeral: true,
                }
                if (interaction.replied || interaction.deferred) {
                    await interaction.followUp(reply)
                } else {
                    await interaction.reply(reply)
                }
            }
        } else if (interaction.isButton()) {
            const cmd = client.commands.get(interaction.message.interaction?.commandName)
            if (cmd && typeof cmd.handleButton === 'function') {
                try {
                    await cmd.handleButton(interaction)
                } catch (err) {
                    console.error(`❌ Fout bij button ${interaction.customId}:`, err)
                    await interaction.reply({
                        content: 'Er is een fout opgetreden.',
                        ephemeral: true,
                    })
                }
            }
        } else if (interaction.isModalSubmit()) {
            const cmd = client.commands.get(interaction.message?.interaction?.commandName)
            if (cmd && typeof cmd.handleModal === 'function') {
                try {
                    await cmd.handleModal(interaction)
                } catch (err) {
                    console.error(`❌ Fout bij modal ${interaction.customId}:`, err)
                    await interaction.reply({
                        content: 'Er is een fout opgetreden.',
                        ephemeral: true,
                    })
                }
            }
        }
    })

    await client.login(config.token)

    process.on('exit', setBotOffline)
    process.on('SIGINT', () => { setBotOffline(); process.exit() })
    process.on('SIGTERM', () => { setBotOffline(); process.exit() })
    process.on('uncaughtException', () => { setBotOffline(); process.exit(1) })
}
