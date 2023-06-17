const fetch = import('node-fetch');
const { MessageEmbed } = require('discord.js');

/**
 * Get user from the API
 * @param {*} value
 */
exports.getUser = async function(value) {
    let response = await fetch(`https://minecraftapi.net/api/v2/profile/${value}`);
    if(response.status == 404) {
        return null;
    }

    response = await response.json();
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
exports.embed = async function(title, description, color, fields, thumbnail) {
    const response = new MessageEmbed()
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
exports.checkUrl = async function(url) {
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