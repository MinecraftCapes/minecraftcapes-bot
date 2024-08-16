// Required Libs
import { Client, GatewayIntentBits, Collection, Events, EmbedBuilder } from 'discord.js';
import config from './config.js';
import { doBoostUpdate, roles, logger } from './utils.js';

// Commands
import deployCommands from './deploy-commands.js';
import capeCommand from './commands/cape.js';
import earsCommand from './commands/ears.js';
import linkCommand from './commands/link.js';
import premiumCommand from './commands/premium.js';
import userCommand from './commands/user.js';

// Variables
export const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.GuildMembers,
		GatewayIntentBits.MessageContent,
	],
});

// Load Commands
client.commands = new Collection();
client.commands.set(capeCommand.data.name, capeCommand);
client.commands.set(earsCommand.data.name, earsCommand);
client.commands.set(linkCommand.data.name, linkCommand);
client.commands.set(premiumCommand.data.name, premiumCommand);
client.commands.set(userCommand.data.name, userCommand);

/**
 * Once the client has logged in
 */
client.on('ready', () => {
	logger.info(`Logged in as ${client.user.tag}!`);
	client.user.setStatus('online');

	deployCommands.execute();
	setInterval(() => deployCommands.execute(), 3600000);
});

// Respond to a command
client.on(Events.InteractionCreate, async interaction => {
	if (!interaction.isChatInputCommand()) return;

	const command = interaction.client.commands.get(interaction.commandName);

	if (!command) {
		logger.error(`No command matching ${interaction.commandName} was found.`);
		return;
	}

	try {
		await command.execute(interaction);
	}
	catch (error) {
		logger.error(`${error}`);
		if (interaction.replied || interaction.deferred) {
			await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
		}
		else {
			await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
		}
	}
});

// Look for legacy messages
client.on('messageCreate', async message => {
	if (!message.content.startsWith('!') || message.author.bot) return;

	const args = message.content.slice(1).split(' ');
	const command = args.shift().toLowerCase();

	if (command == 'user' || command == 'premium' || command == 'cape' || command == 'ears' || command == 'link') {
		if (command == 'premium' || command == 'link') {
			message.delete();
		}

		const reply = new EmbedBuilder().setTitle('Error!').setDescription(`That command is now a slash command. Please use /${command}`).setColor('#FF0000');
		message.channel.send({ embeds: [reply] });
	}

	// Keeping this here as a good test for events
	// if(command == "testnitro" && message.author.id == "231385835054956544") {
	//     const guild = await client.guilds.resolve(config.guildId);
	//     const original = await guild.members.fetch("231385835054956544")

	//     let clone = structuredClone(original);

	//     client.emit('guildMemberUpdate', original, clone);
	//     // client.emit('guildMemberUpdate', clone, original);
	// }

	// Diagnoses for getting current nitro IDs (james090500 ID)
	if (command == 'getnitro' && message.author.id == '231385835054956544') {
		// Cache the members
		await message.guild.members.fetch();

		// Get all the roles
		const nitroRole = message.guild.roles.cache.find(role => role.id === roles.BOOSTER);
		const nitroMembers = nitroRole.members.map(m => m.id);

		// Output the roles
		message.channel.send({ content: 'Nitro users have been logged to the console' });
		console.log(`The following IDs are boosting\n${nitroMembers.join('\n')}`);
	}
});

// Handle Discord Boosting
client.on(Events.GuildMemberUpdate, async (oldMember, newMember) => {
	const oldHasBoost = oldMember.premiumSince;
	const newHasBoost = newMember.premiumSince;

	if (!oldHasBoost && newHasBoost) {
		// A new booster
		await doBoostUpdate(newMember.user.id, true);
		logger.info(`${newMember.id} is now boosting`);
	}

	if (oldHasBoost && !newHasBoost) {
		// No longer a booster
		await doBoostUpdate(newMember.user.id, false);
		logger.info(`${newMember.id} is no longer boosting`);
	}
});


// Login the bot
client.login(config.token);