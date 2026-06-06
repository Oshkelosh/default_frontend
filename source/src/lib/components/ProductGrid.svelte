<script lang="ts">
	import type { Product } from '$lib/types';
	import ProductCard from './ProductCard.svelte';

	let {
		products,
		layout = 'grid'
	}: {
		products: Product[];
		layout?: 'grid' | 'list';
	} = $props();
</script>

<div class="product-grid layout-{layout}">
	{#each products as product (product.id)}
		<ProductCard {product} />
	{/each}
</div>
