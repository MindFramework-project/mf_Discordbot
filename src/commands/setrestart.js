import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js'
import config from '../../config.js'
import { parseTime } from '../services/time.js'
import { logAudit } from '../services/audit.js'

export const data = new SlashCommandBuilder()
    .setName('setrestart')
    .setDescription('Stel de volgende geplande restart in')
    .addStringOption((option) =>
        option
            .setName('tijd')
            .setDescription('Bijv: "in 30 minuten", "om 22:00", "2 hours", of "cancel"')
            .setRequired(true),
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)

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

    const input = interaction.options.getString('tijd')
    const parsed = parseTime(input)

    if (!parsed) {
        await interaction.reply({
            content: '❌ Kon de tijd niet herkennen. Gebruik bijvoorbeeld:\n'
                + '`/setrestart in 30 minuten`\n'
                + '`/setrestart in 2 uur`\n'
                + '`/setrestart om 22:00`\n'
                + '`/setrestart cancel`',
            ephemeral: true,
        })
        return
    }

    if (parsed.cancel) {
        global.nextRestartTime = null

        await logAudit(interaction.client, {
            action: 'restart_cancel',
            user: interaction.user.tag,
            details: 'Geplande restart geannuleerd',
            color: 0xff4444,
        })

        await interaction.reply({
            content: '✅ Geplande restart geannuleerd.',
            ephemeral: false,
        })
        return
    }

    global.nextRestartTime = parsed.timestamp
    const date = new Date(parsed.timestamp)
    const tijd = date.toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' })
    const restMs = parsed.timestamp - Date.now()
    const restMin = Math.round(restMs / 60000)

    await logAudit(interaction.client, {
        action: 'restart_set',
        user: interaction.user.tag,
        details: `Restart om ${tijd} (over ${restMin} min)`,
        color: 0x00ff00,
    })

    await interaction.reply({
        content: `✅ Restart ingepland om **${tijd}** (over ~${restMin} minuten).`,
        ephemeral: false,
    })
}
