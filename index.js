//Require Libs
const Discord = require('discord.js');
const winston = require('winston');
const { combine, timestamp, printf } = winston.format;
const fetch = require('node-fetch');
const { URLSearchParams } = require('url');
const config = require('./config.json');

//Variables
const client = new Discord.Client();
const prefix = '!';

//Logger add
const logger = winston.createLogger({
    level: 'info',
    format: combine(
        timestamp(),
        printf(({ level, message, timestamp }) => {
            return `${timestamp} ${level.toUpperCase()}: ${message}`;
        })
    ),
    colorize: true,
    transports: [
        new winston.transports.Console()
    ]
})

// These IDs have to be set to strings, as discord.js takes strings when it comes to IDs.
// Debug code used - logger.info(`${typeof message.member.roles.cache.keyArray()[0]}`)
var special_ids = {
    supportStaff: "478670065483513860",
    contributor: "479048180202340362",
    capeCreator: "628211166321311744",
};

/**
 * Get user from the API
 * @param {*} value
 */
async function getUser(value) {
    let response = await fetch(`https://api.ashcon.app/mojang/v2/user/${value}`);
    if(response.status == 404) {
        return null;
    }

    response = await response.json();
    response.shortUuid = response.uuid.replace(/-/g, '');
    return response;
}

/**
 * Generate an embed
 * @param {*} title
 * @param {*} description
 * @param {*} color
 * @param {*} fields
 * @param {*} thumbnail
 */
async function embed(title, description, color, fields, thumbnail) {
    const response = new Discord.MessageEmbed()
        .setTitle(title)
        .setColor(color)
        .setDescription(description)
        .setThumbnail(thumbnail);

    if (fields) {
        response.addFields(fields);
    }

    return response;
}

/**
 * Check if the user has a cape or not
 * @param {*} url
 */
async function checkUrl(url) {
    var response = await fetch(url);

    if (response.status === 404) {
        return false;
    }
    response = await response.text();
    if (typeof response === 'undefined' || response == '') {
        return false;
    }
    return true;
}

/**
 * Once the client has logged in
 */
client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
    client.user.setStatus('online')
});

/**
 * Listen for messages
 */
client.on('message', async (message) => {
    //Stop bot or not messages
    if (!message.content.startsWith('!') || message.author.bot) return;
    //Make sure the bot doesn't read itself
    if (client.user.id === message.author.id) return;
    if (message.author.client == true) return;

    //Get the arguments
    var args = message.content.slice(prefix.length).split(' ');
    var command = args.shift().toLowerCase();
    args = args.splice(0, 1);
    try {
        if(command == 'user') {
            logger.info(`Running !user for ${args[0]}`)

            //Random message colour
            var randomColor = Math.floor(Math.random() * 16777215).toString(16);

            //Get the user
            var user = await getUser(args[0]);

            //Get all cape urls
            var cape_urls = config.cape_urls;

            if (!args[0]) {
                let reply = await embed(`User error!`, `You didn't enter a username after the command!`, `0xFF0000`)
                message.channel.send(reply)
                return;
            }

            if (user === null) {
                let reply = await embed("Invalid Username!", "The username is invalid, please make sure you typed it in correctly.", `0xFF0000`);
                message.channel.send(reply);
                return;
            }

            // We make an embed here so people won't think the bot has crashed.
            var waitMessage = await embed(`Please wait...`, ``, randomColor);
            message.channel.send(waitMessage)

            // Add the fileds
            var fields = [{
                name: "UUID:",
                value: '``' + user.shortUuid + '``'
            }];

            // Check MinecraftCapes
            var minecraftcapes = await fetch(`https://minecraftcapes.net/profile/${user.shortUuid}`)
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
                    value: `https://minecraftcapes.net/profile/${user.shortUuid}/cape/map`
                });
            }

            if(minecraftcapes.textures.ears) {
                fields.push({
                    name: "MinecraftCapes Ears",
                    value: `https://minecraftcapes.net/profile/${user.shortUuid}/ears`
                });
            }

            // Check for other cape providers
            for (var cape_url in cape_urls) {
                var cape = cape_urls[cape_url];
                var url = cape.url;
                url = url.replace('{$shortUuid}', user.shortUuid);
                url = url.replace('{$uuid}', user.uuid);
                url = url.replace('{$username}', user.username);
                var url_check = await checkUrl(url);

                if (url_check) {
                    fields.push({
                        name: cape.name,
                        value: url
                    });
                }
            }

            var description = `**[NameMC Link](https://mine.ly/${user.uuid})**\n**[MinecraftCapes Link](https://minecraftcapes.net/user/${user.shortUuid})**`;
            var thumbnail = `https://crafatar.com/avatars/${user.uuid}?overlay=true`;
            var color = randomColor
            var reply = await embed(user.username, description, color, fields, thumbnail);
            message.channel.bulkDelete(1);
            message.channel.send(reply);
        }

        if(command == 'cape') {
            // If the messages is sent by a staff member
            if (message.member.roles.cache.has(special_ids.supportStaff) || message.member.roles.cache.has(special_ids.contributor) || message.member.roles.cache.has(special_ids.capeCreator)) {
                // If there is an attachment and there is more than one attachment
                if (message.attachments && message.attachments.size > 0) {
                    // Then for each attachment uploaded...
                    message.attachments.each(attachment => {
                        // If there's an URL to the image
                        if (attachment.url) {
                            // Lowercase the URL
                            var lowerCaseUrl = attachment.url.toLocaleLowerCase()
                            // If the images is a PNG or GIF
                            if (lowerCaseUrl.endsWith(".png") || lowerCaseUrl.endsWith(".gif")) {
                                // Create embed message with the direct link to the image(s)'s URL.
                                var randomColor = Math.floor(Math.random() * 16777215).toString(16);
                                var embed = new Discord.MessageEmbed()
                                    .setDescription(`A cape has been detected, [here's a direct download to it](${attachment.url})`)
                                    .setColor(randomColor)
                                message.channel.send({
                                    embed
                                });
                            }
                        }
                    });
                } else {
                    var reply = await embed(`User error!`, `You didn't upload an image with the command!`, `0xFF0000`)
                    message.channel.send(reply)
                    return;
                }
            } else {
                message.delete();
            }
        }

        if(command == 'premium') {
            message.delete();
            let code = args[0]

            //Post params
            let params = new URLSearchParams();
            params.append('code', code);

            //Send post request
            let response = await fetch("https://minecraftcapes.net/api/premium/discord/check", {
                method: 'POST',
                body: params,
            });
            response = await response.json()

            if(response.success) {
                client.guilds.cache.get(message.guild.id).members.cache.get(message.author.id).roles.add("785110885847793694");
                message.channel.send(`<@${message.author.id}> Success! You now have the premium role :)`)
            } else {
                console.log(JSON.stringify(response))
                message.channel.send(`<@${message.author.id}> That code doesn't seem correct!`)
            }
        }
    } catch (err) {
        var reply = embed(`Oops! I just got an error.`, `I guess report it to staff, here's the error I got: \n` + "```" + err + "```", `0xFF9900`)
        message.channel.send({
            reply
        });
        logger.error(err.stack);
    }
});

//Login the bot
client.login(config.client_id);