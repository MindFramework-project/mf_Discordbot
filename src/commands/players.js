import { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } from 'discord.js'
import { getServerStatus } from '../services/fivem.js'
import { escapeMarkdown } from '../utils/markdown.js'

export const cooldown = 10

export const data = new SlashCommandBuilder()
    .setName('players')
    .setDescription('Toon alle online spelers')

const PAGE_SIZE = 25

function buildEmbed(sorted, page, totalPages) {
    const start = page * PAGE_SIZE
    const end = start + PAGE_SIZE
    const pagePlayers = sorted.slice(start, end)

    const list = pagePlayers
        .map(
            (p, i) =>
                `\`${String(start + i + 1).padStart(2, ' ')}\` **${escapeMarkdown(p.name)}** — ${p.ping || 0}ms`,
        )
        .join('\n')

    const embed = new EmbedBuilder()
        .setTitle(`👥 Spelers Online (${sorted.length})`)
        .setColor(0xf1e542)
        .setDescription(list)
        .setFooter({ text: `MindFramework • Pagina ${page + 1}/${totalPages}` })
        .setTimestamp()

    return embed
}

function buildButtons(page, totalPages) {
    const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId('players_prev')
            .setLabel('◀ Vorige')
            .setStyle(ButtonStyle.Primary)
            .setDisabled(page === 0),
        new ButtonBuilder()
            .setCustomId('players_next')
            .setLabel('Volgende ▶')
            .setStyle(ButtonStyle.Primary)
            .setDisabled(page >= totalPages - 1),
    )
    return row
}

export async function execute(interaction) {
    await interaction.deferReply()

    const status = await getServerStatus()

    if (!status.online) {
        await interaction.editReply('🔴 Server is offline.')
        return
    }

    if (status.players.length === 0) {
        await interaction.editReply('📭 Er zijn geen spelers online.')
        return
    }

    const sorted = [...status.players].sort(
        (a, b) => (b.ping || 0) - (a.ping || 0),
    )

    const totalPages = Math.ceil(sorted.length / PAGE_SIZE)
    let currentPage = 0

    const embed = buildEmbed(sorted, currentPage, totalPages)
    const row = totalPages > 1 ? buildButtons(currentPage, totalPages) : null

    const reply = await interaction.editReply({
        embeds: [embed],
        components: row ? [row] : [],
    })

    if (!row) return

    const collector = reply.createMessageComponentCollector({
        componentType: ComponentType.Button,
        time: 120_000,
    })

    collector.on('collect', async (btnInteraction) => {
        if (btnInteraction.user.id !== interaction.user.id) {
            await btnInteraction.reply({
                content: '❌ Je kunt niet door andermans lijst bladeren.',
                ephemeral: true,
            })
            return
        }

        if (btnInteraction.customId === 'players_prev') {
            currentPage = Math.max(0, currentPage - 1)
        } else if (btnInteraction.customId === 'players_next') {
            currentPage = Math.min(totalPages - 1, currentPage + 1)
        }

        await btnInteraction.update({
            embeds: [buildEmbed(sorted, currentPage, totalPages)],
            components: [buildButtons(currentPage, totalPages)],
        })
    })

    collector.on('end', async () => {
        await reply.edit({ components: [] }).catch(() => {})
    })
}
