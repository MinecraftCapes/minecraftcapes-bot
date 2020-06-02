const Discord = require('discord.js');
const logger = require('winston');
const client = new Discord.Client();
const fetch = require('node-fetch');
// Make sure to use the config.example.json to easily create your config.json
const config = require('./config.json');
const prefix = '!';

logger.remove(logger.transports.Console);
logger.level = 'debug';
logger.add(logger.transports.Console, {
    colorize: true
});

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);

    client.user.setStatus('online')
    setInterval(() => {
        var messages = [
            {
                name: `for cmds. | ${prefix}help`,
                type: "WATCHING",
            },
            {
                name: `little kids type.`,
                type: "Listening",
            },
            {
                name: `cape creators make capes.`,
                type: "Listening"
            }
        ]
        client.user.setPresence({
            game: messages[getRandomArbitrary(0, messages.length - 1)]
        });
    }, 60000);
});

async function uuid(username){
    var response = await fetch('https://api.mojang.com/users/profiles/minecraft/' + username);
    if(response.status === 204){
        return null;
    }
    response = await response.json();
    console.log(response);
    response['long_id'] = response.id.substring(0, 8) + '-' +  response.id.substring(8, 12) + '-' + response.id.substring(12, 16) + '-' + response.id.substring(16, 20)  + '-' + response.id.substring(20);
    return response;
}

var special_ids = {
    supportstaff: 478670065483513860,
    contributor: 479048180202340362,
    capecreator: 628211166321311744
};

function getRandomArbitrary(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

async function embed(title, description, color, fields, thumbnail){

    const response = new Discord.MessageEmbed()
        .setTitle(title)
        .setColor(color)
        .setDescription(description)
        .setThumbnail(thumbnail);
    if(fields){
        response.addFields(fields);
    }
    return response;
}

async function checkUrl(url){
    var response = await fetch(url);

    logger.info("[" + new Date().toLocaleString() + "] Recieved response from " + url);

    if(response.status === 404){
        return false;
    }
    response = await response.text();
    if(typeof response === 'undefined' || response == ''){
        return false;
    }
    return true;
}

// Create an event listener for messages
client.on('message', async (message) => {
    if (!message.content.startsWith('!') || message.author.bot) return;
    if (client.user.id === message.author.id) {return}
    if (message.author.client == true) return;

    var args = message.content.slice(prefix.length).split(' ');
    var command = args.shift().toLowerCase();
    args = args.splice(0,1);
    try {
        if (command == `commands`) {
            var randomColor = Math.floor(Math.random()*16777215).toString(16);
            var sender = message.member.user;

            var DMreply = await embed(`List of commands`, `\`${prefix}help\` - Helps you\n\`${prefix}ping\` - Pings the bot\n\`${prefix}user (mc-username)\` - Gets info about the user`, randomColor)
            sender.createDM().then (dmChannel => {
                dmChannel.send(DMreply)
            }).catch (err => {
                message.channel.send(`I was unable to finish this command, make sure your DMs are open to all server members. \`ERR: 0xCR0003\``)
                return
            });
            var reply = await embed(`:mailbox_with_mail:\`You got mail!\``, `${new Date().getTime() - message.createdTimestamp}ms`, randomColor)
            message.channel.send(reply);
        }

        if (command == 'ping') {
            var randomColor = Math.floor(Math.random()*16777215).toString(16);
            var reply = await embed(`:ping_pong: Pong!`, `${new Date().getTime() - message.createdTimestamp}ms`, randomColor);
            message.channel.send(reply)
        }

        if (command == 'eval') {
            if (message.member.roles.cache.has(special_ids.supportstaff) || message.member.roles.cache.has(special_ids.contributor) || message.member.roles.cache.has(special_ids.capecreator)) {
                var randomColor = Math.floor(Math.random()*16777215).toString(16);
                if (!args[0]) {
                    var reply = await embed(`User error!`, `You didn't enter any code after the command!`, `0xFF0000`)
                    message.channel.send(reply)
                    return;
                }

                try {
                    const code = args.join(" ");
                    let evaled = eval(code);
        
                    if (typeof evaled !== "string") evaled = require("util").inspect(evaled);
                    if (evaled.length > 6000) {
                        var reply = await embed(`Error!`, `The input I got is too big for me to put in Discord, I've sent the input to console instead.`, `0xFF0000`)
                        message.channel.send(reply)
                        logger.info(`Eval input (too big to put in Discord):`)
                        logger.info(`${(evaled)}`)
                        return;
                    }
                    var reply = await embed(`\`\`\`${(evaled)}\`\`\``, `${new Date().getTime() - message.createdTimestamp}ms`, randomColor)
                    message.channel.send(reply)
                } catch (err) {
                    var reply = await embed(`Eval Error`, `\`\`\`${err}\`\`\``, `0xFF0000`)
                    message.channel.send(reply)
                    console.log(`Eval Error from ${message.author.id}: ${err.stack}`)
                }
            } else {
                var reply = await embed(`User error!`, `You don't have permission to use this command!`)
                message.channel.send(reply)
                return;
            }
        }
    
        if (command == 'user') {
            // if (message.member.roles.cache.has(special_ids.supportstaff) || message.member.roles.cache.has(special_ids.contributor) || message.member.roles.cache.has(special_ids.capecreator)) {
                var randomColor = Math.floor(Math.random()*16777215).toString(16);
                var response = await uuid(args[0]);
                var cape_urls = config.cape_urls;
        
                if (!args[0]) {
                    var reply = await embed(`User error!`, `You didn't enter a username after the command!`, `0xFF0000`)
                    message.channel.send(reply)
                    return;
                }
        
                if(response === null) {
                    var reply = await embed("Invalid Username!", "The username is invalid, please make sure you typed it in correctly.", `0xFF0000`);
                    message.channel.send(reply);
                    return;
                }
                
                var msg1 = await embed(`Please wait...`, ``, randomColor);
                message.channel.send(msg1)
        
                var fields = [
                    { name: "UUID:", value: '``' + response.id + '``' }
                ];
        
                for(var cape_url in cape_urls){
                    var cape = cape_urls[cape_url];
                    var url = cape.url;
                    url = url.replace('{$id}', response.id);
                    url = url.replace('{$long_id}', response.long_id);
                    url = url.replace('{$username}', response.name);
                    var url_check = await checkUrl(url);
        
                    if(url_check){
                        logger.info({ name: cape.name, value: url });
                    }
                }
        
                var description = '**[NameMC Link](https://namemc.com/profile/' + response.long_id + ')**';
                var thumbnail = 'https://crafatar.com/avatars/' + response.id + '?overlay=true';
                var color = randomColor
                var reply = await embed(args[0], description, color, fields, thumbnail);
                message.channel.bulkDelete(1);
                message.channel.send(reply);
            }
        // } else {
        //     var reply = await embed(`User error!`, `You don't have permission to use this command!`)
        //     message.channel.send(reply)
        //     return;
        // }
    } catch (err) {
        var reply = embed(`Oops! I just got an error.`, `I guess report it to staff, here's the error I got: \n` + "```" + err + "```", `0xFF9900`)
        message.channel.send({reply});
        logger.error(err.stack);
    }
});

client.login(config.client_id);
