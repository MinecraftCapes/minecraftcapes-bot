import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import * as config from '../../config.json' assert { type: "json" };
import { client } from '../index.js';

export default {
	data: new SlashCommandBuilder()
		.setName('premium')
		.setDescription('Give you premium')
		.addStringOption(option => option.setName('code').setDescription('The code from MinecraftCapes.net/premium').setRequired(true)),
	async execute(interaction) {
		const code = interaction.options.getString('code');

		// Post params
		const params = new URLSearchParams();
		params.append('code', code);

		// Send post request
		const response = await fetch('https://api.minecraftcapes.net/api/premium/discord/check', {
			method: 'POST',
			body: params,
		});

		let discordResponse = new EmbedBuilder().setTitle('Error').setDescription('That code doesn\'t seem correct!').setColor('#FF0000');

		if (response.ok && response.headers.get('content-type') == 'application/json') {
			const data = await response.json();

			if (data.success) {
                const guild = await client.guilds.resolve(config.default.guildId);
                const member = await guild.members.fetch(interaction.user.id)
                const role = await guild.roles.fetch('785110885847793694')

                await member.roles.add(role);

				discordResponse = new EmbedBuilder().setTitle('Successs').setDescription('You now have the premium role :)').setColor('#00FF00');
			}
		}

		await interaction.reply({ embeds: [discordResponse] });
	},
};