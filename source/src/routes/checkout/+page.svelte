<script lang="ts">
	import { resolve } from '$app/paths';
	import SeoHead from '$lib/components/SeoHead.svelte';
	import CartLineItem from '$lib/components/CartLineItem.svelte';
	import EmptyState from '$lib/components/EmptyState.svelte';
	import ErrorState from '$lib/components/ErrorState.svelte';
	import { formatCents } from '$lib/utils/money';
	import { absoluteUrl } from '$lib/utils/seo';
	import type { CartLine } from '$lib/types';

	let { data } = $props();

	const site = $derived(data.config.site);
	const lines = $derived(data.lines as CartLine[]);
	const subtotalCents = $derived(data.cart?.subtotal_cents ?? 0);
</script>

<SeoHead title={`Checkout | ${site.store_name}`} canonical={absoluteUrl(site, '/checkout')} />

<div class="page-header">
	<h1>Checkout</h1>
	<p>Review your cart before placing your order.</p>
</div>

{#if data.error}
	<ErrorState message={data.error} />
{:else if lines.length === 0}
	<EmptyState message="Your cart is empty." />
{:else}
	<div class="cart-panel">
		<div class="cart-lines">
			{#each lines as line (line.item.id)}
				<CartLineItem item={line.item} product={line.product} onUpdate={() => {}} onRemove={() => {}} />
			{/each}
		</div>

		<div class="cart-summary">
			<span>Subtotal</span>
			<span>{formatCents(subtotalCents)}</span>
		</div>

		<p>Checkout flow will continue here.</p>
		<a href={resolve('/cart')} class="btn btn--secondary">Back to cart</a>
	</div>
{/if}
