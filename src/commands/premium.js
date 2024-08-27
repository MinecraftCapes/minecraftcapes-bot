import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import config from '../config.js';
import { setTimeout } from 'timers/promises';
import { roles, channels } from '../utils.js';
import axios from 'axios';

export default {
	data: new SlashCommandBuilder()
		.setName('premium')
		.setDescription('Give you premium')
		.addStringOption(option => option.setName('code').setDescription('The code from MinecraftCapes.net/premium').setRequired(true)),
	async execute(interaction) {
		let discordResponse;
		if (interaction.channel.id != channels.BOT_COMMANDS && !(await interaction.guild.members.fetch(interaction.user.id)).roles.cache.some(role => role.id === roles.SUPPORT_STAFF || role.id === roles.HELPER)) {
			discordResponse = new EmbedBuilder().setTitle('Error').setDescription(`Use <#${channels.BOT_COMMANDS}> for commands`).setColor('#FF0000');
		}
		else {
			const code = interaction.options.getString('code');

			// Send post request
			const response = await axios.post('https://api.minecraftcapes.net/api/premium/discord/check', {
				key: config.api_key,
				code: code,
			});

			discordResponse = new EmbedBuilder().setTitle('Error').setDescription('That code doesn\'t seem correct!').setColor('#FF0000');

			if (response.headers['content-type'] == 'application/json') {
				const data = await response.data;

				if (data.success) {
					const member = await interaction.guild.members.fetch(interaction.user.id);
					const role = await interaction.guild.roles.fetch(roles.PREMIUM);

					await member.roles.add(role);

					discordResponse = new EmbedBuilder().setTitle('Successs').setDescription('You now have the premium role :)').setColor('#00FF00');
				}
			}
		}

		await interaction.reply({ embeds: [discordResponse] });

		await setTimeout(5000);

		await interaction.deleteReply();
	},
};