import { SlashCommandBuilder } from 'discord.js'

export default {
	data: new SlashCommandBuilder()
		.setName("cape")
		.setDescription("Replies with a direct download link for a cape!")
		.addAttachmentOption(option => option.setName("file").setDescription("The files you want to share").setRequired(true))
		.addUserOption(option => option.setName("user").setDescription("The user to ping for the cape"))
	, async execute(interaction) {
		const capeFile = interaction.options.getAttachment("file");
		const userToPing = interaction.options.getUser("user");

		if (capeFile.url.endsWith(".png") || capeFile.url.endsWith(".gif")) {
			// Create embed message with the direct link to the image(s)'s URL.
			var randomColor = Math.floor(Math.random() * 16777215).toString(16);
			var embed = new Discord.MessageEmbed()
				.setDescription(`A cape has been detected, [here's a direct download to it](${capeFile.url})`)
				.setColor(randomColor)

			if(userToPing != null) {
				embed.setTitle(`<@${user.id}>`)
			}

			message.channel.send();
		}

		await interaction.reply({ embeds: [embed] });
	},
};