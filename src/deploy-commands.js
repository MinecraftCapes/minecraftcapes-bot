import { REST, Routes } from 'discord.js'
import * as config from '../config.json' assert { type: "json" };

//Commands
import capeCommand from './commands/cape.js'
import earsCommand from './commands/ears.js'
import linkCommand from './commands/link.js'
import premiumCommand from './commands/premium.js'
import userCommand from './commands/user.js'

const commands = [
	capeCommand.data.toJSON(),
	earsCommand.data.toJSON(),
	linkCommand.data.toJSON(),
	premiumCommand.data.toJSON(),
	userCommand.data.toJSON(),
];

// Construct and prepare an instance of the REST module
const rest = new REST().setToken(config.default.token);

// and deploy your commands!
(async () => {
	try {
		console.log(`Started refreshing ${commands.length} application (/) commands.`);

		// The put method is used to fully refresh all commands in the guild with the current set
		const data = await rest.put(
			Routes.applicationGuildCommands(config.default.clientId, config.default.guildId),
			{ body: commands },
		);

		console.log(`Successfully reloaded ${data.length} application (/) commands.`);
	} catch (error) {
		// And of course, make sure you catch and log any errors!
		console.error(error);
	}
})();