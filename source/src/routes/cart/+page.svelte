<script lang="ts">
	import { resolve } from '$app/paths';
	import { onMount, untrack } from 'svelte';
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
	import { quoteCartItemShipping } from '$lib/api/cart';
	import { diffEstimates } from '$lib/cart/estimates';
	import { getProductById } from '$lib/api/products';
	import type { CartItemShippingEstimate, Product } from '$lib/types';
	import { formatCents } from '$lib/utils/money';
	import { formatPrice, getPrimaryImage } from '$lib/utils/product';
	import { absoluteUrl } from '$lib/utils/seo';

	let { data } = $props();

	const site = $derived(data.config.site);
	let productsById = $state<Record<number, Product>>({});
	let loadingProducts = $state(false);

	type EstimateState =
		| { status: 'loading' }
		| { status: 'ready'; estimate: CartItemShippingEstimate }
		| { status: 'unavailable' };

	let estimatesByItemId = $state<Record<number, EstimateState>>({});

	const lines = $derived(getCartLines());
	const subtotalCents = $derived(getCartSubtotalCents());
	const subtotal = $derived(`$${(subtotalCents / 100).toFixed(2)}`);
	const isEmpty = $derived(lines.length === 0);
	const isSignedIn = $derived(Boolean(authState.user));
	const hasSavedAddress = $derived(Boolean(authState.user?.default_shipping_address));

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

	// Non-reactive bookkeeping: last quantity we fetched an estimate for, and a
	// per-item request sequence so stale responses (superseded or for removed
	// items) are dropped instead of overwriting fresher state.
	let estimatedQuantities: Record<number, number> = {};
	let requestSeq: Record<number, number> = {};

	async function loadEstimate(itemId: number) {
		const seq = (requestSeq[itemId] ?? 0) + 1;
		requestSeq[itemId] = seq;
		let state: EstimateState;
		try {
			state = { status: 'ready', estimate: await quoteCartItemShipping(itemId) };
		} catch {
			state = { status: 'unavailable' };
		}
		if (requestSeq[itemId] !== seq) return;
		estimatesByItemId = { ...estimatesByItemId, [itemId]: state };
	}

	onMount(() => {
		void initCart().then(() => loadProductDetails());
	});

	$effect(() => {
		lines;
		void loadProductDetails();
	});

	$effect(() => {
		const current = lines
			.filter((line): line is (typeof lines)[number] & { itemId: number } =>
				typeof line.itemId === 'number'
			)
			.map((line) => ({ itemId: line.itemId, quantity: line.quantity }));
		const ready = isSignedIn && hasSavedAddress;

		// untrack: this effect writes estimatesByItemId, so it must not depend on it.
		untrack(() => {
			if (!ready || current.length === 0) {
				estimatesByItemId = {};
				estimatedQuantities = {};
				requestSeq = {};
				return;
			}

			const { next, fetchIds, removedIds } = diffEstimates(
				current,
				estimatedQuantities,
				estimatesByItemId,
				{ status: 'loading' } as EstimateState
			);
			for (const id of removedIds) {
				requestSeq[id] = (requestSeq[id] ?? 0) + 1;
			}
			estimatesByItemId = next;
			estimatedQuantities = Object.fromEntries(
				current.map(({ itemId, quantity }) => [itemId, quantity])
			);
			for (const itemId of fetchIds) void loadEstimate(itemId);
		});
	});

	function lineProduct(line: (typeof lines)[number]): Product | null {
		return line.product ?? productsById[line.productId] ?? null;
	}

	function estimateText(itemId: number | undefined): string | null {
		if (itemId == null) return null;
		const state = estimatesByItemId[itemId];
		if (!state) return null;
		if (state.status === 'loading') return 'Estimating shipping…';
		if (state.status === 'unavailable') return 'Estimate unavailable';
		return `Estimated shipping: ${formatCents(state.estimate.shipping_cents, state.estimate.currency)}`;
	}

	async function changeQuantity(line: (typeof lines)[number], quantity: number) {
		if (quantity < 1) {
			await removeItem(line.productId, line.itemId);
			return;
		}
		await updateItemQuantity(line.productId, quantity, line.itemId);
	}
</script>

<SeoHead title={`Cart | ${site.store_name}`} canonical={absoluteUrl(site, '/cart')} robots="noindex, nofollow" />

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
				{@const shippingEstimate = estimateText(line.itemId)}
				{@const imageUrl = product ? getPrimaryImage(product) : null}
				<article class="cart-line cart-line--with-image">
					<div class="cart-line__image">
						{#if imageUrl}
							<img src={imageUrl} alt={product?.name ?? ''} />
						{:else}
							<span>No image</span>
						{/if}
					</div>
					<div class="cart-line__info">
						<h3>{product?.name ?? `Product #${line.productId}`}</h3>
						{#if line.variantTitle}
							<p class="cart-line__variant">{line.variantTitle}</p>
						{/if}
						<p class="cart-line__meta">
							{product ? formatPrice(product) : `$${(line.unitPriceCents / 100).toFixed(2)}`} each
						</p>
						{#if isSignedIn}
							{#if !hasSavedAddress}
								<p class="cart-line__shipping">
									Add a saved shipping address to see estimated shipping.
								</p>
							{:else if shippingEstimate}
								<p class="cart-line__shipping">{shippingEstimate}</p>
							{/if}
						{:else}
							<p class="cart-line__shipping">Sign in to see estimated shipping.</p>
						{/if}
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
				<a href={resolve('/login') + '?redirect=/checkout'}>Sign in</a>
			</div>
		{/if}

		{#if loadingProducts}
			<p class="cart-line__meta">Updating product details…</p>
		{/if}
	</div>
{/if}

<style>
	.cart-line--with-image {
		grid-template-columns: 64px 1fr auto;
	}

	.cart-line__image {
		width: 64px;
		aspect-ratio: 1;
		background: oklch(0.96 0.002 264);
		border-radius: var(--radius);
		overflow: hidden;
		display: flex;
		align-items: center;
		justify-content: center;
		color: var(--clr-muted);
		font-size: 0.6875rem;
		text-align: center;
	}

	.cart-line__image img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.cart-line__shipping {
		margin: 0.35rem 0 0;
		font-size: 0.875rem;
		color: var(--clr-muted);
	}
</style>
