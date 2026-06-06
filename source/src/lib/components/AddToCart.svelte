<script lang="ts">
	import { resolve } from '$app/paths';
	import { goto } from '$app/navigation';
	import { addCartItem } from '$lib/api/cart';
	import { authState, refreshCartCount } from '$lib/auth/session.svelte';
	import type { Product } from '$lib/types';
	import { ApiError } from '$lib/types';

	let { product }: { product: Product } = $props();

	let quantity = $state(1);
	let loading = $state(false);
	let message = $state<string | null>(null);
	let error = $state<string | null>(null);

	const maxQty = $derived(Math.max(product.inventory_quantity, 0));
	const outOfStock = $derived(maxQty <= 0);

	async function handleAddToCart() {
		if (!authState.user) {
			await goto(resolve('/login') + `?redirect=${encodeURIComponent(`/products/${product.id}`)}`);
			return;
		}

		error = null;
		message = null;
		loading = true;

		try {
			await addCartItem(product.id, quantity);
			await refreshCartCount();
			message = 'Added to cart';
		} catch (err) {
			error = err instanceof ApiError ? err.message : 'Could not add to cart.';
		} finally {
			loading = false;
		}
	}
</script>

<div class="add-to-cart">
	{#if !outOfStock}
		<label class="add-to-cart__qty">
			<span>Quantity</span>
			<input type="number" min="1" max={maxQty} bind:value={quantity} disabled={loading} />
		</label>
	{/if}

	<button type="button" class="btn" disabled={outOfStock || loading} onclick={handleAddToCart}>
		{outOfStock ? 'Out of stock' : loading ? 'Adding…' : 'Add to cart'}
	</button>

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
