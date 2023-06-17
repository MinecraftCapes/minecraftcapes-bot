//Required Libs
import { Client, GatewayIntentBits, Collection, Events } from 'discord.js'
import * as winston from "winston"
import fetch from 'node-fetch'
import path from 'node:path'
import fs from 'node:fs'
import * as config from '../config.json' assert { type: "json" };
import { fileURLToPath } from 'url';

//Commands
import capeCommand from './commands/cape.js'
import earsCommand from './commands/ears.js'
import premiumCommand from './commands/premium.js'
import userCommand from './commands/user.js'

//Variables
const client = new Client({intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages]});
const { combine, timestamp, printf } = winston.format;

var special_ids = {
    founder: "478667633932238872",
    contributor: "479048180202340362",
    supportStaff: "478670065483513860",
    capeCreator: "628211166321311744",
};

//Logger add
const logger = winston.createLogger({
    level: 'info',
    format: combine(
        timestamp(),
        printf(({ level, message, timestamp }) => {
            return `${timestamp} ${level.toUpperCase()}: ${message}`;
        })
    ),
    colorize: true,
    transports: [
        new winston.transports.Console()
    ]
})

// Load Commands
client.commands = new Collection();
client.commands.set(capeCommand.data.name, capeCommand)
client.commands.set(earsCommand.data.name, earsCommand)
client.commands.set(premiumCommand.data.name, premiumCommand)
client.commands.set(userCommand.data.name, userCommand)

/**
 * Once the client has logged in
 */
client.on('ready', () => {
    logger.info(`Logged in as ${client.user.tag}!`);
    client.user.setStatus('online')
});

//Respond to a command
client.on(Events.InteractionCreate, async interaction => {
	if (!interaction.isChatInputCommand()) return;

	const command = interaction.client.commands.get(interaction.commandName);

	if (!command) {
		logger.error(`No command matching ${interaction.commandName} was found.`);
		return;
	}

	try {
		await command.execute(interaction);
	} catch (error) {
		logger.error(error);
		if (interaction.replied || interaction.deferred) {
			await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
		} else {
			await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
		}
	}
});

//Login the bot
client.login(config.default.token);