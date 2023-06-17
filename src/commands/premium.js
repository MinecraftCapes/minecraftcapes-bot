import { SlashCommandBuilder } from 'discord.js'

export default {
	data: new SlashCommandBuilder()
		.setName("premium")
		.setDescription("Give you premium")
		.addStringOption(option => option.setName("code").setDescription("The code from MinecraftCapes.net/premium").setRequired(true))
	, async execute(interaction) {
		const code = interaction.options.getString("code");

        //Post params
        let params = new URLSearchParams();
        params.append('code', code);

        //Send post request
        let response = await fetch("https://api.minecraftcapes.net/api/premium/discord/check", {
            method: 'POST',
            body: params,
        });
        response = await response.json()

        let discordResponse;

        if(response.success) {
            client.guilds.cache.get(message.guild.id).members.cache.get(message.author.id).roles.add("785110885847793694");
            discordResponse = await utils.embed(`<@${message.author.id}> Success!`, `You now have the premium role :)`, `0x00FF00`)
        } else {
            discordResponse = await utils.embed(`<@${message.author.id}> Success!`, `That code doesn't seem correct!`, `0xFF0000`)
        }

		await interaction.reply({ embeds: [discordResponse] });
	},
};