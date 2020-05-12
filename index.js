const Discord = require('discord.js');
const logger = require('winston');
const client = new Discord.Client();
const fetch = require('node-fetch');
// Make sure to use the config.example.json to easily create your config.json
const config = require('./config.json');

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
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
    ownerID1: 184070212012736512,
    ownerID2: 231385835054956544,
    ownerID3: 88720870993842176
};

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
    const prefix = '!';
    if (!message.content.startsWith('!') || message.author.bot) return;
    if (client.user.id === message.author.id) {return}
    if (message.author.client == true) return;

    var args = message.content.slice(prefix.length).split(' ');
    var command = args.shift().toLowerCase();
    args = args.splice(0,1);
    try {
        if (command == 'ping'){
            var randomColor = Math.floor(Math.random()*16777215).toString(16);
            var reply = await embed(`Ping!`, ``, randomColor);
            message.channel.send(reply)
        }

        if (command == 'eval') {
            if (message.author.id == special_ids.ownerID1 || message.author.id == special_ids.ownerID2 || message.author.id == special_ids.ownerID3) {
                var randomColor = Math.floor(Math.random()*16777215).toString(16);
                if (!args[0]) {
                    var reply = await embed(`User error!`, `You didn't enter any code after the command!`, `0xFF0000`)
                    message.channel.send(reply)
                    return;
                }
                try {
                    const code = args.join(" ");
                    let evaled = eval(code);
        
                    if (typeof evaled !== "string")
                        evaled = require("util").inspect(evaled);
                    var reply = await embed(`Input:`, `\`\`\`${(evaled)}\`\`\``, randomColor)
                    message.channel.send(reply)
                } catch (err) {
                    var reply = await embed(`Eval Error`, `\`\`\`${err}\`\`\``, `0xFF0000`)
                    message.channel.send(reply)
                    console.log(`Eval Error from ${message.author.id}: ${err.stack}`)
                }
            } else {
                return;
            }
        }
    
        if (command == 'user'){
            var randomColor = Math.floor(Math.random()*16777215).toString(16);
            var response = await uuid(args[0]);
            var cape_urls = config.cape_urls;
    
            if (!args[0]) {
                var reply = await embed(`User error!`, `You didn't enter a username after the command!`, `0xFF0000`)
                message.channel.send(reply)
                return;
            }
    
            if(response === null){
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
                    fields.push({ name: cape.name, value: url });
                }
            }
    
            var description = '**[NameMC Link](https://namemc.com/profile/' + response.long_id + ')**';
            var thumbnail = 'https://crafatar.com/avatars/' + response.id + '?overlay=true';
            var color = randomColor
            var reply = await embed(args[0], description, color, fields, thumbnail);
            message.channel.bulkDelete(1);
            message.channel.send(reply);
        }
    } catch (err) {
        var reply = embed(`Oops! I just got a error.`, `I guess report it to staff, here's the error I got: \n` + "```" + err + "```", `0xFF9900`)
        message.channel.send({reply});
        logger.error(err.stack);
    }
});

client.login(config.client_id);