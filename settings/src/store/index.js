import Vue from 'vue'
import Vuex from 'vuex'
import users from './users'
import settings from './settings'

Vue.use(Vuex)

const debug = process.env.NODE_ENV !== 'production'

export default new Vuex.Store({
	modules: {
		users,
		settings
	},
	strict: debug
})
