// Required Libs
import {
    Client,
    Partials,
    GatewayIntentBits,
    Collection,
    Events,
    EmbedBuilder,
} from 'discord.js'
import config from './config.js'
import { roles, logger } from './utils.js'
import nitroUtils from './nitro-utils.js'

// Commands
import deployCommands from './deploy-commands.js'
import capeCommand from './commands/cape.js'
import earsCommand from './commands/ears.js'
import linkCommand from './commands/link.js'
import premiumCommand from './commands/premium.js'
import userCommand from './commands/user.js'

// Variables
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.MessageContent,
    ],
    partials: [Partials.GuildMember],
})

// Load Commands
client.commands = new Collection()
client.commands.set(capeCommand.data.name, capeCommand)
client.commands.set(earsCommand.data.name, earsCommand)
client.commands.set(linkCommand.data.name, linkCommand)
client.commands.set(premiumCommand.data.name, premiumCommand)
client.commands.set(userCommand.data.name, userCommand)

/**
 * Once the client has logged in
 */
client.on('ready', () => {
    logger.info(`Logged in as ${client.user.tag}!`)
    client.user.setStatus('online')

    // Deployt the slash commands
    deployCommands.execute()
    setInterval(() => deployCommands.execute(), 3600000)

    // Send a list of all boosters
    const currentGuild = client.guilds.cache.get('238799720787476481')
    nitroUtils.updateApi(currentGuild)
    setInterval(() => nitroUtils.updateApi(currentGuild), 864000000)
})

// Respond to a command
client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isChatInputCommand()) return

    const command = interaction.client.commands.get(interaction.commandName)
    await interaction.deferReply()

    if (!command) {
        logger.error(
            `No command matching ${interaction.commandName} was found.`
        )
        return
    }

    try {
        await command.execute(interaction)
    } catch (error) {
        logger.error(`${error}`)
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({
                content: 'There was an error while executing this command!',
                ephemeral: true,
            })
        } else {
            await interaction.editReply({
                content: 'There was an error while executing this command!',
                ephemeral: true,
            })
        }
    }
})

// Look for legacy messages
client.on('messageCreate', async (message) => {
    if (!message.content.startsWith('!') || message.author.bot) return

    const args = message.content.slice(1).split(' ')
    const command = args.shift().toLowerCase()

    if (
        command == 'user' ||
        command == 'premium' ||
        command == 'cape' ||
        command == 'ears' ||
        command == 'link'
    ) {
        if (command == 'premium' || command == 'link') {
            message.delete()
        }

        const reply = new EmbedBuilder()
            .setTitle('Error!')
            .setDescription(
                `That command is now a slash command. Please use /${command}`
            )
            .setColor('#FF0000')
        message.channel.send({ embeds: [reply] })
    }
})

// Handle Discord Boosting
client.on(Events.GuildMemberUpdate, (oldMember, newMember) => {
    // Check if the role was added
    if (
        !oldMember.roles.cache.has(roles.BOOSTER) &&
        newMember.roles.cache.has(roles.BOOSTER)
    ) {
        // A new booster
        nitroUtils.doBoostUpdate(newMember.user.id, true)
        logger.info(`${newMember.id} is now boosting`)
    }

    // Check if the role was removed
    if (
        oldMember.roles.cache.has(roles.BOOSTER) &&
        !newMember.roles.cache.has(roles.BOOSTER)
    ) {
        // No longer a booster
        nitroUtils.doBoostUpdate(newMember.user.id, false)
        logger.info(`${newMember.id} is no longer boosting`)
    }
})

// Login the bot
client.login(config.token)
