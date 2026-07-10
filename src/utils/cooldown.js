const cooldowns = new Map()

export function checkCooldown(userId, commandName, seconds = 10) {
    const key = `${userId}_${commandName}`
    const now = Date.now()

    if (cooldowns.has(key)) {
        const expiresAt = cooldowns.get(key)
        if (now < expiresAt) {
            const remaining = Math.ceil((expiresAt - now) / 1000)
            return remaining
        }
    }

    cooldowns.set(key, now + seconds * 1000)
    return 0
}

export function clearCooldowns() {
    cooldowns.clear()
}
