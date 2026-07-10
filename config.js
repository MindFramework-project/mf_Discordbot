import 'dotenv/config'

export default {
    token: process.env.DISCORD_TOKEN,
    server: {
        ip: process.env.SERVER_IP || '127.0.0.1',
        port: parseInt(process.env.SERVER_PORT) || 30120,
    },
    cfxCode: process.env.CFX_RE_CODE || null,
    statusChannelId: process.env.STATUS_CHANNEL_ID || null,
    updateInterval: (parseInt(process.env.UPDATE_INTERVAL) || 30) * 1000,
    ownerRoleId: process.env.OWNER_ROLE_ID || null,
    staffRoles: process.env.STAFF_ROLES
        ? process.env.STAFF_ROLES.split(',').map((r) => r.trim())
        : [],
    staffChannelId: process.env.STAFF_CHANNEL_ID || null,
    txAdminConfigPath: process.env.TXADMIN_CONFIG_PATH || '/home/Daan/fivem/server/txData/default/config.json',
    suggestChannelId: process.env.SUGGEST_CHANNEL_ID || null,
    voiceChannelId: process.env.VOICE_CHANNEL_ID || null,
}
