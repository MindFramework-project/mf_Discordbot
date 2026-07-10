import { SlashCommandBuilder } from 'discord.js'
import config from '../../config.js'

export const data = new SlashCommandBuilder()
    .setName('ip')
    .setDescription('Toon het server IP-adres')

export async function execute(interaction) {
    await interaction.reply({
        content: `🌐 **MindFramework**\n\`\`\`connect ${config.server.ip}:${config.server.port}\`\`\``,
        ephemeral: false,
    })
}
