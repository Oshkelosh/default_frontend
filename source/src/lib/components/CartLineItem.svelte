<script lang="ts">
	import type { CartItemWithPrice } from '$lib/types';
	import { formatCents } from '$lib/utils/money';

	let { item }: { item: CartItemWithPrice } = $props();

	const name = $derived(item.product_name || `Product #${item.product_id}`);
</script>

<div class="cart-line">
	<div class="cart-line__info">
		<p class="cart-line__name">{name}</p>
		<p class="cart-line__meta">
			{formatCents(item.unit_price_cents)} × {item.quantity}
		</p>
	</div>
	<p class="cart-line__total">{formatCents(item.line_total_cents)}</p>
</div>

<style>
	.cart-line {
		display: flex;
		justify-content: space-between;
		gap: 1rem;
		padding: 0.75rem 0;
		border-bottom: 1px solid var(--clr-border);
		align-items: start;
	}

	.cart-line__name {
		margin: 0;
		font-weight: 600;
	}

	.cart-line__meta {
		margin: 0.25rem 0 0;
		font-size: 0.875rem;
		color: var(--clr-muted);
	}

	.cart-line__total {
		margin: 0;
		font-weight: 700;
		white-space: nowrap;
	}
</style>
