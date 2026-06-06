<script lang="ts">
	import { resolve } from '$app/paths';
	import { invalidateAll } from '$app/navigation';
	import EmptyState from '$lib/components/EmptyState.svelte';
	import ErrorState from '$lib/components/ErrorState.svelte';
	import OrderStatusBadge from '$lib/components/OrderStatusBadge.svelte';
	import Pagination from '$lib/components/Pagination.svelte';
	import { formatCents } from '$lib/utils/money';

	let { data } = $props();
</script>

<svelte:head>
	<title>Orders | {data.config.site.store_name}</title>
</svelte:head>

{#if data.error}
	<ErrorState message={data.error} onRetry={() => invalidateAll()} />
{:else if data.orders.items.length === 0}
	<EmptyState message="No orders yet. Your order history will appear here." />
	<p><a href={resolve('/products')} class="btn">Browse products</a></p>
{:else}
	<div class="orders-page">
		<div class="page-header">
			<h1>Your orders</h1>
		</div>

		<ul class="orders-list">
			{#each data.orders.items as order (order.id)}
				<li class="orders-list__item">
					<div>
						<a href={resolve('/orders/[id]', { id: String(order.id) })} class="orders-list__id">
							Order #{order.id}
						</a>
						<p class="orders-list__date">
							{new Date(order.created_at).toLocaleDateString()}
						</p>
					</div>
					<div class="orders-list__meta">
						<OrderStatusBadge status={order.status} />
						<span class="orders-list__total">
							{formatCents(order.total_cents + order.tax_cents + order.shipping_cents)}
						</span>
					</div>
				</li>
			{/each}
		</ul>

		{#if data.orders.pages && data.orders.pages > 1}
			<Pagination
				currentPage={data.orders.page ?? 1}
				totalPages={data.orders.pages}
			/>
		{/if}
	</div>
{/if}

<style>
	.orders-list {
		list-style: none;
		margin: 0;
		padding: 0;
	}

	.orders-list__item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 1rem;
		padding: 1rem 0;
		border-bottom: 1px solid var(--clr-border);
	}

	.orders-list__id {
		font-weight: 600;
		text-decoration: none;
		color: var(--clr-text);
	}

	.orders-list__id:hover {
		color: var(--color-primary);
	}

	.orders-list__date {
		margin: 0.25rem 0 0;
		font-size: 0.875rem;
		color: var(--clr-muted);
	}

	.orders-list__meta {
		display: flex;
		flex-direction: column;
		align-items: flex-end;
		gap: 0.5rem;
	}

	.orders-list__total {
		font-weight: 600;
	}
</style>
