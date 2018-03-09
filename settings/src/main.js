import Vue from 'vue'
import { sync } from 'vuex-router-sync'
import App from './App.vue'
import router from './router'
import store from './store'

sync(store, router)

// translation bind to window
Vue.prototype.t = t;

const app = new Vue({
	router,
	store,
	render: h => h(App)
}).$mount('#content')

export { app, router, store }
