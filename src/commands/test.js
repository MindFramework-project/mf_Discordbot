import { SlashCommandBuilder } from 'discord.js'

export const data = new SlashCommandBuilder()
    .setName('test')
    .setDescription('Test of de bot online is')

export async function execute(interaction) {
    await interaction.reply({
        content: '✅ **MindFramework Bot** is online en werkt!',
        ephemeral: false,
    })
}
