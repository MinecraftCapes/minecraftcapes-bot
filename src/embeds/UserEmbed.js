import axios from 'axios'
import config from '../config.js'
import { checkUrl } from '../utils.js'
import { EmbedBuilder } from 'discord.js'

export default {
    async get(user) {
        // Get all cape urls
        const cape_urls = config.cape_urls

        // Add the fileds
        const fields = [
            {
                name: 'UUID:',
                value: `\`${user.uuid}\``,
            },
        ]

        // Check MinecraftCapes
        let minecraftcapes = await axios.get(
            `https://api.minecraftcapes.net/profile/${user.uuid}`,
            {
                headers: {
                    'User-Agent': 'minecraftcapes-bot/2023',
                },
            }
        )
        minecraftcapes = minecraftcapes.data
        if (
            minecraftcapes.animatedCape ||
            minecraftcapes.capeGlint ||
            minecraftcapes.upsideDown
        ) {
            fields.push({
                name: 'Premium',
                value: 'Yes :tada:',
                inline: true,
            })
        }

        if (minecraftcapes.animated_cape_url || minecraftcapes.cape_url) {
            fields.push({
                name: 'MinecraftCapes Cape',
                value:
                    minecraftcapes.animated_cape_url ?? minecraftcapes.cape_url,
            })
        }

        if (minecraftcapes.ear_url) {
            fields.push({
                name: 'MinecraftCapes Ears',
                value: minecraftcapes.ear_url,
            })
        }

        // Check for other cape providers
        for (const cape_url in cape_urls) {
            const cape = cape_urls[cape_url]
            let url = cape.url
            url = url.replace('{$uuid}', user.uuid)
            url = url.replace('{$username}', user.username)
            const url_check = await checkUrl(url)

            if (url_check) {
                fields.push({
                    name: cape.name,
                    value: url,
                })
            }
        }

        const description = `
        **[Profile Link](https://minecraftapi.net/profile/${user.uuid})**\n
        **[MinecraftCapes Link](https://minecraftcapes.net/user/${user.uuid})**\n
        **[MinecraftCapes API Link](https://api.minecraftcapes.net/profile/${user.uuid})**\n
        `
        const thumbnail = `https://api.minecraftapi.net/v3/profile/${user.uuid}/avatar?size=265&overlay=true`
        const reply = new EmbedBuilder()
            .setTitle(user.username)
            .setDescription(description)
            .setColor('Random')
            .setFields(fields)
            .setThumbnail(thumbnail)

        return reply
    },
}
