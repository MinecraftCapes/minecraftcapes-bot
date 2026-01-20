import config from './config.js'
import { logger, roles } from './utils.js'
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
    logger.info('Sending bulk Nitro update to MinecraftCapes')
    const nitroMembers = await getNitro(guild)

    // Send post request
    try {
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
    } catch (error) {
        logger.error(
            `Failed to send all Nitro members to MinecraftCapes: ${error.message}`
        )
    }
    logger.info('Bulk Nitro update complete!')
}

async function doBoostUpdate(userId, isBoosting = false) {
    // Post params
    const params = new URLSearchParams()
    params.append('key', config.api_key)
    params.append('discord', userId)
    params.append('boosting', +isBoosting)

    // Send post request
    try {
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
    } catch (error) {
        logger.error(
            `Failed to update Nitro for a member ${userId}: ${error.message}`
        )
    }
}

export default {
    updateApi,
    doBoostUpdate,
}
