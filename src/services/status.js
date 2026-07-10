import { EmbedBuilder, ActivityType } from 'discord.js'
import config from '../../config.js'
import { getServerStatus } from './fivem.js'
import { getNextRestart } from './txadmin.js'
import { getRemainingText } from './time.js'
import { updateVoiceChannel } from './voice.js'
import { escapeMarkdown } from '../utils/markdown.js'
import * as storage from '../storage/index.js'

let message = null
let interval = null

function getRestartText() {
    const time = global.nextRestartTime || getNextRestart()
    if (!time) return 'Nog niet gepland'

    const diff = time - Date.now()
    if (diff <= 0) return '🔄 Wordt nu herstart...'

    const min = Math.floor(diff / 60000)
    const sec = Math.floor((diff % 60000) / 1000)
    const uren = Math.floor(min / 60)
    const restMin = min % 60

    if (uren > 0) {
        return `Over ${uren} uur en ${restMin} minuten`
    }
    if (min > 0) {
        return `Over ${min} minuut${min !== 1 ? 'en' : ''} en ${sec} seconden`
    }
    return `Over ${sec} seconden`
}

function buildMaintenanceEmbed(mode) {
    const labels = {
        fivem: '🚧 FiveM Server',
        discord: '🤖 Discord Bot',
        both: '🔧 FiveM Server & Discord Bot',
    }
    const embed = new EmbedBuilder()
        .setTitle('🔧 MindFramework — Onderhoudsmodus')
        .setColor(0xffa500)
        .setDescription(
            `**${labels[mode.type]}** is momenteel in onderhoud.\nWij zijn zo snel mogelijk weer beschikbaar!`,
        )
        .setFooter({ text: 'MindFramework • Onderhoud' })
        .setTimestamp()

    if (mode.until) {
        const date = new Date(mode.until)
        const tijd = date.toLocaleString('nl-NL', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        })
        embed.addFields({
            name: '⏰ Verwachte duur',
            value: `Tot **${tijd}**\n\`${getRemainingText(mode.until)}\``,
            inline: false,
        })
    } else {
        embed.addFields({
            name: '⏰ Verwachte duur',
            value: 'Voor onbepaalde tijd',
            inline: false,
        })
    }

    return embed
}

function buildEmbed(status) {
    const mode = global.maintenanceMode
    if (mode && (mode.type === 'fivem' || mode.type === 'both')) {
        return buildMaintenanceEmbed(mode)
    }

    const color = status.online ? 0xf1e542 : 0xff4444
    const statusEmoji = status.online ? '🟢' : '🔴'
    const statusText = status.online ? 'Online' : 'Offline'

    const embed = new EmbedBuilder()
        .setTitle('MindFramework — Server Status')
        .setColor(color)
        .addFields(
            {
                name: 'Status',
                value: `${statusEmoji} ${statusText}`,
                inline: true,
            },
            {
                name: 'Spelers',
                value: status.online
                    ? `${status.playerCount}/${status.maxPlayers}`
                    : '—',
                inline: true,
            },
            {
                name: 'Volgende Restart',
                value: getRestartText(),
                inline: false,
            },
        )
        .setFooter({
            text: `MindFramework • Laatste update`,
        })
        .setTimestamp()

    if (status.online && status.players.length > 0) {
        const sorted = [...status.players].sort(
            (a, b) => (b.ping || 0) - (a.ping || 0),
        )
        const list = sorted
            .slice(0, 20)
            .map((p) => `**${escapeMarkdown(p.name)}** — ${p.ping || 0}ms`)
            .join('\n')

        const remaining = status.players.length - 20
        const suffix =
            remaining > 0
                ? `\n*...en nog ${remaining} speler${remaining > 1 ? 's' : ''}*`
                : ''

        embed.addFields({
            name: `📋 Spelers Online (${status.playerCount})`,
            value: list + suffix,
            inline: false,
        })
    } else if (status.online) {
        embed.addFields({
            name: '📋 Spelers Online',
            value: 'Niemand online',
            inline: false,
        })
    }

    return embed
}

function buildActivity(status) {
    const mode = global.maintenanceMode
    if (mode) {
        return {
            name: '🔧 in onderhoud',
            type: ActivityType.Watching,
        }
    }
    if (status.online) {
        return {
            name: `${status.playerCount} speler${status.playerCount !== 1 ? 's' : ''} online`,
            type: ActivityType.Watching,
        }
    }
    return {
        name: 'server is offline',
        type: ActivityType.Watching,
    }
}

export async function updateStatus(client) {
    const mode = global.maintenanceMode
    if (mode && mode.until && mode.until <= Date.now()) {
        global.maintenanceMode = null
    }

    const status = await getServerStatus()

    client.user.setActivity(buildActivity(status))
    updateVoiceChannel(client, status.playerCount, status.maxPlayers)

    if (!message) {
        const channelId =
            config.statusChannelId || global.statusChannelId
        if (!channelId) return

        const channel = await client.channels.fetch(channelId).catch(() => null)
        if (!channel) return

        const savedMessageId = storage.get('statusMessageId')
        if (savedMessageId) {
            try {
                const saved = await channel.messages.fetch(savedMessageId)
                if (saved && saved.author.id === client.user.id) {
                    message = saved
                }
            } catch {
                storage.remove('statusMessageId')
            }
        }

        if (!message) {
            const messages = await channel.messages.fetch({ limit: 10 })
            message = messages.find(
                (m) =>
                    m.author.id === client.user.id &&
                    m.embeds.length > 0 &&
                    m.embeds[0].title?.includes('MindFramework'),
            )
        }

        if (!message) {
            message = await channel.send({ embeds: [buildEmbed(status)] })
            storage.set('statusMessageId', message.id)
        } else {
            await message.edit({ embeds: [buildEmbed(status)] })
            storage.set('statusMessageId', message.id)
        }
    } else {
        await message.edit({ embeds: [buildEmbed(status)] }).catch(() => {
            message = null
            storage.remove('statusMessageId')
        })
    }
}

export function startStatusLoop(client) {
    updateStatus(client)
    interval = setInterval(() => updateStatus(client), config.updateInterval)
}

export function stopStatusLoop() {
    if (interval) {
        clearInterval(interval)
        interval = null
    }
    message = null
}

export async function forceUpdate(client) {
    await updateStatus(client)
}

export { buildMaintenanceEmbed }
