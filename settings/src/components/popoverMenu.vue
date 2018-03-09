<template>
	<ul>
		<li v-for="(item, key) in menu" :key="key">
			<a v-if="item.href" :href="(item.href) ? item.href : '#' ">
				<span :class="item.icon"></span>
				<span>{{item.text}}</span>
			</a>
			<button v-else class="menuitem">
				<span :class="item.icon"></span>
				<span>{{item.text}}</span>
			</button>
		</li>
	</ul>
</template>


<script>
export default {
	name: 'popoverMenu',
	props: ['menu']
}
</script>
