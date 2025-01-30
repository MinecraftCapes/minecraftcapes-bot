import config from './config.js'
import { roles } from './utils.js'
import axios from 'axios'

async function getNitro(guild) {
    // Cache the members
    await guild.members.fetch()

    // Get all the roles
    const nitroRole = guild.roles.cache.find(
        (role) => role.id === roles.BOOSTER
    )
    return nitroRole.members.map((m) => m.id.toString())
}

async function updateApi(guild) {
    const nitroMembers = await getNitro(guild)

    // Send post request
    axios.post(
        'https://api.minecraftcapes.net/api/premium/boost/discord/verify',
        {
            key: config.api_key,
            discord: nitroMembers,
        },
        {
            headers: {
                'User-Agent': 'minecraftcapes-bot/2023',
            },
        }
    )
}

async function doBoostUpdate(userId, isBoosting = false) {
    // Post params
    const params = new URLSearchParams()
    params.append('key', config.api_key)
    params.append('discord', userId)
    params.append('boosting', +isBoosting)

    // Send post request
    await axios.post(
        'https://api.minecraftcapes.net/api/premium/boost/discord/update',
        {
            key: config.api_key,
            discord: userId,
            boosting: isBoosting,
        },
        {
            headers: {
                'User-Agent': 'minecraftcapes-bot/2023',
            },
        }
    )
}

export default {
    updateApi,
    doBoostUpdate,
}
