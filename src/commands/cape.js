import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export default {
	data: new SlashCommandBuilder()
		.setName('cape')
		.setDescription('Replies with a direct download link for a cape!')
		.addAttachmentOption(option => option.setName('file').setDescription('The files you want to share').setRequired(true))
		.addUserOption(option => option.setName('user').setDescription('The user to ping for the cape')),
	async execute(interaction) {
		let embed;
		const capeFile = interaction.options.getAttachment('file');
		const userToPing = interaction.options.getUser('user');

		if (capeFile.url.endsWith('.png') || capeFile.url.endsWith('.gif')) {
			// Create embed message with the direct link to the image(s)'s URL.
			embed = new EmbedBuilder()
				.setDescription(`A cape has been detected, [here's a direct download to it](${capeFile.url})`)
				.setColor('Random');
		}
		else {
			embed = new EmbedBuilder().setDescription('That is not a valid cape file!');
		}

		await interaction.reply({
			content: userToPing != null ? `Hey <@${userToPing.id}>!` : null,
			embeds: [ embed ],
		});
	},
};