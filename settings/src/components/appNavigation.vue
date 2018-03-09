<template>
	<div id="app-navigation">
		<ul :id="menu.id">
			<navigation-item v-for="(item, key) in menu.items" :item="item" :key="key" />
		</ul>
	</div>
</template>

<script>
import navigationItem from './appNavigation/navigationItem'

export default {
	name: 'appNavigation',
	props: ['menu'],
	components: {
		navigationItem
	}
}
</script>
