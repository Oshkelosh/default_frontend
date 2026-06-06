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

	const grandTotalCents = $derived(
		order.total_cents + order.tax_cents + order.shipping_cents
	);
</script>

<div class="order-summary">
	{#if showItems && order.items && order.items.length > 0}
		<ul class="order-summary__items">
			{#each order.items as item (item.id)}
				<li>
					<span>{item.product_name} × {item.quantity}</span>
					<span>{formatCents(item.total_price_cents)}</span>
				</li>
			{/each}
		</ul>
	{/if}

	<dl class="order-summary__totals">
		<div>
			<dt>Subtotal</dt>
			<dd>{formatCents(order.total_cents)}</dd>
		</div>
		<div>
			<dt>Tax</dt>
			<dd>{formatCents(order.tax_cents)}</dd>
		</div>
		<div>
			<dt>Shipping</dt>
			<dd>{formatCents(order.shipping_cents)}</dd>
		</div>
		<div class="order-summary__grand">
			<dt>Total</dt>
			<dd>{formatCents(grandTotalCents)}</dd>
		</div>
	</dl>
</div>

<style>
	.order-summary__items {
		list-style: none;
		margin: 0 0 1rem;
		padding: 0;
		border-bottom: 1px solid var(--clr-border);
	}

	.order-summary__items li {
		display: flex;
		justify-content: space-between;
		gap: 1rem;
		padding: 0.5rem 0;
		font-size: 0.9375rem;
	}

	.order-summary__totals {
		display: grid;
		gap: 0.5rem;
		margin: 0;
	}

	.order-summary__totals div {
		display: flex;
		justify-content: space-between;
		gap: 1rem;
	}

	.order-summary__totals dt {
		color: var(--clr-muted);
		font-weight: 400;
	}

	.order-summary__totals dd {
		margin: 0;
		font-weight: 500;
	}

	.order-summary__grand {
		padding-top: 0.5rem;
		margin-top: 0.5rem;
		border-top: 1px solid var(--clr-border);
		font-size: 1.125rem;
	}

	.order-summary__grand dt,
	.order-summary__grand dd {
		font-weight: 700;
		color: var(--clr-text);
	}
</style>
