import winston from 'winston'
import axios from 'axios'

/**
 * Get user from the API
 * @param {*} value
 */
export async function getUser(value) {
    const headers = { 'User-Agent': 'minecraftcapes-bot/2023' }
    const apis = [
        {
            url: `https://api.minecraftapi.net/v3/profile/${value}?params=[uuid,name]`,
            process: (data) => {
                return {
                    uuid: data.uuid,
                    username: data.name,
                }
            },
        },
        {
            url: `https://playerdb.co/api/player/minecraft/${value}`,
            process: (data) => {
                return {
                    uuid: data.data.player.raw_id,
                    username: data.data.player.username,
                }
            },
        },
    ]

    for (const api of apis) {
        logger.debug(`[PlayerCache] API Call to ${api.url}`)

        try {
            // Get API data
            const response = await axios({
                url: api.url,
                headers,
                validateStatus: () => true,
                timeout: 2000,
            })

            // Successful response
            if (Math.floor(response.status / 100) == 2 && response.data) {
                const result = api.process(response.data)
                return result
            }

            // Invalid user or not found
            if (response.status == 404) {
                continue
            }

            // Try again, other API due to rate limit
            logger.warn(
                `[PlayerCache] Failed request to ${api.url}: ${response.status} ${response.statusText}`
            )
        } catch (err) {
            logger.warn(
                `[PlayerCache] Failed request to ${api.url}: ${err.message}`
            )
        }
    }

    // None succeeded
    return null
}

/**
 * Check if the user has a cape or not
 * @param {*} url
 */
export async function checkUrl(url) {
    let response = await axios
        .get(url, {
            headers: {
                'User-Agent': 'minecraftcapes-bot/2023',
            },
        })
        .catch((error) => error)

    if (response.status === 404) {
        return false
    }
    response = await response.data
    if (typeof response === 'undefined' || response == '') {
        return false
    }
    return true
}

const { combine, timestamp, printf } = winston.format
export const logger = winston.createLogger({
    level: 'info',
    format: combine(
        timestamp(),
        printf(({ level, message, timestamp: ts }) => {
            return `${ts} ${level.toUpperCase()}: ${message}`
        })
    ),
    colorize: true,
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({
            filename: 'error.log',
            level: 'error',
        }),
    ],
})

// Roles
export const roles = {
    SUPPORT_STAFF: '478670065483513860',
    HELPER: '479048180202340362',
    BOOSTER: '656976584854601772',
    PREMIUM: '785110885847793694',
    LINKED: '1122926477588037722',
}

export const channels = {
    SHOWCASE: '1117404178638196776',
    BOT_COMMANDS: '1511132069793759412',
}

export const categories = {
    SUPPORT: '727179631740059749',
}
