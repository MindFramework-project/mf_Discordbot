import {
    SlashCommandBuilder,
    PermissionFlagsBits,
    ChannelType,
} from 'discord.js'
import * as storage from '../storage/index.js'
import { logAudit } from '../services/audit.js'

export const data = new SlashCommandBuilder()
    .setName('setup')
    .setDescription('Stel het status kanaal in voor de live embed')
    .addChannelOption((option) =>
        option
            .setName('kanaal')
            .setDescription('Het kanaal waar de status embed komt')
            .addChannelTypes(ChannelType.GuildText)
            .setRequired(true),
    )
    .addStringOption((option) =>
        option
            .setName('type')
            .setDescription('Type kanaal')
            .setRequired(false)
            .addChoices(
                { name: '📊 Status embed', value: 'status' },
                { name: '📋 Staff logs', value: 'staff' },
                { name: '💡 Suggesties', value: 'suggest' },
                { name: '🔊 Speler count voice', value: 'voice' },
            ),
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)

export async function execute(interaction) {
    const channel = interaction.options.getChannel('kanaal')
    const type = interaction.options.getString('type') || 'status'

    const storageKey = {
        status: 'statusChannelId',
        staff: 'staffChannelId',
        suggest: 'suggestChannelId',
        voice: 'voiceChannelId',
    }[type]

    storage.set(storageKey, channel.id)

    if (type === 'status') {
        global.statusChannelId = channel.id
    }

    const typeLabels = {
        status: '📊 status embed',
        staff: '📋 staff logs',
        suggest: '💡 suggesties',
        voice: '🔊 speler count',
    }

    await logAudit(interaction.client, {
        action: 'setup_channel',
        user: interaction.user.tag,
        details: `${channel} → ${typeLabels[type]}`,
        color: 0x00ff00,
    })

    await interaction.reply({
        content: `✅ ${channel} ingesteld als ${typeLabels[type]}.`,
        ephemeral: false,
    })
}
