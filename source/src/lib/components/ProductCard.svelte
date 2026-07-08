<script lang="ts">
	import { resolve } from '$app/paths';
	import { addItem, buyNow } from '$lib/cart/cart.svelte';
	import { getProductBySlug } from '$lib/api/products';
	import type { Product } from '$lib/types';
	import { formatPrice, getPrimaryImage, isPurchasable, productSlug } from '$lib/utils/product';

	let {
		product,
		imageLoading = 'lazy',
		variant = 'default'
	}: {
		product: Product;
		imageLoading?: 'lazy' | 'eager';
		variant?: 'default' | 'grid';
	} = $props();

	let busy = $state<'add' | 'buy' | null>(null);
	let feedback = $state<string | null>(null);
	let actionError = $state<string | null>(null);

	const imageUrl = $derived(getPrimaryImage(product));
	const price = $derived(formatPrice(product));
	const href = $derived(resolve('/products/[slug]', { slug: productSlug(product) }));
	const purchasable = $derived(isPurchasable(product));

	async function handleAddToCart(event: MouseEvent) {
		event.preventDefault();
		event.stopPropagation();
		if (!purchasable || busy) return;

		busy = 'add';
		actionError = null;
		feedback = null;
		try {
			const detail = await getProductBySlug(productSlug(product));
			const variant = detail.variants?.[0];
			if (!variant) {
				throw new Error('This product is not available for purchase.');
			}
			await addItem(detail, variant);
			feedback = 'Added';
			window.setTimeout(() => {
				feedback = null;
			}, 1500);
		} catch (err) {
			actionError = err instanceof Error ? err.message : 'Could not add to cart';
		} finally {
			busy = null;
		}
	}

	async function handleBuyNow(event: MouseEvent) {
		event.preventDefault();
		event.stopPropagation();
		if (!purchasable || busy) return;

		busy = 'buy';
		actionError = null;
		try {
			const detail = await getProductBySlug(productSlug(product));
			const variant = detail.variants?.[0];
			if (!variant) {
				throw new Error('This product is not available for purchase.');
			}
			await buyNow(detail, variant);
		} catch (err) {
			actionError = err instanceof Error ? err.message : 'Could not start checkout';
			busy = null;
		}
	}
</script>

<article class="product-card" class:product-card--grid={variant === 'grid'}>
	<a {href} class="product-card__link">
		<div class="product-card__image">
			{#if imageUrl}
				<img src={imageUrl} alt={product.name} loading={imageLoading} class="product-card__img" />
			{:else}
				<span>No image</span>
			{/if}
		</div>
		<div class="product-card__body">
			<h2 class="product-card__name">{product.name}</h2>
			<p class="product-card__price">{price}</p>
		</div>
	</a>

	<div class="product-card__actions">
		<button
			type="button"
			class="btn btn--secondary product-card__btn"
			disabled={!purchasable || busy !== null}
			onclick={handleAddToCart}
		>
			{#if busy === 'add'}
				Adding…
			{:else if feedback}
				{feedback}
			{:else}
				Add to cart
			{/if}
		</button>
		<button
			type="button"
			class="btn btn--primary product-card__btn"
			disabled={!purchasable || busy !== null}
			onclick={handleBuyNow}
		>
			{busy === 'buy' ? 'Starting…' : 'Buy now'}
		</button>
	</div>

	{#if actionError}
		<p class="product-card__error" role="alert">{actionError}</p>
	{/if}
</article>
