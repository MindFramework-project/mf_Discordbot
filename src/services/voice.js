import config from '../../config.js'

export async function updateVoiceChannel(client, playerCount, maxPlayers) {
    const channelId = config.voiceChannelId || global.voiceChannelId
    if (!channelId) return

    try {
        const channel = await client.channels.fetch(channelId)
        if (channel && channel.isVoiceBased()) {
            const name = maxPlayers
                ? `🎮 ${playerCount}/${maxPlayers} spelers`
                : `🎮 ${playerCount} spelers`
            if (channel.name !== name) {
                await channel.setName(name)
            }
        }
    } catch {
        // channel bestaat niet of geen perms
    }
}
