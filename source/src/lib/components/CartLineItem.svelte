<script lang="ts">
	import { resolve } from '$app/paths';
	import type { CartItemWithPrice, Product } from '$lib/types';
	import { formatCents } from '$lib/utils/money';
	import { getPrimaryImage } from '$lib/utils/product';

	let {
		item,
		product,
		onUpdate,
		onRemove,
		updating = false
	}: {
		item: CartItemWithPrice;
		product?: Product | null;
		onUpdate: (quantity: number) => void | Promise<void>;
		onRemove: () => void | Promise<void>;
		updating?: boolean;
	} = $props();

	const imageUrl = $derived(product ? getPrimaryImage(product) : null);
	const name = $derived(product?.name ?? `Product #${item.product_id}`);
</script>

<div class="cart-line">
	<a href={resolve('/products/[id]', { id: String(item.product_id) })} class="cart-line__image">
		{#if imageUrl}
			<img src={imageUrl} alt={name} />
		{:else}
			<span>No image</span>
		{/if}
	</a>

	<div class="cart-line__info">
		<a href={resolve('/products/[id]', { id: String(item.product_id) })} class="cart-line__name">
			{name}
		</a>
		<p class="cart-line__unit">{formatCents(item.unit_price_cents)} each</p>

		<div class="cart-line__controls">
			<label class="cart-line__qty">
				<span class="visually-hidden">Quantity</span>
				<input
					type="number"
					min="1"
					value={item.quantity}
					disabled={updating}
					onchange={(e) => onUpdate(Number(e.currentTarget.value))}
				/>
			</label>
			<button type="button" class="cart-line__remove" disabled={updating} onclick={onRemove}>
				Remove
			</button>
		</div>
	</div>

	<p class="cart-line__total">{formatCents(item.line_total_cents)}</p>
</div>

<style>
	.cart-line {
		display: grid;
		grid-template-columns: 80px 1fr auto;
		gap: 1rem;
		padding: 1rem 0;
		border-bottom: 1px solid var(--clr-border);
		align-items: start;
	}

	.cart-line__image {
		aspect-ratio: 1;
		background: oklch(0.96 0.002 264);
		border-radius: var(--radius);
		overflow: hidden;
		display: flex;
		align-items: center;
		justify-content: center;
		color: var(--clr-muted);
		font-size: 0.75rem;
		text-decoration: none;
	}

	.cart-line__image img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.cart-line__name {
		font-weight: 600;
		text-decoration: none;
		color: var(--clr-text);
	}

	.cart-line__name:hover {
		color: var(--color-primary);
	}

	.cart-line__unit {
		margin: 0.25rem 0 0.75rem;
		font-size: 0.875rem;
		color: var(--clr-muted);
	}

	.cart-line__controls {
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}

	.cart-line__qty input {
		width: 4rem;
		padding: 0.375rem 0.5rem;
		border: 1px solid var(--clr-border);
		border-radius: var(--radius);
		font: inherit;
	}

	.cart-line__remove {
		background: none;
		border: none;
		color: var(--clr-muted);
		font: inherit;
		cursor: pointer;
		text-decoration: underline;
		padding: 0;
	}

	.cart-line__remove:hover:not(:disabled) {
		color: var(--color-primary);
	}

	.cart-line__remove:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.cart-line__total {
		margin: 0;
		font-weight: 700;
		white-space: nowrap;
	}

	.visually-hidden {
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip: rect(0, 0, 0, 0);
		white-space: nowrap;
		border: 0;
	}
</style>
