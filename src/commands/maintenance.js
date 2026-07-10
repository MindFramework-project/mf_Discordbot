import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js'
import config from '../../config.js'
import { parseTime } from '../services/time.js'
import { forceUpdate, buildMaintenanceEmbed } from '../services/status.js'
import { logAudit } from '../services/audit.js'

export const data = new SlashCommandBuilder()
    .setName('maintenance')
    .setDescription('Zet de server of bot in onderhoudsmodus')
    .addStringOption((option) =>
        option
            .setName('doelwit')
            .setDescription('Wat wil je in onderhoud zetten?')
            .setRequired(true)
            .addChoices(
                { name: '🚧 FiveM Server', value: 'fivem' },
                { name: '🤖 Discord Bot', value: 'discord' },
                { name: '🔧 Beide', value: 'both' },
            ),
    )
    .addStringOption((option) =>
        option
            .setName('tijd')
            .setDescription('Hoe lang? Bijv: "30 minuten", "2 uur", of "cancel"')
            .setRequired(false),
    )

export async function execute(interaction) {
    const isOwner = config.ownerRoleId && interaction.member.roles.cache.has(config.ownerRoleId)
    const isAdmin = interaction.member.permissions.has(PermissionFlagsBits.Administrator)

    if (!isOwner && !isAdmin) {
        await interaction.reply({
            content: '❌ Je hebt geen toestemming voor dit commando.',
            ephemeral: true,
        })
        return
    }

    const target = interaction.options.getString('doelwit')
    const tijd = interaction.options.getString('tijd')

    if (tijd) {
        const parsed = parseTime(tijd)

        if (parsed && parsed.cancel) {
            global.maintenanceMode = null
            await forceUpdate(interaction.client)

            await logAudit(interaction.client, {
                action: 'maintenance_off',
                user: interaction.user.tag,
                details: 'Onderhoudsmodus uitgeschakeld',
                color: 0x00ff00,
            })

            await interaction.reply({
                content: '✅ Onderhoudsmodus uitgeschakeld.',
                ephemeral: false,
            })
            return
        }

        if (!parsed) {
            await interaction.reply({
                content: '❌ Kon de tijd niet herkennen. Gebruik bijvoorbeeld:\n'
                    + '`30 minuten`\n'
                    + '`2 uur`\n'
                    + '`cancel`',
                ephemeral: true,
            })
            return
        }

        global.maintenanceMode = { type: target, until: parsed.timestamp }

        const date = new Date(parsed.timestamp)
        const tijdStr = date.toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' })
        const restMs = parsed.timestamp - Date.now()
        const restMin = Math.round(restMs / 60000)

        await forceUpdate(interaction.client)

        await logAudit(interaction.client, {
            action: 'maintenance_on',
            user: interaction.user.tag,
            details: `${target} in onderhoud tot ${tijdStr} (${restMin} min)`,
            color: 0xffa500,
        })

        const embed = buildMaintenanceEmbed(global.maintenanceMode)
        await interaction.reply({
            content: `✅ **${target === 'fivem' ? 'FiveM Server' : target === 'discord' ? 'Discord Bot' : 'FiveM Server & Discord Bot'}** in onderhoud tot **${tijdStr}** (over ~${restMin} minuten).`,
            embeds: [embed],
            ephemeral: false,
        })
        return
    }

    global.maintenanceMode = { type: target, until: null }

    await forceUpdate(interaction.client)

    await logAudit(interaction.client, {
        action: 'maintenance_on',
        user: interaction.user.tag,
        details: `${target} in onderhoud voor onbepaalde tijd`,
        color: 0xffa500,
    })

    const embed = buildMaintenanceEmbed(global.maintenanceMode)
    await interaction.reply({
        content: `✅ **${target === 'fivem' ? 'FiveM Server' : target === 'discord' ? 'Discord Bot' : 'FiveM Server & Discord Bot'}** in onderhoud voor onbepaalde tijd.`,
        embeds: [embed],
        ephemeral: false,
    })
}
