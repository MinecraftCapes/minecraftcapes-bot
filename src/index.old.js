//Require Libs
const Discord = require('discord.js');
const winston = require('winston');
const { combine, timestamp, printf } = winston.format;
const fetch = import('node-fetch');
const path = require('node:path');
const fs = require('node:fs');
const { URLSearchParams } = require('url');
var config = null

//Variables
const client = new Discord.Client({intents: [Discord.GatewayIntentBits.Guilds, Discord.GatewayIntentBits.GuildMessages]});
const prefix = '!';

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

//Try load config
try {
    config = require('../config.json');
} catch(error) {
    logger.error("Config file not found")
    process.exit()
}

// Load Commands
client.commands = new Discord.Collection();
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const filePath = path.join(commandsPath, file);
	const command = require(filePath);
	// Set a new item in the Collection with the key as the command name and the value as the exported module
	if ('data' in command && 'execute' in command) {
		client.commands.set(command.data.name, command);
	} else {
		logger.warning(`The command at ${filePath} is missing a required "data" or "execute" property.`);
	}
}

// These IDs have to be set to strings, as discord.js takes strings when it comes to IDs.
// Debug code used - logger.info(`${typeof message.member.roles.cache.keyArray()[0]}`)




