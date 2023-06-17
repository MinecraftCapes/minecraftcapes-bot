import { SlashCommandBuilder } from 'discord.js'

export default {
	data: new SlashCommandBuilder()
		.setName("user")
		.setDescription("Get information about a Minecraft user!")
		.addStringOption(option => option.setName("user").setDescription("The minecraft user you want to check").setRequired(true))
	, async execute(interaction) {
		const mcUser = interaction.options.getString("user");

		console.log(`[INFO] Running !user for ${mcUser}`)

		//Random message colour
		var randomColor = Math.floor(Math.random() * 16777215).toString(16);

		//Get the user
		var user = await utils.getUser(mcUser);

		//Get all cape urls
		var cape_urls = config.cape_urls;

		//Make sure user is real
		if (user === null) {
			let embed = await utils.embed("Invalid Username!", "The username is invalid, please make sure you typed it in correctly.", `0xFF0000`);
			await interaction.reply({ embeds: [embed] });
			return;
		}

		// Add the fileds
		var fields = [{
			name: "UUID:",
			value: `\`${user.uuid}\``
		}];

		// Check MinecraftCapes
		var minecraftcapes = await fetch(`https://api.minecraftcapes.net/profile/${user.uuid}`)
		minecraftcapes = await minecraftcapes.json();
		if(minecraftcapes.animatedCape || minecraftcapes.capeGlint || minecraftcapes.upsideDown) {
			fields.push({
				name: "Premium",
				value: "Yes :tada:",
				inline: true
			})
		}

		if(minecraftcapes.textures.cape) {
			fields.push({
				name: "MinecraftCapes Cape",
				value: `https://api.minecraftcapes.net/profile/${user.uuid}/cape/map`
			});
		}

		if(minecraftcapes.textures.ears) {
			fields.push({
				name: "MinecraftCapes Ears",
				value: `https://api.minecraftcapes.net/profile/${user.uuid}/ears`
			});
		}

		// Check for other cape providers
		for (var cape_url in cape_urls) {
			var cape = cape_urls[cape_url];
			var url = cape.url;
			url = url.replace('{$uuid}', user.uuid);
			url = url.replace('{$username}', user.name);
			var url_check = await utils.checkUrl(url);

			if (url_check) {
				fields.push({
					name: cape.name,
					value: url
				});
			}
		}

		var description = `**[NameMC Link](https://mine.ly/${user.uuid})**\n**[MinecraftCapes Link](https://minecraftcapes.net/user/${user.uuid})**`;
		var thumbnail = `https://minecraftapi.net/api/v2/profile/${user.uuid}/avatar?size=265&overlay=true`;
		var reply = await utils.embed(user.name, description, randomColor, fields, thumbnail);

		await interaction.reply({ embeds: [reply] });
	},
};