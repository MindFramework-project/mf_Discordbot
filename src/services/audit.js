import { EmbedBuilder } from 'discord.js'
import config from '../../config.js'

export async function logAudit(client, { action, user, details, color }) {
    const channelId = config.staffChannelId || global.staffChannelId
    if (!channelId) return

    const labels = {
        broadcast: '📢 Broadcast',
        broadcast_failed: '❌ Broadcast mislukt',
        maintenance_on: '🔧 Onderhoud aan',
        maintenance_off: '✅ Onderhoud uit',
        restart_set: '🔄 Restart ingesteld',
        restart_cancel: '❌ Restart geannuleerd',
        setup_channel: '📊 Kanaal ingesteld',
        suggest: '💡 Suggestie',
    }

    try {
        const channel = await client.channels.fetch(channelId)
        if (!channel) return

        const embed = new EmbedBuilder()
            .setColor(color || 0x2b2d31)
            .setTitle(labels[action] || `📋 ${action}`)
            .addFields(
                { name: 'Gebruiker', value: user, inline: true },
                { name: 'Details', value: details || '—', inline: false },
            )
            .setFooter({ text: 'MindFramework • Audit Log' })
            .setTimestamp()

        await channel.send({ embeds: [embed] })
    } catch {
        // audit channel niet beschikbaar
    }
}
