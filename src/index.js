//Required Libs
import { Client, GatewayIntentBits, Collection, Events, EmbedBuilder } from 'discord.js'
import * as config from '../config.json' assert { type: "json" };
import { doBoostUpdate } from './utils.js';

//Commands
import capeCommand from './commands/cape.js'
import earsCommand from './commands/ears.js'
import linkCommand from './commands/link.js'
import premiumCommand from './commands/premium.js'
import userCommand from './commands/user.js'

//Variables
export const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.MessageContent
    ],
});

// Load Commands
client.commands = new Collection();
client.commands.set(capeCommand.data.name, capeCommand)
client.commands.set(earsCommand.data.name, earsCommand)
client.commands.set(linkCommand.data.name, linkCommand)
client.commands.set(premiumCommand.data.name, premiumCommand)
client.commands.set(userCommand.data.name, userCommand)

/**
 * Once the client has logged in
 */
client.on('ready', () => {
    console.log(`[INFO] Logged in as ${client.user.tag}!`);
    client.user.setStatus('online')
});

//Respond to a command
client.on(Events.InteractionCreate, async interaction => {
	if (!interaction.isChatInputCommand()) return;

	const command = interaction.client.commands.get(interaction.commandName);

	if (!command) {
		console.log(`[ERROR] No command matching ${interaction.commandName} was found.`);
		return;
	}

	try {
		await command.execute(interaction);
	} catch (error) {
		console.log(`[ERROR] ${error}`);
		if (interaction.replied || interaction.deferred) {
			await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
		} else {
			await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
		}
	}
});

//Look for legacy messages
client.on('messageCreate', async message => {
    if (!message.content.startsWith('!') || message.author.bot) return;

    var args = message.content.slice(1).split(' ');
    var command = args.shift().toLowerCase();

    if(command == "user" || command == "premium" || command == "cape" || command == "ears") {
        if(command == "premium" || command == "link") {
            message.delete();
        }

        let reply = new EmbedBuilder().setTitle('Error!').setDescription(`That command is now a slash command. Please use /${command}`).setColor('#FF0000')
        message.channel.send({ embeds: [reply] });
    }

    // Keeping this here as a good test for events
    // if(command == "testnitro" && message.author.id == "231385835054956544") {
    //     const guild = await client.guilds.resolve(config.default.guildId);
    //     const original = await guild.members.fetch("231385835054956544")

    //     let clone = structuredClone(original);
    //     clone.premiumSince = new Date()

    //     client.emit('guildMemberUpdate', original, clone);
    //     client.emit('guildMemberUpdate', clone, original);
    // }
})

//Handle Discord Boosting
client.on(Events.GuildMemberUpdate, (oldMember, newMember) => {
    //A new booster
    if(!oldMember.premiumSince && newMember.premiumSince) {
        doBoostUpdate(newMember.id, true)
    }

    //No longer a booster
    if(oldMember.premiumSince && !newMember.premiumSince) {
        doBoostUpdate(newMember.id, false)
    }
})

//Login the bot
client.login(config.default.token);