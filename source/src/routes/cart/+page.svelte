<script lang="ts">
	import { resolve } from '$app/paths';
	import { invalidateAll } from '$app/navigation';
	import CartLineItem from '$lib/components/CartLineItem.svelte';
	import EmptyState from '$lib/components/EmptyState.svelte';
	import ErrorState from '$lib/components/ErrorState.svelte';
	import { removeCartItem, updateCartItem } from '$lib/api/cart';
	import { refreshCartCount } from '$lib/auth/session.svelte';
	import { formatCents } from '$lib/utils/money';
	import { ApiError } from '$lib/types';

	let { data } = $props();

	let updatingId = $state<number | null>(null);
	let actionError = $state<string | null>(null);

	async function handleUpdate(itemId: number, quantity: number) {
		if (quantity < 1) return;
		updatingId = itemId;
		actionError = null;

		try {
			await updateCartItem(itemId, quantity);
			await refreshCartCount();
			await invalidateAll();
		} catch (err) {
			actionError = err instanceof ApiError ? err.message : 'Could not update item.';
		} finally {
			updatingId = null;
		}
	}

	async function handleRemove(itemId: number) {
		updatingId = itemId;
		actionError = null;

		try {
			await removeCartItem(itemId);
			await refreshCartCount();
			await invalidateAll();
		} catch (err) {
			actionError = err instanceof ApiError ? err.message : 'Could not remove item.';
		} finally {
			updatingId = null;
		}
	}
</script>

<svelte:head>
	<title>Cart | {data.config.site.store_name}</title>
</svelte:head>

{#if data.error}
	<ErrorState message={data.error} onRetry={() => invalidateAll()} />
{:else if data.cart && data.lines.length === 0}
	<EmptyState message="Your cart is empty. Browse products and add items to your cart." />
	<p><a href={resolve('/products')} class="btn">Browse products</a></p>
{:else if data.cart}
	<div class="cart-page">
		<div class="page-header">
			<h1>Your cart</h1>
		</div>

		{#if actionError}
			<div class="cart-page__error" role="alert">{actionError}</div>
		{/if}

		<div class="cart-page__lines">
			{#each data.lines as line (line.item.id)}
				<CartLineItem
					item={line.item}
					product={line.product}
					updating={updatingId === line.item.id}
					onUpdate={(qty) => handleUpdate(line.item.id, qty)}
					onRemove={() => handleRemove(line.item.id)}
				/>
			{/each}
		</div>

		<div class="cart-page__summary">
			<p class="cart-page__subtotal">
				Subtotal: <strong>{formatCents(data.cart.subtotal_cents)}</strong>
			</p>
			<a href={resolve('/checkout')} class="btn">Proceed to checkout</a>
		</div>
	</div>
{/if}

<style>
	.cart-page__error {
		background: oklch(0.95 0.04 25);
		border: 1px solid oklch(0.85 0.08 25);
		color: oklch(0.35 0.08 25);
		padding: 0.75rem 1rem;
		border-radius: var(--radius);
		margin-bottom: 1rem;
		font-size: 0.875rem;
	}

	.cart-page__summary {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		margin-top: 1.5rem;
		padding-top: 1.5rem;
		border-top: 1px solid var(--clr-border);
	}

	.cart-page__subtotal {
		margin: 0;
		font-size: 1.125rem;
	}
</style>
