import { SlashCommandBuilder, EmbedBuilder } from 'discord.js'
import { roles, channels, logger } from '../utils.js'
import { setTimeout } from 'timers/promises'

export default {
    ephemeral: false,
    data: new SlashCommandBuilder()
        .setName('ears')
        .setDescription('Replies with a direct download link for a ears!')
        .addAttachmentOption((option) =>
            option
                .setName('file')
                .setDescription('The files you want to share')
                .setRequired(true)
        )
        .addUserOption((option) =>
            option
                .setName('user')
                .setDescription('The user to ping for the ears')
        ),
    async execute(interaction) {
        logger.info(`${interaction.user.displayName} has ran command /ears`)
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
            const earsFile = interaction.options.getAttachment('file')
            const userToPing = interaction.options.getUser('user')

            if (earsFile.contentType == 'image/png') {
                // Create embed message with the direct link to the image(s)'s URL.
                embed = new EmbedBuilder()
                    .setDescription(
                        `A ears has been detected, [here's a direct download to it](${earsFile.url})`
                    )
                    .setColor('Random')
            } else {
                embed = new EmbedBuilder().setDescription(
                    'That is not a valid ears file!'
                )
            }

            await interaction.editReply({
                content: userToPing != null ? `Hey <@${userToPing.id}>!` : null,
                embeds: [embed],
            })
        }
    },
}
