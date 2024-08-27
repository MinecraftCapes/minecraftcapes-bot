import fetch from 'node-fetch';
import winston from 'winston';

/**
 * Get user from the API
 * @param {*} value
 */
export async function getUser(value) {
	let response = await fetch(`https://minecraftapi.net/api/v2/profile/${value}`);
	if (response.status == 404) {
		return null;
	}

	response = await response.json();
	return response;
}

/**
 * Check if the user has a cape or not
 * @param {*} url
 */
export async function checkUrl(url) {
	let response = await fetch(url);

	if (response.status === 404) {
		return false;
	}
	response = await response.text();
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