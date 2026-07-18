<script lang="ts">
	import { resolve } from '$app/paths';
	import { goto } from '$app/navigation';
	import SeoHead from '$lib/components/SeoHead.svelte';
	import AddressForm from '$lib/components/AddressForm.svelte';
	import CartLineItem from '$lib/components/CartLineItem.svelte';
	import EmptyState from '$lib/components/EmptyState.svelte';
	import ErrorState from '$lib/components/ErrorState.svelte';
	import { quoteCart } from '$lib/api/cart';
	import { checkoutOrder, createOrder } from '$lib/api/orders';
	import { refreshServerCart } from '$lib/cart/cart.svelte';
	import { formatCents, writePreferredCurrencyCookie } from '$lib/utils/money';
	import { emptyAddress } from '$lib/utils/address';
	import { absoluteUrl } from '$lib/utils/seo';
	import { ApiError } from '$lib/types';
	import type {
		CartItemWithPrice,
		CartQuote,
		CheckoutSession,
		Order,
		ShippingAddress,
		ShippingBreakdownItem
	} from '$lib/types';

	// crypto.randomUUID is secure-context only (HTTPS/localhost); LAN HTTP needs a fallback.
	function newIdempotencyKey(): string {
		if (typeof crypto.randomUUID === 'function') return crypto.randomUUID();
		const b = crypto.getRandomValues(new Uint8Array(16));
		b[6] = (b[6] & 0x0f) | 0x40;
		b[8] = (b[8] & 0x3f) | 0x80;
		const h = Array.from(b, (x) => x.toString(16).padStart(2, '0')).join('');
		return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
	}

	let { data } = $props();

	const site = $derived(data.config.site);
	const lines = $derived(data.lines as CartItemWithPrice[]);
	const subtotalCents = $derived(data.cart?.subtotal_cents ?? 0);

	// One key per checkout attempt so retries never create duplicate orders.
	const idempotencyKey = newIdempotencyKey();

	// Prefill the forms once from the user's saved defaults.
	// svelte-ignore state_referenced_locally
	const initialUser = data.user;
	let shippingAddress = $state<ShippingAddress>({
		...emptyAddress(),
		...(initialUser?.default_shipping_address ?? {})
	});
	let billingAddress = $state<ShippingAddress>({
		...emptyAddress(),
		...(initialUser?.default_billing_address ?? {})
	});
	let billingSameAsShipping = $state(true);
	let notes = $state('');

	let quote = $state<CartQuote | null>(null);
	let quoting = $state(false);
	let shippingSelections = $state<Record<string, string>>({});

	let placing = $state(false);
	let placeError = $state<string | null>(null);
	let createdOrder = $state<Order | null>(null);

	const moneyCurrency = $derived(quote?.currency);
	const totalCents = $derived(
		quote ? quote.subtotal_cents + quote.tax_cents + quote.shipping_cents : subtotalCents
	);

	const shippingGroups = $derived.by(() => {
		const breakdown = (quote?.shipping_breakdown ?? []) as ShippingBreakdownItem[];
		const hasMultiMethod = breakdown.some((row) => (row.options?.length ?? 0) > 1);
		if (breakdown.length === 0) return null;
		if (breakdown.length <= 1 && !hasMultiMethod) return null;

		const byId = new Map(lines.map((item) => [item.id, item]));
		const usedIds: number[] = [];
		const groups: Array<{
			key: string;
			label: string;
			cents: number;
			items: CartItemWithPrice[];
			options: NonNullable<ShippingBreakdownItem['options']>;
			selectedId: string | null;
		}> = [];

		for (const row of breakdown) {
			const items = (row.cart_item_ids ?? [])
				.map((id) => byId.get(id))
				.filter((item): item is CartItemWithPrice => item != null);
			usedIds.push(...items.map((item) => item.id));
			const key = row.fulfillment_key || row.source;
			groups.push({
				key,
				label: row.label || 'Shipping',
				cents: row.cents,
				items,
				options: row.options ?? [],
				selectedId: shippingSelections[key] ?? row.selected_id ?? null
			});
		}

		const orphans = lines.filter((item) => !usedIds.includes(item.id));
		if (orphans.length > 0) {
			groups.push({
				key: '__other__',
				label: 'Other items',
				cents: 0,
				items: orphans,
				options: [],
				selectedId: null
			});
		}

		return groups;
	});

	function addressPayload(address: ShippingAddress): ShippingAddress {
		return {
			full_name: address.full_name?.trim() || null,
			line1: address.line1?.trim() ?? '',
			line2: address.line2?.trim() || null,
			city: address.city?.trim() ?? '',
			state: address.state?.trim() || null,
			postal_code: address.postal_code?.trim() ?? '',
			country: address.country?.trim() ?? ''
		};
	}

	function deliveryLabel(option: {
		min_delivery_days?: number | null;
		max_delivery_days?: number | null;
	}): string | null {
		const min = option.min_delivery_days;
		const max = option.max_delivery_days;
		if (min != null && max != null) return `${min}–${max} days`;
		if (min != null) return `from ${min} days`;
		if (max != null) return `up to ${max} days`;
		return null;
	}

	function selectShippingMethod(fulfillmentKey: string, methodId: string) {
		shippingSelections = { ...shippingSelections, [fulfillmentKey]: methodId };
	}

	// Tax and shipping depend on the destination and selected methods.
	$effect(() => {
		const destination = {
			city: shippingAddress.city,
			state: shippingAddress.state,
			postal_code: shippingAddress.postal_code,
			country: shippingAddress.country
		};
		const selections = { ...shippingSelections };
		if (lines.length === 0 || createdOrder) return;

		const timer = setTimeout(async () => {
			quoting = true;
			try {
				const next = await quoteCart(
					destination,
					Object.keys(selections).length > 0 ? selections : null
				);
				quote = next;
				if (next.preferred_currency) {
					writePreferredCurrencyCookie(next.preferred_currency);
				}
				const seeded = { ...selections };
				let changed = false;
				for (const row of next.shipping_breakdown ?? []) {
					const key = row.fulfillment_key;
					if (!key || seeded[key] || !row.selected_id) continue;
					seeded[key] = row.selected_id;
					changed = true;
				}
				if (changed) shippingSelections = seeded;
			} catch {
				quote = null;
			} finally {
				quoting = false;
			}
		}, 300);

		return () => clearTimeout(timer);
	});

	function redirectToPayment(orderId: number, session: CheckoutSession) {
		const orderPath = resolve('/orders/[id]', { id: String(orderId) });
		if (session.note) {
			// Mock session (payment processor not configured); its URL is not real.
			void goto(`${orderPath}?checkout=mock`);
			return;
		}
		if (session.url) {
			window.location.href = session.url;
			return;
		}
		void goto(orderPath);
	}

	async function placeOrder(event: SubmitEvent) {
		event.preventDefault();
		placeError = null;
		placing = true;

		try {
			let order = createdOrder;
			if (!order) {
				const shipping = addressPayload(shippingAddress);
				const billing = billingSameAsShipping ? shipping : addressPayload(billingAddress);
				order = await createOrder(
					{
						shipping_address: shipping,
						billing_address: billing,
						notes: notes.trim() || null,
						shipping_selections:
							Object.keys(shippingSelections).length > 0 ? shippingSelections : null
					},
					idempotencyKey
				);
				createdOrder = order;
				refreshServerCart().catch(() => {});
			}

			const session = await checkoutOrder(order.id);
			redirectToPayment(order.id, session);
		} catch (err) {
			placeError =
				err instanceof ApiError ? err.message : 'Could not place your order. Please try again.';
			placing = false;
		}
	}
</script>

<SeoHead title={`Checkout | ${site.store_name}`} canonical={absoluteUrl(site, '/checkout')} robots="noindex, nofollow" />

<div class="page-header">
	<h1>Checkout</h1>
	<p>Review your cart and enter your shipping details to place your order.</p>
</div>

{#if data.error}
	<ErrorState message={data.error} />
{:else if lines.length === 0}
	<EmptyState message="Your cart is empty." />
{:else}
	<form class="checkout" onsubmit={placeOrder}>
		<div class="checkout__details">
			<AddressForm bind:address={shippingAddress} title="Shipping address" required />

			<label class="checkout__same">
				<input type="checkbox" bind:checked={billingSameAsShipping} />
				Billing address is the same as shipping
			</label>

			{#if !billingSameAsShipping}
				<AddressForm bind:address={billingAddress} title="Billing address" required />
			{/if}

			<label class="checkout__notes">
				<span>Order notes (optional)</span>
				<textarea bind:value={notes} rows="3" maxlength="10000"></textarea>
			</label>
		</div>

		<aside class="checkout__summary">
			{#if shippingGroups}
				<div class="shipping-groups">
					{#each shippingGroups as group (group.key)}
						<section class="shipping-group">
							<h2 class="shipping-group__title">{group.label}</h2>
							<div class="cart-lines">
								{#each group.items as item (item.id)}
									<CartLineItem {item} />
								{/each}
							</div>
							{#if group.options.length > 1}
								<fieldset class="shipping-methods">
									<legend>Shipping method</legend>
									{#each group.options as option (option.id)}
										<label class="shipping-methods__option">
											<input
												type="radio"
												name={`shipping-${group.key}`}
												value={option.id}
												checked={group.selectedId === option.id}
												onchange={() => selectShippingMethod(group.key, option.id)}
											/>
											<span class="shipping-methods__copy">
												<span class="shipping-methods__name">{option.name}</span>
												{#if deliveryLabel(option)}
													<span class="shipping-methods__eta">{deliveryLabel(option)}</span>
												{/if}
											</span>
											<span class="shipping-methods__price"
												>{formatCents(option.cents, moneyCurrency)}</span
											>
										</label>
									{/each}
								</fieldset>
							{:else}
								<p class="shipping-group__rate">
									<span>Shipping</span>
									<span>{formatCents(group.cents, moneyCurrency)}</span>
								</p>
							{/if}
						</section>
					{/each}
				</div>
			{:else}
				<div class="cart-lines">
					{#each lines as item (item.id)}
						<CartLineItem {item} />
					{/each}
				</div>
			{/if}

			<dl class="checkout__totals">
				<div>
					<dt>Subtotal</dt>
					<dd>{formatCents(quote?.subtotal_cents ?? subtotalCents, moneyCurrency)}</dd>
				</div>
				<div>
					<dt>Tax</dt>
					<dd>{quote ? formatCents(quote.tax_cents, moneyCurrency) : '—'}</dd>
				</div>
				<div>
					<dt>Shipping</dt>
					<dd>{quote ? formatCents(quote.shipping_cents, moneyCurrency) : '—'}</dd>
				</div>
				<div class="checkout__total">
					<dt>Total</dt>
					<dd>{formatCents(totalCents, moneyCurrency)}</dd>
				</div>
			</dl>
			{#if quoting}
				<p class="checkout__quoting">Updating totals…</p>
			{/if}

			{#if placeError}
				<div class="checkout__error" role="alert">
					<p>{placeError}</p>
					{#if createdOrder}
						<p>
							Your order was created.
							<a href={resolve('/orders/[id]', { id: String(createdOrder.id) })}>
								View order #{createdOrder.id}
							</a>
							to retry payment or cancel it.
						</p>
					{/if}
				</div>
			{/if}

			<button type="submit" class="btn btn--primary" disabled={placing}>
				{#if placing}
					Placing order…
				{:else if createdOrder}
					Retry payment
				{:else}
					Place order
				{/if}
			</button>
			<a href={resolve('/cart')} class="btn btn--secondary">Back to cart</a>
		</aside>
	</form>
{/if}

<style>
	.checkout {
		display: grid;
		gap: 2rem;
		align-items: start;
	}

	@media (min-width: 860px) {
		.checkout {
			grid-template-columns: 1fr 380px;
		}
	}

	.checkout__details {
		display: flex;
		flex-direction: column;
		gap: 1.25rem;
	}

	.checkout__same {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.9375rem;
	}

	.checkout__notes span {
		display: block;
		font-size: 0.875rem;
		font-weight: 500;
		margin-bottom: 0.375rem;
	}

	.checkout__notes textarea {
		width: 100%;
		padding: 0.625rem 0.875rem;
		border: 1px solid var(--clr-border);
		border-radius: var(--radius);
		font: inherit;
		box-sizing: border-box;
		resize: vertical;
	}

	.checkout__summary {
		border: 1px solid var(--clr-border);
		border-radius: var(--radius);
		padding: 1rem 1.25rem;
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.shipping-groups {
		display: flex;
		flex-direction: column;
		gap: 1.25rem;
	}

	.shipping-group__title {
		margin: 0 0 0.25rem;
		font-size: 0.9375rem;
		font-weight: 600;
	}

	.shipping-group__rate {
		display: flex;
		justify-content: space-between;
		margin: 0.5rem 0 0;
		font-size: 0.875rem;
		color: var(--clr-muted);
	}

	.shipping-methods {
		margin: 0.75rem 0 0;
		padding: 0;
		border: none;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.shipping-methods legend {
		padding: 0;
		margin-bottom: 0.25rem;
		font-size: 0.875rem;
		font-weight: 600;
	}

	.shipping-methods__option {
		display: grid;
		grid-template-columns: auto 1fr auto;
		gap: 0.5rem;
		align-items: start;
		font-size: 0.875rem;
	}

	.shipping-methods__copy {
		display: flex;
		flex-direction: column;
		gap: 0.125rem;
	}

	.shipping-methods__eta {
		color: var(--clr-muted);
		font-size: 0.8125rem;
	}

	.shipping-methods__price {
		font-weight: 600;
		white-space: nowrap;
	}

	.checkout__totals {
		margin: 0;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.checkout__totals div {
		display: flex;
		justify-content: space-between;
	}

	.checkout__totals dt {
		color: var(--clr-muted);
	}

	.checkout__totals dd {
		margin: 0;
		font-weight: 500;
	}

	.checkout__total {
		border-top: 1px solid var(--clr-border);
		padding-top: 0.5rem;
		font-weight: 700;
	}

	.checkout__total dt {
		color: inherit;
	}

	.checkout__quoting {
		margin: 0;
		font-size: 0.875rem;
		color: var(--clr-muted);
	}

	.checkout__error {
		background: oklch(0.95 0.04 25);
		border: 1px solid oklch(0.85 0.08 25);
		color: oklch(0.35 0.08 25);
		padding: 0.75rem 1rem;
		border-radius: var(--radius);
		font-size: 0.875rem;
	}

	.checkout__error p {
		margin: 0;
	}

	.checkout__error p + p {
		margin-top: 0.5rem;
	}
</style>
