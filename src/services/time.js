export function parseTime(input) {
    const lower = input.toLowerCase().trim()

    if (lower === 'cancel' || lower === 'stop' || lower === 'off') {
        return { cancel: true }
    }

    const now = Date.now()

    const patterns = [
        { regex: /^in (\d+)\s*(minuut|minuten|min|m)$/, fn: (m) => now + parseInt(m[1]) * 60000 },
        { regex: /^(\d+)\s*(minuut|minuten|min|m)$/, fn: (m) => now + parseInt(m[1]) * 60000 },
        { regex: /^in (\d+)\s*(uur|hour|hours|h)$/, fn: (m) => now + parseInt(m[1]) * 3600000 },
        { regex: /^(\d+)\s*(uur|hour|hours|h)$/, fn: (m) => now + parseInt(m[1]) * 3600000 },
    ]

    for (const { regex, fn } of patterns) {
        const match = lower.match(regex)
        if (match) return { timestamp: fn(match) }
    }

    const timeMatch = lower.match(/(\d{1,2}):(\d{2})\s*(?:uur|:)?$/)
    if (timeMatch) {
        const target = new Date()
        target.setHours(parseInt(timeMatch[1]), parseInt(timeMatch[2]), 0, 0)
        if (target.getTime() < now) target.setDate(target.getDate() + 1)
        return { timestamp: target.getTime() }
    }

    const hourMatch = lower.match(/^(\d{1,2})\s*(?:uur|:00)?$/)
    if (hourMatch) {
        const target = new Date()
        target.setHours(parseInt(hourMatch[1]), 0, 0, 0)
        if (target.getTime() < now) target.setDate(target.getDate() + 1)
        return { timestamp: target.getTime() }
    }

    return null
}

export function getRemainingText(timestamp) {
    const diff = timestamp - Date.now()
    if (diff <= 0) return '🔧 Wordt zo beëindigd...'

    const min = Math.floor(diff / 60000)
    const sec = Math.floor((diff % 60000) / 1000)
    const uren = Math.floor(min / 60)
    const restMin = min % 60

    if (uren > 0) {
        return `Over ${uren} uur en ${restMin} minuten`
    }
    if (min > 0) {
        return `Over ${min} minuut${min !== 1 ? 'en' : ''} en ${sec} seconden`
    }
    return `Over ${sec} seconden`
}
