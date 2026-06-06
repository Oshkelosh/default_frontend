<script lang="ts">
	import { resolve } from '$app/paths';
	import { goto } from '$app/navigation';
	import ErrorState from '$lib/components/ErrorState.svelte';
	import OrderSummary from '$lib/components/OrderSummary.svelte';
	import { createOrder, checkoutOrder } from '$lib/api/orders';
	import { refreshCartCount } from '$lib/auth/session.svelte';
	import type { Order } from '$lib/types';
	import { ApiError } from '$lib/types';

	let { data } = $props();

	let loading = $state(false);
	let error = $state<string | null>(null);

	function isMockCheckoutUrl(url: string, session: { note?: string }): boolean {
		return url.includes('/mock/') || !!session.note;
	}

	async function handleCheckout() {
		if (!data.cart) return;

		loading = true;
		error = null;

		try {
			const order: Order = await createOrder();
			await refreshCartCount();

			const session = await checkoutOrder(order.id);

			if (session.url && !isMockCheckoutUrl(session.url, session)) {
				window.location.href = session.url;
				return;
			}

			await goto(resolve('/orders/[id]', { id: String(order.id) }) + '?checkout=mock');
		} catch (err) {
			error = err instanceof ApiError ? err.message : 'Checkout failed. Please try again.';
		} finally {
			loading = false;
		}
	}
</script>

<svelte:head>
	<title>Checkout | {data.config.site.store_name}</title>
</svelte:head>

{#if data.error}
	<ErrorState message={data.error} />
	<p><a href={resolve('/cart')}>&larr; Back to cart</a></p>
{:else if data.cart}
	<div class="checkout-page">
		<div class="page-header">
			<h1>Checkout</h1>
			<p>Review your order and proceed to payment.</p>
		</div>

		{#if error}
			<div class="checkout-page__error" role="alert">{error}</div>
		{/if}

		<div class="checkout-page__content">
			<section class="checkout-page__items">
				<h2>Items ({data.lines.length})</h2>
				<ul>
					{#each data.lines as line (line.item.id)}
						<li>
							{line.product?.name ?? `Product #${line.item.product_id}`} × {line.item.quantity}
						</li>
					{/each}
				</ul>
			</section>

			<section class="checkout-page__summary">
				<h2>Order total</h2>
				<OrderSummary
					order={{
						id: 0,
						status: 'pending',
						total_cents: data.cart.subtotal_cents,
						tax_cents: 0,
						shipping_cents: 0,
						currency: 'usd',
						shipping_address: null,
						billing_address: null,
						notes: null,
						session_id: null,
						user_id: null,
						created_at: '',
						updated_at: ''
					}}
				/>
				<p class="checkout-page__note">
					Tax and shipping are calculated when your order is created.
				</p>
				<button type="button" class="btn" disabled={loading} onclick={handleCheckout}>
					{loading ? 'Processing…' : 'Place order & pay'}
				</button>
				<p><a href={resolve('/cart')}>&larr; Back to cart</a></p>
			</section>
		</div>
	</div>
{/if}

<style>
	.checkout-page__error {
		background: oklch(0.95 0.04 25);
		border: 1px solid oklch(0.85 0.08 25);
		color: oklch(0.35 0.08 25);
		padding: 0.75rem 1rem;
		border-radius: var(--radius);
		margin-bottom: 1rem;
		font-size: 0.875rem;
	}

	.checkout-page__content {
		display: grid;
		gap: 2rem;
	}

	@media (min-width: 768px) {
		.checkout-page__content {
			grid-template-columns: 1fr 1fr;
		}
	}

	.checkout-page__items ul {
		margin: 0;
		padding-left: 1.25rem;
	}

	.checkout-page__items li {
		margin-bottom: 0.375rem;
	}

	.checkout-page__summary h2,
	.checkout-page__items h2 {
		margin: 0 0 1rem;
		font-size: 1.125rem;
	}

	.checkout-page__note {
		font-size: 0.875rem;
		color: var(--clr-muted);
		margin: 1rem 0;
	}
</style>
