import fetch from 'node-fetch';
import * as config from '../config.json' assert { type: "json" };

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

export async function doBoostUpdate(userId, isBoosting = false) {
	// Post params
	const params = new URLSearchParams();
	params.append('key', config.default.api_key);
	params.append('discord', userId);
	params.append('boosting', +isBoosting);

	// Send post request
	fetch('https://api.minecraftcapes.net/api/premium/boost/discord/update', {
		method: 'POST',
		body: params,
	});
}