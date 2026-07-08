<script lang="ts">
	import { resolve } from '$app/paths';
	import { onMount } from 'svelte';
	import SeoHead from '$lib/components/SeoHead.svelte';
	import EmptyState from '$lib/components/EmptyState.svelte';
	import {
		cartState,
		getCartLines,
		getCartSubtotalCents,
		initCart,
		removeItem,
		updateItemQuantity
	} from '$lib/cart/cart.svelte';
	import { authState } from '$lib/auth/session.svelte';
	import { getProductById } from '$lib/api/products';
	import type { Product } from '$lib/types';
	import { formatPrice } from '$lib/utils/product';
	import { absoluteUrl } from '$lib/utils/seo';

	let { data } = $props();

	const site = $derived(data.config.site);
	let productsById = $state<Record<number, Product>>({});
	let loadingProducts = $state(false);

	const lines = $derived(getCartLines());
	const subtotalCents = $derived(getCartSubtotalCents());
	const subtotal = $derived(`$${(subtotalCents / 100).toFixed(2)}`);
	const isEmpty = $derived(lines.length === 0);

	async function loadProductDetails() {
		const missingIds = lines
			.filter((line) => !line.product && !productsById[line.productId])
			.map((line) => line.productId);
		if (missingIds.length === 0) return;

		loadingProducts = true;
		try {
			const results = await Promise.all(
				missingIds.map(async (productId) => {
					try {
						return await getProductById(productId);
					} catch {
						return null;
					}
				})
			);
			const next = { ...productsById };
			for (const product of results) {
				if (product) next[product.id] = product;
			}
			productsById = next;
		} finally {
			loadingProducts = false;
		}
	}

	onMount(() => {
		void initCart().then(() => loadProductDetails());
	});

	$effect(() => {
		lines;
		void loadProductDetails();
	});

	function lineProduct(line: (typeof lines)[number]): Product | null {
		return line.product ?? productsById[line.productId] ?? null;
	}

	async function changeQuantity(line: (typeof lines)[number], quantity: number) {
		if (quantity < 1) {
			await removeItem(line.productId, line.itemId);
			return;
		}
		await updateItemQuantity(line.productId, quantity, line.itemId);
	}
</script>

<SeoHead title={`Cart | ${site.store_name}`} canonical={absoluteUrl(site, '/cart')} />

<div class="page-header">
	<h1>Cart</h1>
</div>

{#if cartState.loading && isEmpty}
	<p>Loading cart…</p>
{:else if isEmpty}
	<EmptyState message="Your cart is empty." />
{:else}
	<div class="cart-panel">
		<div class="cart-lines">
			{#each lines as line (line.key)}
				{@const product = lineProduct(line)}
				<article class="cart-line">
					<div class="cart-line__info">
						<h3>{product?.name ?? `Product #${line.productId}`}</h3>
						{#if line.variantTitle}
							<p class="cart-line__variant">{line.variantTitle}</p>
						{/if}
						<p class="cart-line__meta">
							{product ? formatPrice(product) : `$${(line.unitPriceCents / 100).toFixed(2)}`} each
						</p>
					</div>
					<div class="cart-line__actions">
						<label>
							Qty
							<input
								type="number"
								min="1"
								max="999"
								value={line.quantity}
								onchange={(event) =>
									void changeQuantity(
										line,
										Number((event.currentTarget as HTMLInputElement).value)
									)}
							/>
						</label>
						<button
							type="button"
							class="btn btn--secondary"
							onclick={() => void removeItem(line.productId, line.itemId)}
						>
							Remove
						</button>
					</div>
				</article>
			{/each}
		</div>

		<div class="cart-summary">
			<span>Subtotal</span>
			<span>{subtotal}</span>
		</div>

		{#if authState.user}
			<a href={resolve('/checkout')} class="btn btn--primary">Proceed to checkout</a>
		{:else}
			<div class="cart-banner">
				Sign in or create an account to checkout.
				<a href={resolve('/account') + '?returnTo=/checkout'}>Go to account</a>
			</div>
		{/if}

		{#if loadingProducts}
			<p class="cart-line__meta">Updating product details…</p>
		{/if}
	</div>
{/if}
