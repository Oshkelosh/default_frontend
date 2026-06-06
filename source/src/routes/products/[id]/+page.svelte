<script lang="ts">
	import { resolve } from '$app/paths';
	import ErrorState from '$lib/components/ErrorState.svelte';
	import AddToCart from '$lib/components/AddToCart.svelte';
	import { formatPrice, getPrimaryImage } from '$lib/utils/product';
	import { invalidateAll } from '$app/navigation';

	let { data } = $props();

	const product = $derived(data.product);
	const imageUrl = $derived(product ? getPrimaryImage(product) : null);
	const price = $derived(product ? formatPrice(product) : '');
</script>

<svelte:head>
	{#if product}
		<title>{product.name} | {data.config.site.store_name}</title>
	{/if}
</svelte:head>

{#if data.error}
	<ErrorState message={data.error} onRetry={() => invalidateAll()} />
{:else if product}
	<div class="product-detail">
		<div class="product-detail__image">
			{#if imageUrl}
				<img src={imageUrl} alt={product.name} />
			{:else}
				<span>No image available</span>
			{/if}
		</div>
		<div>
			<h1>{product.name}</h1>
			<p class="product-detail__price">{price}</p>
			<AddToCart {product} />
			{#if product.description}
				<p class="product-detail__description">{product.description}</p>
			{/if}
			{#if product.category}
				<p>
					Category:
					<a href={resolve('/categories/[slug]', { slug: product.category })}>{product.category}</a>
				</p>
			{/if}
			<p>
				<a href={resolve('/products')}>&larr; Back to products</a>
			</p>
		</div>
	</div>
{/if}
