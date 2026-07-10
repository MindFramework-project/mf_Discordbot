import { REST, Routes } from 'discord.js'
import config from './config.js'

import * as cmdIp from './src/commands/ip.js'
import * as cmdJoin from './src/commands/join.js'
import * as cmdPlayers from './src/commands/players.js'
import * as cmdStatus from './src/commands/status.js'
import * as cmdSetup from './src/commands/setup.js'
import * as cmdSetRestart from './src/commands/setrestart.js'
import * as cmdMaintenance from './src/commands/maintenance.js'
import * as cmdPlayer from './src/commands/player.js'
import * as cmdBroadcast from './src/commands/broadcast.js'
import * as cmdSuggest from './src/commands/suggest.js'

const commands = [cmdIp, cmdJoin, cmdPlayers, cmdStatus, cmdSetup, cmdSetRestart, cmdMaintenance, cmdPlayer, cmdBroadcast, cmdSuggest]
const commandsData = commands.map((c) => c.data.toJSON())

const rest = new REST({ version: '10' }).setToken(config.token)

try {
    console.log('📤 Bezig met registreren van slash commands...')

    await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), {
        body: commandsData,
    })

    console.log('✅ Slash commands succesvol geregistreerd!')
} catch (err) {
    console.error('❌ Fout bij registreren commands:', err)
    process.exit(1)
}
