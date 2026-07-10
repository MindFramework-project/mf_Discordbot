import { EmbedBuilder } from 'discord.js'
import { getNextRestart } from './txadmin.js'

const WARNING_INTERVALS = [30, 15, 10, 5, 1]
let warnedIntervals = new Map()
let interval = null

function getRestartTime() {
    return global.nextRestartTime || getNextRestart()
}

function getMinutesUntil(target) {
    return Math.floor((target - Date.now()) / 60000)
}

export function startRestartWarnings(client) {
    if (interval) return

    interval = setInterval(() => {
        const target = getRestartTime()
        if (!target) return

        const mins = getMinutesUntil(target)
        if (mins < 0) {
            warnedIntervals.clear()
            return
        }

        for (const warnMin of WARNING_INTERVALS) {
            if (mins <= warnMin && mins > warnMin - 1) {
                if (warnedIntervals.get(warnMin)) return
                warnedIntervals.set(warnMin, true)

                sendWarning(client, warnMin, target)
                return
            }
        }
    }, 30_000)
}

export function stopRestartWarnings() {
    if (interval) {
        clearInterval(interval)
        interval = null
    }
    warnedIntervals.clear()
}

function sendWarning(client, minutes, target) {
    const embed = new EmbedBuilder()
        .setColor(0xff6600)
        .setTitle('🔄 Geplande Restart')
        .setDescription(
            minutes > 0
                ? `De server wordt over **${minutes} minuut${minutes !== 1 ? 'en' : ''}** opnieuw opgestart.\n\nZorg dat je opslaat en de server verlaat!`
                : '🔄 De server wordt nu opnieuw opgestart!',
        )
        .setFooter({ text: 'MindFramework • Restart Warning' })
        .setTimestamp(target)

    const channelId = global.staffChannelId
    if (!channelId) return

    client.channels.fetch(channelId).then((channel) => {
        if (channel) channel.send({ embeds: [embed] })
    }).catch(() => {})
}
