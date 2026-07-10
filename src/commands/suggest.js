import { SlashCommandBuilder, EmbedBuilder } from 'discord.js'
import config from '../../config.js'

export const cooldown = 30

export const data = new SlashCommandBuilder()
    .setName('suggest')
    .setDescription('Doe een suggestie voor de server')
    .addStringOption((option) =>
        option
            .setName('categorie')
            .setDescription('Categorie van je suggestie')
            .setRequired(true)
            .addChoices(
                { name: '🚗 Voertuigen', value: 'voertuigen' },
                { name: '🏠 Huizen/Mapping', value: 'huizen' },
                { name: '👕 Kleding', value: 'kleding' },
                { name: '⚙️ Scripts/Mechanics', value: 'scripts' },
                { name: '👮 Hulpverlening', value: 'hulpverlening' },
                { name: '💼 Werk', value: 'werk' },
                { name: '🎮 Events', value: 'events' },
                { name: '❌ Bug Report', value: 'bug' },
                { name: '💡 Anders', value: 'anders' },
            ),
    )
    .addStringOption((option) =>
        option
            .setName('titel')
            .setDescription('Korte titel van je suggestie')
            .setRequired(true),
    )
    .addStringOption((option) =>
        option
            .setName('beschrijving')
            .setDescription('Uitgebreide beschrijving van je suggestie')
            .setRequired(true),
    )

export async function execute(interaction) {
    const categorie = interaction.options.getString('categorie')
    const titel = interaction.options.getString('titel')
    const beschrijving = interaction.options.getString('beschrijving')

    const channelId = config.suggestChannelId || global.suggestChannelId
    if (!channelId) {
        await interaction.reply({
            content: '❌ Er is geen suggestie kanaal ingesteld. Vraag een admin om `/setup` te gebruiken.',
            ephemeral: true,
        })
        return
    }

    const channel = await interaction.client.channels.fetch(channelId).catch(() => null)
    if (!channel) {
        await interaction.reply({
            content: '❌ Het suggestie kanaal bestaat niet meer.',
            ephemeral: true,
        })
        return
    }

    const categorieEmojis = {
        voertuigen: '🚗',
        huizen: '🏠',
        kleding: '👕',
        scripts: '⚙️',
        hulpverlening: '👮',
        werk: '💼',
        events: '🎮',
        bug: '❌',
        anders: '💡',
    }

    const embed = new EmbedBuilder()
        .setColor(0x9b59b6)
        .setTitle(`${categorieEmojis[categorie] || '💡'} ${titel}`)
        .setDescription(beschrijving)
        .addFields(
            { name: 'Categorie', value: categorie, inline: true },
            { name: 'Status', value: '🕐 In afwachting', inline: true },
        )
        .setAuthor({
            name: interaction.user.tag,
            iconURL: interaction.user.displayAvatarURL(),
        })
        .setFooter({ text: 'MindFramework • Suggesties' })
        .setTimestamp()

    const msg = await channel.send({ embeds: [embed] })
    await msg.react('✅')
    await msg.react('❌')

    await interaction.reply({
        content: `✅ Je suggestie is geplaatst in ${channel}.`,
        ephemeral: true,
    })
}
