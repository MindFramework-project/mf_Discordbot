import { SlashCommandBuilder, EmbedBuilder } from 'discord.js'
import { getServerStatus } from '../services/fivem.js'

export const cooldown = 5

export const data = new SlashCommandBuilder()
    .setName('status')
    .setDescription('Toon de huidige server status')

export async function execute(interaction) {
    await interaction.deferReply()

    const status = await getServerStatus()
    const emoji = status.online ? '🟢' : '🔴'
    const state = status.online ? 'Online' : 'Offline'

    const embed = new EmbedBuilder()
        .setTitle(`${emoji} MindFramework — ${state}`)
        .setColor(status.online ? 0xf1e542 : 0xff4444)
        .addFields(
            {
                name: 'Status',
                value: `${emoji} ${state}`,
                inline: true,
            },
            {
                name: 'Spelers',
                value: status.online
                    ? `${status.playerCount}/${status.maxPlayers}`
                    : '—',
                inline: true,
            },
        )
        .setFooter({ text: 'MindFramework' })
        .setTimestamp()

    if (status.online && status.players.length > 0) {
        const sorted = [...status.players].sort(
            (a, b) => (b.ping || 0) - (a.ping || 0),
        )
        const list = sorted
            .slice(0, 10)
            .map(
                (p, i) =>
                    `\`${String(i + 1).padStart(2, ' ')}\` **${p.name}** — ${p.ping || 0}ms`,
            )
            .join('\n')

        embed.addFields({
            name: `📋 Spelers (top 10)`,
            value: list,
            inline: false,
        })
    }

    await interaction.editReply({ embeds: [embed] })
}
