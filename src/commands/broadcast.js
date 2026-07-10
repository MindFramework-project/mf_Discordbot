import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } from 'discord.js'
import config from '../../config.js'
import { logAudit } from '../services/audit.js'

export const data = new SlashCommandBuilder()
    .setName('broadcast')
    .setDescription('Stuur een bericht naar alle spelers op de server')
    .addStringOption((option) =>
        option
            .setName('bericht')
            .setDescription('Het bericht om te versturen')
            .setRequired(true),
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)

export async function execute(interaction) {
    const isStaff = config.staffRoles.some((roleId) =>
        interaction.member.roles.cache.has(roleId),
    )
    const isAdmin = interaction.member.permissions.has(PermissionFlagsBits.Administrator)

    if (!isStaff && !isAdmin) {
        await interaction.reply({
            content: '❌ Je hebt geen toestemming voor dit commando.',
            ephemeral: true,
        })
        return
    }

    const bericht = interaction.options.getString('bericht')
    const baseUrl = `http://${config.server.ip}:${config.server.port}`

    await interaction.deferReply({ ephemeral: true })

    try {
        const res = await fetch(`${baseUrl}/broadcast`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                message: bericht,
                source: interaction.user.tag,
            }),
            signal: AbortSignal.timeout(5000),
        })

        if (res.ok) {
            await logAudit(interaction.client, {
                action: 'broadcast',
                user: interaction.user.tag,
                details: bericht,
            })

            await interaction.editReply({
                content: '✅ Bericht verzonden naar alle spelers.',
            })
        } else {
            await interaction.editReply({
                content: `⚠️ Server reageerde met status ${res.status}. Zorg dat het broadcast endpoint werkt.`,
            })
        }
    } catch {
        await interaction.editReply({
            content: '⚠️ Kon de server niet bereiken. Zorg dat er een custom resource draait met een `/broadcast` endpoint.\n\nHet bericht is **niet** verstuurd, maar de actie is gelogd.',
        })

        await logAudit(interaction.client, {
            action: 'broadcast_failed',
            user: interaction.user.tag,
            details: `${bericht} (server onbereikbaar)`,
        })
    }
}
