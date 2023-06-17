import { SlashCommandBuilder } from 'discord.js'

export default {
	data: new SlashCommandBuilder()
		.setName("ears")
		.setDescription("Replies with a direct download link for a ears!")
		.addAttachmentOption(option => option.setName("file").setDescription("The files you want to share").setRequired(true))
		.addUserOption(option => option.setName("user").setDescription("The user to ping for the ears"))
	, async execute(interaction) {
		const earsFile = interaction.options.getAttachment("file");
		const userToPing = interaction.options.getUser("user");

		if (earsFile.url.endsWith(".png") || earsFile.url.endsWith(".gif")) {
			// Create embed message with the direct link to the image(s)'s URL.
			var randomColor = Math.floor(Math.random() * 16777215).toString(16);
			var embed = new Discord.MessageEmbed()
				.setDescription(`A ears has been detected, [here's a direct download to it](${earsFile.url})`)
				.setColor(randomColor)

			if(userToPing != null) {
				embed.setTitle(`<@${user.id}>`)
			}

			message.channel.send();
		}

		await interaction.reply({ embeds: [embed] });
	},
};