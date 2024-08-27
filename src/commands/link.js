import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import config from '../config.js';
import { roles, channels } from '../utils.js';
import nitroUtils from '../nitro-utils.js';
import { setTimeout } from 'timers/promises';
import axios from 'axios';

export default {
	data: new SlashCommandBuilder()
		.setName('link')
		.setDescription('Link your discord and MinecraftCapes account')
		.addStringOption(option => option.setName('code').setDescription('The code from MinecraftCapes.net/premium/boost').setRequired(true)),
	async execute(interaction) {
		let discordResponse;
		if (interaction.channel.id != channels.BOT_COMMANDS && !(await interaction.guild.members.fetch(interaction.user.id)).roles.cache.some(role => role.id === roles.SUPPORT_STAFF || role.id === roles.HELPER)) {
			discordResponse = new EmbedBuilder().setTitle('Error').setDescription(`Use <#${channels.BOT_COMMANDS}> for commands`).setColor('#FF0000');
		}
		else {
			const code = interaction.options.getString('code');

			const response = await axios.post('https://api.minecraftcapes.net/api/premium/boost/discord/check', {
				key: config.api_key,
				discord: interaction.user.id,
				code: code,
			});

			discordResponse = new EmbedBuilder().setTitle('Error').setDescription('That code doesn\'t seem correct!').setColor('#FF0000');

			if (response.headers['content-type'] == 'application/json') {
				const data = await response.data;

				if (data.success) {
					const member = await interaction.guild.members.fetch(interaction.user.id);
					const role = await interaction.guild.roles.fetch(roles.LINKED);

					await member.roles.add(role);

					discordResponse = new EmbedBuilder().setTitle('Successs').setDescription('You have now linked your account!').setColor('#00FF00');

					nitroUtils.doBoostUpdate(interaction.user.id, member.premiumSince != null);
				}
			}
		}

		await interaction.reply({ embeds: [discordResponse] });

		await setTimeout(5000);

		await interaction.deleteReply();
	},
};