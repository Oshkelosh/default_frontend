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
	import { formatCents } from '$lib/utils/money';
	import { emptyAddress } from '$lib/utils/address';
	import { absoluteUrl } from '$lib/utils/seo';
	import { ApiError } from '$lib/types';
	import type { CartLine, CartQuote, CheckoutSession, Order, ShippingAddress } from '$lib/types';

	let { data } = $props();

	const site = $derived(data.config.site);
	const lines = $derived(data.lines as CartLine[]);
	const subtotalCents = $derived(data.cart?.subtotal_cents ?? 0);

	// One key per checkout attempt so retries never create duplicate orders.
	const idempotencyKey = crypto.randomUUID();

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

	let placing = $state(false);
	let placeError = $state<string | null>(null);
	let createdOrder = $state<Order | null>(null);

	const totalCents = $derived(
		quote ? quote.subtotal_cents + quote.tax_cents + quote.shipping_cents : subtotalCents
	);

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

	// Tax and shipping depend on the destination, so re-quote (debounced)
	// whenever those fields change.
	$effect(() => {
		const destination = {
			city: shippingAddress.city,
			state: shippingAddress.state,
			postal_code: shippingAddress.postal_code,
			country: shippingAddress.country
		};
		if (lines.length === 0 || createdOrder) return;

		const timer = setTimeout(async () => {
			quoting = true;
			try {
				quote = await quoteCart(destination);
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
						notes: notes.trim() || null
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

<SeoHead title={`Checkout | ${site.store_name}`} canonical={absoluteUrl(site, '/checkout')} />

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
			<div class="cart-lines">
				{#each lines as line (line.item.id)}
					<CartLineItem
						item={line.item}
						product={line.product}
						onUpdate={() => {}}
						onRemove={() => {}}
						updating
					/>
				{/each}
			</div>

			<dl class="checkout__totals">
				<div>
					<dt>Subtotal</dt>
					<dd>{formatCents(quote?.subtotal_cents ?? subtotalCents)}</dd>
				</div>
				<div>
					<dt>Tax</dt>
					<dd>{quote ? formatCents(quote.tax_cents) : '—'}</dd>
				</div>
				<div>
					<dt>Shipping</dt>
					<dd>{quote ? formatCents(quote.shipping_cents) : '—'}</dd>
				</div>
				<div class="checkout__total">
					<dt>Total</dt>
					<dd>{formatCents(totalCents)}</dd>
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
