import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import * as config from '../../config.json' assert { type: "json" };
import { setTimeout } from 'timers/promises'

export default {
	data: new SlashCommandBuilder()
		.setName('premium')
		.setDescription('Give you premium')
		.addStringOption(option => option.setName('code').setDescription('The code from MinecraftCapes.net/premium').setRequired(true)),
	async execute(interaction) {
		let discordResponse;
		if(interaction.channel.id != channels.BOT_COMMANDS && !(await interaction.guild.members.fetch(interaction.user.id)).roles.cache.some(role => role.id === roles.SUPPORT_STAFF || role.id === roles.HELPER)) {
			discordResponse = new EmbedBuilder().setTitle('Error').setDescription(`Use <#${channels.BOT_COMMANDS}> for commands`).setColor('#FF0000');
		} else {
			const code = interaction.options.getString('code');

			// Post params
			const params = new URLSearchParams();
			params.append('key', config.default.api_key);
			params.append('code', code);

			// Send post request
			const response = await fetch('https://api.minecraftcapes.net/api/premium/discord/check', {
				method: 'POST',
				body: params,
			});

			discordResponse = new EmbedBuilder().setTitle('Error').setDescription('That code doesn\'t seem correct!').setColor('#FF0000');

			if (response.ok && response.headers.get('content-type') == 'application/json') {
				const data = await response.json();

				if (data.success) {
					const member = await interaction.guild.members.fetch(interaction.user.id)
					const role = await interaction.guild.roles.fetch('785110885847793694') // Premium

					await member.roles.add(role);

					discordResponse = new EmbedBuilder().setTitle('Successs').setDescription('You now have the premium role :)').setColor('#00FF00');
				}
			}
		}

		await interaction.reply({ embeds: [discordResponse] });

		await setTimeout(5_000);

		await interaction.deleteReply();
	},
};