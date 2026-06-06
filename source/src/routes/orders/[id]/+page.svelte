<script lang="ts">
	import { resolve } from '$app/paths';
	import { invalidateAll } from '$app/navigation';
	import ErrorState from '$lib/components/ErrorState.svelte';
	import OrderStatusBadge from '$lib/components/OrderStatusBadge.svelte';
	import OrderSummary from '$lib/components/OrderSummary.svelte';
	import { cancelOrder } from '$lib/api/orders';
	import { ApiError } from '$lib/types';

	let { data } = $props();

	let cancelling = $state(false);
	let cancelError = $state<string | null>(null);

	const canCancel = $derived(data.order?.status === 'pending');

	async function handleCancel() {
		if (!data.order) return;
		cancelling = true;
		cancelError = null;

		try {
			await cancelOrder(data.order.id);
			await invalidateAll();
		} catch (err) {
			cancelError = err instanceof ApiError ? err.message : 'Could not cancel order.';
		} finally {
			cancelling = false;
		}
	}
</script>

<svelte:head>
	{#if data.order}
		<title>Order #{data.order.id} | {data.config.site.store_name}</title>
	{/if}
</svelte:head>

{#if data.error}
	<ErrorState message={data.error} onRetry={() => invalidateAll()} />
{:else if data.order}
	<div class="order-detail">
		<div class="page-header">
			<h1>Order #{data.order.id}</h1>
			<p>Placed on {new Date(data.order.created_at).toLocaleString()}</p>
		</div>

		{#if data.checkoutMock}
			<div class="order-detail__banner">
				Mock checkout complete. Payment confirmation depends on the payment processor webhook;
				your order status may remain pending until then.
			</div>
		{/if}

		<div class="order-detail__status">
			<OrderStatusBadge status={data.order.status} />
		</div>

		<OrderSummary order={data.order} showItems />

		{#if cancelError}
			<div class="order-detail__error" role="alert">{cancelError}</div>
		{/if}

		<div class="order-detail__actions">
			{#if canCancel}
				<button type="button" class="btn btn--secondary" disabled={cancelling} onclick={handleCancel}>
					{cancelling ? 'Cancelling…' : 'Cancel order'}
				</button>
			{/if}
			<a href={resolve('/orders')}>&larr; Back to orders</a>
		</div>
	</div>
{/if}

<style>
	.order-detail__banner {
		background: oklch(0.95 0.03 85);
		border: 1px solid oklch(0.85 0.06 85);
		color: oklch(0.35 0.05 85);
		padding: 0.75rem 1rem;
		border-radius: var(--radius);
		margin-bottom: 1.5rem;
		font-size: 0.875rem;
	}

	.order-detail__status {
		margin-bottom: 1.5rem;
	}

	.order-detail__error {
		background: oklch(0.95 0.04 25);
		border: 1px solid oklch(0.85 0.08 25);
		color: oklch(0.35 0.08 25);
		padding: 0.75rem 1rem;
		border-radius: var(--radius);
		margin: 1rem 0;
		font-size: 0.875rem;
	}

	.order-detail__actions {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 1rem;
		margin-top: 2rem;
	}

	.btn--secondary {
		background: white;
		color: var(--clr-text);
		border: 1px solid var(--clr-border);
	}
</style>
