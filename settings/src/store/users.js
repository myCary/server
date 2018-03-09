import api from './api';

const state = {
	users: {},
	loading: false
};

const mutations = {
	setUsers (state, users) {
		state.users = users;
	}
};

const getters = {
	getUsers (state) {
		return state.users;
	}
}

const actions = {
	getUsers (context) {
		return api.get('/settings/users/users?offset=0&limit=50')
			.then((response) => context.commit('setUsers', response.data))
			.catch((error) => context.commit('API_FAILURE', error));
	},
}

export default {state, mutations, getters, actions};
