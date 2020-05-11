const Discord = require('discord.js');
const client = new Discord.Client();
const fetch = require('node-fetch');
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

    var args = message.content.slice(prefix.length).split(' ');
    var command = args.shift().toLowerCase();
    args = args.splice(0,1);
    if(command == 'ping'){
        message.channel.send('STOP PINGING ME!!!');
    }

    if(command == 'user'){
        var response = await uuid(args[0]);
        var cape_urls = config.cape_urls;

        if(response === null){

            var reply = await embed("Invalid Username", "The username is invalid", '#ff2121');
            message.channel.send(reply);
            return;
        }
        var fields = [
            { name: "UUID", value: '``' + response.id + '``' }
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

        var description = '**[NameMC](https://namemc.com/profile/' + response.long_id + ')**';
        var thumbnail = 'https://crafatar.com/avatars/' + response.id + '?overlay=true';
        var color = '#21ff33'
        var reply = await embed(args[0], description, color, fields, thumbnail);
        message.channel.send(reply);
    }
});

client.login(config.client_id);
