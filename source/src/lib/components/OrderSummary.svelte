<script lang="ts">
	import type { Order } from '$lib/types';
	import { formatCents } from '$lib/utils/money';

	let {
		order,
		showItems = false
	}: {
		order: Order;
		showItems?: boolean;
	} = $props();

	const currency = $derived(order.currency || undefined);
	const total = $derived(
		order.total ?? formatCents(order.total_cents ?? 0, currency)
	);
</script>

<div class="order-summary">
	<p><strong>Order #{order.id}</strong></p>
	<p>Status: {order.status}</p>
	<p>Total: {total}</p>

	{#if showItems && order.items && order.items.length > 0}
		<ul class="order-summary__items">
			{#each order.items as item (item.id)}
				<li>
					{item.product_name} × {item.quantity} — {formatCents(item.total_price_cents, currency)}
				</li>
			{/each}
		</ul>
	{/if}
</div>

<style>
	.order-summary__items {
		margin: 1rem 0 0;
		padding-left: 1.25rem;
	}
</style>
