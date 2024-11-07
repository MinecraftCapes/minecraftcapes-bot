import winston from 'winston';
import axios from 'axios';

/**
 * Get user from the API
 * @param {*} value
 */
export async function getUser(value) {
	var response, username, uuid

		response = await axios({
			url: `https://api.minecraftapi.net/api/v2/profile/${value}`,
			headers: { 'User-Agent': 'minecraftcapes-bot/2023' },
			validateStatus: false,
		});

		if(response.data.success) {
			logger.info(`${value} found from Siriuo API`)
			uuid = response.data.uuid
			username = response.data.name
		}

		if(!response.data.success) {
			response = await axios({
				url: `https://playerdb.co/api/player/minecraft/${value}`,
				headers: { 'User-Agent': 'minecraftcapes-bot/2023' },
				validateStatus: false,
			});


			if(response.data.success) {
				logger.info(`${value} found from PlayerDB API`)
				uuid = response.data.data.player.raw_id
				username = response.data.data.player.username
			}
		}

		if(uuid != null && username != null) {
			return { uuid: uuid, username: username };
		} else {
			return null;
		}
}

/**
 * Check if the user has a cape or not
 * @param {*} url
 */
export async function checkUrl(url) {
	let response = await axios.get(url, {
		headers: {
			'User-Agent': 'minecraftcapes-bot/2023',
		},
	}).catch(error => error);


	if (response.status === 404) {
		return false;
	}
	response = await response.data;
	if (typeof response === 'undefined' || response == '') {
		return false;
	}
	return true;
}

const { combine, timestamp, printf } = winston.format;
export const logger = winston.createLogger({
	level: 'info',
	format: combine(
		timestamp(),
		printf(({ level, message, timestamp: ts }) => {
			return `${ts} ${level.toUpperCase()}: ${message}`;
		}),
	),
	colorize: true,
	transports: [
		new winston.transports.Console(),
		new winston.transports.File({
			filename: 'error.log',
			level: 'error',
		}),
	],
});

// Roles
export const roles = {
	'SUPPORT_STAFF': '478670065483513860',
	'HELPER': '479048180202340362',
	'BOOSTER': '656976584854601772',
	'PREMIUM': '785110885847793694',
	'LINKED': '1122926477588037722',
};

export const channels = {
	'SHOWCASE': '1117404178638196776',
	'BOT_COMMANDS': '760857696567296030',
};