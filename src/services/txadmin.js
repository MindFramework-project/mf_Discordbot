import { readFileSync, existsSync } from 'node:fs'
import config from '../../config.js'

export function getNextRestart() {
    try {
        if (!existsSync(config.txAdminConfigPath)) return null

        const raw = readFileSync(config.txAdminConfigPath, 'utf-8')
        const config = JSON.parse(raw)

        if (!config.restarter?.schedule?.length) return null

        const now = Date.now()
        const today = new Date()
        const todayStr = today.toISOString().slice(0, 10)

        let nearest = null

        for (const timeStr of config.restarter.schedule) {
            const [hours, minutes] = timeStr.split(':').map(Number)
            const target = new Date(todayStr + 'T' + timeStr + ':00Z')

            if (target.getTime() < now) {
                target.setDate(target.getDate() + 1)
            }

            if (!nearest || target.getTime() < nearest) {
                nearest = target.getTime()
            }
        }

        return nearest
    } catch {
        return null
    }
}
