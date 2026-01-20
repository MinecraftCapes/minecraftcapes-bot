import { SlashCommandBuilder, EmbedBuilder } from 'discord.js'
import { roles, channels, logger } from '../utils.js'
import { setTimeout } from 'timers/promises'

export default {
    data: new SlashCommandBuilder()
        .setName('cape')
        .setDescription('Replies with a direct download link for a cape!')
        .addAttachmentOption((option) =>
            option
                .setName('file')
                .setDescription('The files you want to share')
                .setRequired(true)
        )
        .addUserOption((option) =>
            option
                .setName('user')
                .setDescription('The user to ping for the cape')
        ),
    async execute(interaction) {
        logger.info(`${interaction.user.displayName} has ran command /cape`)
        if (
            interaction.channel.id != channels.SHOWCASE &&
            !(
                await interaction.guild.members.fetch(interaction.user.id)
            ).roles.cache.some(
                (role) =>
                    role.id === roles.SUPPORT_STAFF || role.id === roles.HELPER
            )
        ) {
            const discordResponse = new EmbedBuilder()
                .setTitle('Error')
                .setDescription(`Use <#${channels.SHOWCASE}> for showcases`)
                .setColor('#FF0000')
            await interaction.editReply({ embeds: [discordResponse] })
            await setTimeout(5000)
            await interaction.deleteReply()
        } else {
            let embed
            const capeFile = interaction.options.getAttachment('file')
            const userToPing = interaction.options.getUser('user')

            if (
                capeFile.contentType == 'image/png' ||
                capeFile.contentType == 'image/gif'
            ) {
                // Create embed message with the direct link to the image(s)'s URL.
                embed = new EmbedBuilder()
                    .setDescription(
                        `A cape has been detected, [here's a direct download to it](${capeFile.url})`
                    )
                    .setColor('Random')
            } else {
                embed = new EmbedBuilder().setDescription(
                    'That is not a valid cape file!'
                )
            }

            await interaction.editReply({
                content: userToPing != null ? `Hey <@${userToPing.id}>!` : null,
                embeds: [embed],
            })
        }
    },
}
