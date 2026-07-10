import { SlashCommandBuilder, EmbedBuilder } from 'discord.js'
import { getServerStatus } from '../services/fivem.js'

export const cooldown = 5

export const data = new SlashCommandBuilder()
    .setName('player')
    .setDescription('Zoek een speler op de server')
    .addStringOption((option) =>
        option
            .setName('naam')
            .setDescription('(Deel van) de spelersnaam')
            .setRequired(true),
    )

export async function execute(interaction) {
    await interaction.deferReply()

    const query = interaction.options.getString('naam').toLowerCase()
    const status = await getServerStatus()

    if (!status.online) {
        await interaction.editReply('🔴 Server is offline.')
        return
    }

    const matches = status.players.filter((p) =>
        p.name.toLowerCase().includes(query),
    )

    if (matches.length === 0) {
        await interaction.editReply(`📭 Geen spelers gevonden met "${query}".`)
        return
    }

    if (matches.length > 25) {
        await interaction.editReply(`📋 Te veel resultaten (${matches.length}). Probeer een specifiekere naam.`)
        return
    }

    const embeds = matches.map((p) => {
        const ids = Array.isArray(p.identifiers) ? p.identifiers : []
        const discordId = ids.find((id) => id.startsWith('discord:'))
        const steamId = ids.find((id) => id.startsWith('steam:'))
        const fivemId = ids.find((id) => id.startsWith('fivem:'))
        const license = ids.find((id) => id.startsWith('license:'))

        const embed = new EmbedBuilder()
            .setColor(0xf1e542)
            .setTitle(`👤 ${p.name}`)
            .addFields(
                { name: 'Ping', value: `${p.ping || 0}ms`, inline: true },
                { name: 'ID', value: `${p.id ?? '—'}`, inline: true },
            )

        if (discordId) embed.addFields({ name: 'Discord', value: `<@${discordId.split(':')[1]}>`, inline: false })
        if (steamId) embed.addFields({ name: 'Steam', value: `\`${steamId}\``, inline: false })
        if (fivemId) embed.addFields({ name: 'FiveM', value: `\`${fivemId}\``, inline: false })
        if (license) embed.addFields({ name: 'License', value: `\`${license}\``, inline: false })

        embed.setFooter({ text: 'MindFramework' })
        embed.setTimestamp()

        return embed
    })

    if (embeds.length === 1) {
        await interaction.editReply({ embeds })
    } else {
        await interaction.editReply({
            content: `📋 ${embeds.length} resultaten gevonden:`,
            embeds,
        })
    }
}
