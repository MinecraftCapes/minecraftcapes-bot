import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { getUser, checkUrl } from '../utils.js';
import * as config from '../../config.json' assert { type: "json" };

export default {
	data: new SlashCommandBuilder()
		.setName('user')
		.setDescription('Get information about a Minecraft user!')
		.addStringOption(option => option.setName('user').setDescription('The minecraft user you want to check').setRequired(true)),
	async execute(interaction) {
		const mcUser = interaction.options.getString('user');

		console.log(`[INFO] Running !user for ${mcUser}`);

		// Random message colour
		const randomColor = Math.floor(Math.random() * 16777215).toString(16);

		// Get the user
		const user = await getUser(mcUser);

		// Get all cape urls
		const cape_urls = config.cape_urls;

		// Make sure user is real
		if (user === null) {
			const embed = new EmbedBuilder().setTitle('Invalid Username!').setDescription('The username is invalid, please make sure you typed it in correctly.').setColor('#FF0000')
			await interaction.reply({ embeds: [embed] });
			return;
		}

		// Add the fileds
		const fields = [{
			name: 'UUID:',
			value: `\`${user.uuid}\``,
		}];

		// Check MinecraftCapes
		let minecraftcapes = await fetch(`https://api.minecraftcapes.net/profile/${user.uuid}`);
		minecraftcapes = await minecraftcapes.json();
		if (minecraftcapes.animatedCape || minecraftcapes.capeGlint || minecraftcapes.upsideDown) {
			fields.push({
				name: 'Premium',
				value: 'Yes :tada:',
				inline: true,
			});
		}

		if (minecraftcapes.textures.cape) {
			fields.push({
				name: 'MinecraftCapes Cape',
				value: `https://api.minecraftcapes.net/profile/${user.uuid}/cape/map`,
			});
		}

		if (minecraftcapes.textures.ears) {
			fields.push({
				name: 'MinecraftCapes Ears',
				value: `https://api.minecraftcapes.net/profile/${user.uuid}/ears`,
			});
		}

		// Check for other cape providers
		for (const cape_url in cape_urls) {
			const cape = cape_urls[cape_url];
			let url = cape.url;
			url = url.replace('{$uuid}', user.uuid);
			url = url.replace('{$username}', user.name);
			const url_check = await checkUrl(url);

			if (url_check) {
				fields.push({
					name: cape.name,
					value: url,
				});
			}
		}

		const description = `**[NameMC Link](https://mine.ly/${user.uuid})**\n**[MinecraftCapes Link](https://minecraftcapes.net/user/${user.uuid})**`;
		const thumbnail = `https://minecraftapi.net/api/v2/profile/${user.uuid}/avatar?size=265&overlay=true`;
		const reply = new EmbedBuilder().setTitle(user.name).setDescription(description).setColor(randomColor).setFields(fields).setThumbnail(thumbnail)

		await interaction.reply({ embeds: [reply] });
	}
};