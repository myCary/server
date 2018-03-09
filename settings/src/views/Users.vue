<template>
	<div id="app">
		<appNavigation :menu="menu" />
		<div id="app-content">
			<span :class="{ 'icon-loading': loading }">
				<h1>Users</h1>
				<button @click="addItem">+</button>
				<div>{{users}}</div>
			</span>
		</div>
	</div>
</template>

<script>
import appNavigation from '../components/appNavigation'

export default {
	name: 'Users',
	components: {
		appNavigation
	},
	created: function () {
		this.$store.dispatch('getUsers');
	},
	data: function () {
		return {
			menu: {
				items: [
					{
						text: "Test folder",
						href: "#test",
						loading: false,
						collapsible: true,
						opened: true,
						undo: {
							action: "deleteAccount",
							text: t('settings', 'Deleted Test')
						},
						edit: {
							action: "editAccount",
							text: "Test folder"
						},
						icon: "icon-settings-dark",
						utils: {
							counter: 156,
							actions: [
								{icon: "icon-add", text: "Add to group"},
								{icon: "icon-delete", text: "Delete group"},
								{icon: "icon-edit", text: "Edit group"}
							]
						},
						children: [
							{text: "Test1", href: "#test1"},
							{text: "Test2", href: "#test2"}
						]
					}
				]
			}
		}
	},
	computed: {
		users() {
			return this.$store.getters.getUsers
		},
		loading() {
			return Object.keys(this.users).length === 0;
		}
	},
	methods: {
		addItem: function() {
			this.menu.items[0].loading = !this.menu.items[0].loading;
		}
	},
}
</script>

<style lang="scss">
</style>
