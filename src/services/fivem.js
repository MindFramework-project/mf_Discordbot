import config from '../../config.js'

const BASE = `http://${config.server.ip}:${config.server.port}`

export async function fetchServerInfo() {
    const res = await fetch(`${BASE}/info.json`, {
        signal: AbortSignal.timeout(5000),
    })
    if (!res.ok) throw new Error(`Server info returned ${res.status}`)
    return res.json()
}

export async function fetchPlayers() {
    const res = await fetch(`${BASE}/players.json`, {
        signal: AbortSignal.timeout(5000),
    })
    if (!res.ok) throw new Error(`Players endpoint returned ${res.status}`)
    return res.json()
}

export async function getServerStatus() {
    try {
        const [info, players] = await Promise.all([
            fetchServerInfo(),
            fetchPlayers(),
        ])
        return {
            online: true,
            hostname: info.hostname || 'MindFramework',
            players: Array.isArray(players) ? players : [],
            playerCount: Array.isArray(players) ? players.length : 0,
            maxPlayers: parseInt(info.vars?.sv_maxClients ?? info.vars?.sv_maxclients ?? info.sv_maxclients ?? info.svMaxClients) || 32,
            enhancedHostSupport: info.enhancedHostSupport || false,
            icon: info.icon || null,
            resources: info.resources || [],
            server: info.server || 'unknown',
            uptime: info.uptime || 0,
            tags: info.tags || [],
            vars: info.vars || {},
        }
    } catch {
        return { online: false, players: [], playerCount: 0, maxPlayers: 0 }
    }
}
