import axios from 'axios';

const requestToken = document.getElementsByTagName('head')[0].getAttribute('data-requesttoken');
const tokenHeaders = {headers: { requesttoken: requestToken }};

export default {
	get(url, data) {
		return axios.get(url, tokenHeaders)
			.then((response) => Promise.resolve(response))
			.catch((error) => Promise.reject(error));
	},
	post(url, data) {
		return axios.post(url, data, tokenHeaders)
			.then((response) => Promise.resolve(response))
			.catch((error) => Promise.reject(error));
	},
	patch(url, data) {
		return axios.patch(url, {data: data, headers: tokenHeaders.headers})
			.then((response) => Promise.resolve(response))
			.catch((error) => Promise.reject(error));
	},
	delete(url) {
		return axios.delete(url, tokenHeaders)
			.then((response) => Promise.resolve(response))
			.catch((error) => Promise.reject(error));
	}
}
