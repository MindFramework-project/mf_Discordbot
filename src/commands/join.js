import { SlashCommandBuilder } from 'discord.js'
import config from '../../config.js'

export const data = new SlashCommandBuilder()
    .setName('join')
    .setDescription('Krijg een directe join link voor de server')

export async function execute(interaction) {
    const connectLink = config.cfxCode
        ? `https://cfx.re/join/${config.cfxCode}`
        : `fivem://connect/${config.server.ip}:${config.server.port}`
    await interaction.reply({
        content: `🎮 Klik hier om direct te joinen:\n${connectLink}\n\nOf kopieer dit in F8:\n\`\`\`connect ${config.server.ip}:${config.server.port}\`\`\``,
        ephemeral: false,
    })
}
