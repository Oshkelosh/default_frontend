<script lang="ts">
	import { resolve } from '$app/paths';
	import SeoHead from '$lib/components/SeoHead.svelte';
	import EmptyState from '$lib/components/EmptyState.svelte';
	import OrderStatusBadge from '$lib/components/OrderStatusBadge.svelte';
	import { absoluteUrl } from '$lib/utils/seo';

	let { data } = $props();

	const site = $derived(data.config.site);
</script>

<SeoHead title={`Orders | ${site.store_name}`} canonical={absoluteUrl(site, '/orders')} robots="noindex, nofollow" />

<div class="page-header">
	<h1>Orders</h1>
</div>

{#if data.error}
	<p class="product-card__error" role="alert">{data.error}</p>
{:else if data.orders.items.length === 0}
	<EmptyState message="You have no orders yet." />
{:else}
	<div class="cart-lines">
		{#each data.orders.items as order (order.id)}
			<article class="cart-line">
				<div class="cart-line__info">
					<h3>
						<a href={resolve('/orders/[id]', { id: String(order.id) })}>Order #{order.id}</a>
					</h3>
					<p class="cart-line__meta">
						<OrderStatusBadge status={order.status} />
						· {new Date(order.created_at).toLocaleString()}
					</p>
				</div>
				<div class="cart-line__actions">
					<strong>
						{order.total ?? `$${(order.total_cents / 100).toFixed(2)}`}
					</strong>
				</div>
			</article>
		{/each}
	</div>
{/if}
