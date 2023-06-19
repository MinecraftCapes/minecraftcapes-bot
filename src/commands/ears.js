import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export default {
	data: new SlashCommandBuilder()
		.setName('ears')
		.setDescription('Replies with a direct download link for a ears!')
		.addAttachmentOption(option => option.setName('file').setDescription('The files you want to share').setRequired(true))
		.addUserOption(option => option.setName('user').setDescription('The user to ping for the ears')),
	async execute(interaction) {
		let embed;
		const earsFile = interaction.options.getAttachment('file');
		const userToPing = interaction.options.getUser('user');

		if (earsFile.url.endsWith('.png') || earsFile.url.endsWith('.gif')) {
			// Create embed message with the direct link to the image(s)'s URL.
			const randomColor = Math.floor(Math.random() * 16777215).toString(16);
			embed = new EmbedBuilder()
				.setDescription(`A ears has been detected, [here's a direct download to it](${earsFile.url})`)
				.setColor(randomColor);
		}
		else {
			embed = new EmbedBuilder().setDescription('That is not a valid ears file!');
		}

		await interaction.reply({
			content: userToPing != null ? `Hey <@${userToPing.id}>!` : null,
			embeds: [ embed ],
		});
	},
};