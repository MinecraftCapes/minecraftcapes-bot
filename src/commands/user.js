import { SlashCommandBuilder, EmbedBuilder } from 'discord.js'
import { getUser, roles, channels, logger } from '../utils.js'
import { setTimeout } from 'timers/promises'
import UserEmbed from '../embeds/UserEmbed.js'

export default {
    data: new SlashCommandBuilder()
        .setName('user')
        .setDescription('Get information about a Minecraft user!')
        .addStringOption((option) =>
            option
                .setName('user')
                .setDescription('The minecraft user you want to check')
                .setRequired(true)
        ),
    async execute(interaction) {
        logger.info(`${interaction.user.displayName} has ran command /user`)
        if (
            interaction.channel.id != channels.BOT_COMMANDS &&
            !(
                await interaction.guild.members.fetch(interaction.user.id)
            ).roles.cache.some(
                (role) =>
                    role.id === roles.SUPPORT_STAFF || role.id === roles.HELPER
            )
        ) {
            const discordResponse = new EmbedBuilder()
                .setTitle('Error')
                .setDescription(`Use <#${channels.BOT_COMMANDS}> for commands`)
                .setColor('#FF0000')
            await interaction.editReply({ embeds: [discordResponse] })
            await setTimeout(5000)
            await interaction.deleteReply()
        } else {
            const mcUser = interaction.options.getString('user')

            // Get the user
            const user = await getUser(mcUser)

            // Make sure user is real
            if (user === null) {
                const embed = new EmbedBuilder()
                    .setTitle('Invalid Username!')
                    .setDescription(
                        'The username is invalid, please make sure you typed it in correctly.'
                    )
                    .setColor('#FF0000')
                await interaction.editReply({ embeds: [embed] })
                return
            }

            const reply = await UserEmbed.get(user)

            await interaction.editReply({ embeds: [reply] })
        }
    },
}
