import api from './api';

const state = {
	serverData: {}
};
const mutations = {
	setServerData(state, data) {
		state.serverData = data;
	}
};
const getters = {}
const actions = {}

export default {state, mutations, getters, actions};
