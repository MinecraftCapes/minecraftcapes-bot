import config from './config.js';
import { roles } from './utils.js';

async function getNitro(guild) {
	// Cache the members
	await guild.members.fetch();

	// Get all the roles
	const nitroRole = guild.roles.cache.find(role => role.id === roles.BOOSTER);
	return nitroRole.members.map(m => m.id);
}

async function updateApi(guild) {
	const nitroMembers = await getNitro(guild);

	// Post params
	const params = new URLSearchParams();
	params.append('key', config.api_key);
	params.append('discord', nitroMembers);

	// Send post request
	fetch('https://api.minecraftcapes.net/api/premium/boost/discord/verify', {
		method: 'POST',
		body: params,
	});
}

async function doBoostUpdate(userId, isBoosting = false) {
	// Post params
	const params = new URLSearchParams();
	params.append('key', config.api_key);
	params.append('discord', userId);
	params.append('boosting', +isBoosting);

	// Send post request
	fetch('https://api.minecraftcapes.net/api/premium/boost/discord/update', {
		method: 'POST',
		body: params,
	});
}

export default {
	updateApi,
	doBoostUpdate,
};