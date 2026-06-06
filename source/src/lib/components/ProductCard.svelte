<script lang="ts">
	import { resolve } from '$app/paths';
	import type { Product } from '$lib/types';
	import { formatPrice, getPrimaryImage } from '$lib/utils/product';

	let { product }: { product: Product } = $props();

	const imageUrl = $derived(getPrimaryImage(product));
	const price = $derived(formatPrice(product));
	const href = $derived(resolve('/products/[id]', { id: String(product.id) }));
</script>

<a {href} class="product-card">
	<div class="product-card__image">
		{#if imageUrl}
			<img src={imageUrl} alt={product.name} />
		{:else}
			<span>No image</span>
		{/if}
	</div>
	<div class="product-card__body">
		<h2 class="product-card__name">{product.name}</h2>
		<p class="product-card__price">{price}</p>
	</div>
</a>
