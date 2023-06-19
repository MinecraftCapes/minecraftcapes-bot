import fetch from 'node-fetch';
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