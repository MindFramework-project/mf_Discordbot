import { startBot } from './src/bot.js'

startBot().catch((err) => {
    console.error('❌ Bot kon niet starten:', err)
    process.exit(1)
})
