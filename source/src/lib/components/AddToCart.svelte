<script lang="ts">
	import { resolve } from '$app/paths';
	import { goto } from '$app/navigation';
	import { addItem } from '$lib/cart/cart.svelte';
	import type { Product, ProductVariant } from '$lib/types';
	import { ApiError } from '$lib/types';
	import { formatCents } from '$lib/utils/money';

	let {
		product,
		variant
	}: {
		product: Product;
		variant: ProductVariant;
	} = $props();

	let quantity = $state(1);
	let loading = $state(false);
	let message = $state<string | null>(null);
	let error = $state<string | null>(null);

	const maxQty = $derived(Math.max(variant.inventory_quantity, 0));
	const outOfStock = $derived(maxQty <= 0);

	async function handleAddToCart() {
		error = null;
		message = null;
		loading = true;

		try {
			await addItem(product, variant, quantity);
			message = 'Added to cart';
		} catch (err) {
			error = err instanceof ApiError ? err.message : 'Could not add to cart.';
		} finally {
			loading = false;
		}
	}

	async function handleBuyNow() {
		error = null;
		loading = true;
		try {
			await addItem(product, variant, quantity);
			await goto(resolve('/checkout'));
		} catch (err) {
			error = err instanceof ApiError ? err.message : 'Could not start checkout.';
			loading = false;
		}
	}
</script>

<div class="add-to-cart">
	<p class="add-to-cart__price">{formatCents(variant.price_cents)}</p>

	{#if !outOfStock}
		<label class="add-to-cart__qty">
			<span>Quantity</span>
			<input type="number" min="1" max={maxQty} bind:value={quantity} disabled={loading} />
		</label>
	{/if}

	<div class="add-to-cart__actions">
		<button type="button" class="btn btn--secondary" disabled={outOfStock || loading} onclick={handleAddToCart}>
			{outOfStock ? 'Out of stock' : loading ? 'Adding…' : 'Add to cart'}
		</button>
		<button type="button" class="btn btn--primary" disabled={outOfStock || loading} onclick={handleBuyNow}>
			Buy now
		</button>
	</div>

	{#if message}
		<p class="add-to-cart__success">{message}</p>
	{/if}
	{#if error}
		<p class="add-to-cart__error" role="alert">{error}</p>
	{/if}
</div>

<style>
	.add-to-cart {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		margin-top: 1.5rem;
	}

	.add-to-cart__price {
		margin: 0;
		font-size: 1.5rem;
		font-weight: 700;
		color: var(--color-primary);
	}

	.add-to-cart__qty {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		font-size: 0.875rem;
	}

	.add-to-cart__qty input {
		width: 4rem;
		padding: 0.375rem 0.5rem;
		border: 1px solid var(--clr-border);
		border-radius: var(--radius);
		font: inherit;
	}

	.add-to-cart__actions {
		display: flex;
		flex-wrap: wrap;
		gap: 0.75rem;
	}

	.add-to-cart__success {
		margin: 0;
		color: oklch(0.4 0.1 145);
		font-size: 0.875rem;
	}

	.add-to-cart__error {
		margin: 0;
		color: oklch(0.4 0.12 25);
		font-size: 0.875rem;
	}
</style>
