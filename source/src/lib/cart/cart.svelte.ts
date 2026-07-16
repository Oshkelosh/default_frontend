import { goto } from '$app/navigation';
import { resolve } from '$app/paths';
import { browser } from '$app/environment';
import { isAuthenticated } from '$lib/api/client';
import * as cartApi from '$lib/api/cart';
import type { Cart, CartItemWithPrice, Product, ProductVariant } from '$lib/types';

const GUEST_CART_KEY = 'oshkelosh:guest-cart';

export type GuestCartItem = {
	product_id: number;
	variant_id: number;
	quantity: number;
	product?: Product;
	variant?: ProductVariant;
};

type CartState = {
	mode: 'guest' | 'server';
	guestItems: GuestCartItem[];
	serverCart: Cart | null;
	loading: boolean;
	error: string | null;
};

export const cartState = $state<CartState>({
	mode: 'guest',
	guestItems: [],
	serverCart: null,
	loading: false,
	error: null
});

let initPromise: Promise<void> | null = null;

function readGuestCart(): GuestCartItem[] {
	if (!browser) return [];
	try {
		const raw = localStorage.getItem(GUEST_CART_KEY);
		if (!raw) return [];
		const parsed = JSON.parse(raw) as GuestCartItem[];
		if (!Array.isArray(parsed)) return [];
		return parsed.filter(
			(item) =>
				typeof item.product_id === 'number' &&
				item.product_id > 0 &&
				typeof item.variant_id === 'number' &&
				item.variant_id > 0 &&
				typeof item.quantity === 'number' &&
				item.quantity > 0
		);
	} catch {
		return [];
	}
}

function writeGuestCart(items: GuestCartItem[]): void {
	if (!browser) return;
	localStorage.setItem(GUEST_CART_KEY, JSON.stringify(items));
}

function clearGuestCartStorage(): void {
	if (!browser) return;
	localStorage.removeItem(GUEST_CART_KEY);
}

function sumQuantities(items: Array<{ quantity: number }>): number {
	return items.reduce((total, item) => total + item.quantity, 0);
}

export function getCartItemCount(): number {
	if (cartState.mode === 'server' && cartState.serverCart) {
		return sumQuantities(cartState.serverCart.items);
	}
	return sumQuantities(cartState.guestItems);
}

export function getCartLines(): Array<{
	key: string;
	productId: number;
	variantId: number;
	quantity: number;
	product: Product | null;
	variantTitle: string;
	itemId?: number;
	unitPriceCents: number;
	lineTotalCents: number;
}> {
	if (cartState.mode === 'server' && cartState.serverCart) {
		return cartState.serverCart.items.map((item) => ({
			key: `server-${item.id}`,
			productId: item.product_id,
			variantId: item.variant_id,
			quantity: item.quantity,
			product: null,
			variantTitle: item.variant_title,
			itemId: item.id,
			unitPriceCents: item.unit_price_cents,
			lineTotalCents: item.line_total_cents
		}));
	}

	return cartState.guestItems.map((item) => {
		const unitPriceCents = item.variant?.price_cents ?? item.product?.price_cents ?? 0;
		return {
			key: `guest-${item.variant_id}`,
			productId: item.product_id,
			variantId: item.variant_id,
			quantity: item.quantity,
			product: item.product ?? null,
			variantTitle: item.variant?.title ?? '',
			unitPriceCents,
			lineTotalCents: unitPriceCents * item.quantity
		};
	});
}

export function getCartSubtotalCents(): number {
	return getCartLines().reduce((total, line) => total + line.lineTotalCents, 0);
}

export async function initCart(): Promise<void> {
	if (!browser) return;
	if (initPromise) return initPromise;

	initPromise = (async () => {
		cartState.loading = true;
		cartState.error = null;
		try {
			if (isAuthenticated()) {
				cartState.mode = 'server';
				cartState.serverCart = await cartApi.getCart();
				cartState.guestItems = [];
			} else {
				cartState.mode = 'guest';
				cartState.serverCart = null;
				cartState.guestItems = readGuestCart();
			}
		} catch (err) {
			cartState.error = err instanceof Error ? err.message : 'Failed to load cart';
			cartState.mode = 'guest';
			cartState.serverCart = null;
			cartState.guestItems = readGuestCart();
		} finally {
			cartState.loading = false;
		}
	})();

	return initPromise;
}

function upsertGuestItem(product: Product, variant: ProductVariant, quantity: number): void {
	const existing = cartState.guestItems.find((item) => item.variant_id === variant.id);
	if (existing) {
		existing.quantity += quantity;
		existing.product = product;
		existing.variant = variant;
	} else {
		cartState.guestItems.push({
			product_id: product.id,
			variant_id: variant.id,
			quantity,
			product,
			variant
		});
	}
	writeGuestCart(cartState.guestItems);
}

export async function addItem(product: Product, variant: ProductVariant, quantity = 1): Promise<void> {
	cartState.error = null;
	if (cartState.mode === 'server' || isAuthenticated()) {
		cartState.mode = 'server';
		await cartApi.addCartItem(product.id, variant.id, quantity);
		cartState.serverCart = await cartApi.getCart();
		return;
	}

	upsertGuestItem(product, variant, quantity);
}

export async function updateItemQuantity(
	productId: number,
	quantity: number,
	itemId?: number
): Promise<void> {
	cartState.error = null;
	if (cartState.mode === 'server' && itemId != null) {
		await cartApi.updateCartItem(itemId, quantity);
		cartState.serverCart = await cartApi.getCart();
		return;
	}

	const item = cartState.guestItems.find((entry) => entry.product_id === productId);
	if (!item) return;
	item.quantity = quantity;
	writeGuestCart(cartState.guestItems);
}

export async function removeItem(productId: number, itemId?: number): Promise<void> {
	cartState.error = null;
	if (cartState.mode === 'server' && itemId != null) {
		await cartApi.removeCartItem(itemId);
		cartState.serverCart = await cartApi.getCart();
		return;
	}

	cartState.guestItems = cartState.guestItems.filter((item) => item.product_id !== productId);
	writeGuestCart(cartState.guestItems);
}

export async function mergeGuestCartIntoServer(): Promise<void> {
	const guestItems = readGuestCart();
	if (guestItems.length === 0) {
		cartState.mode = 'server';
		cartState.serverCart = await cartApi.getCart();
		cartState.guestItems = [];
		return;
	}

	for (const item of guestItems) {
		await cartApi.addCartItem(item.product_id, item.variant_id, item.quantity);
	}

	clearGuestCartStorage();
	cartState.guestItems = [];
	cartState.mode = 'server';
	cartState.serverCart = await cartApi.getCart();
}

export async function refreshServerCart(): Promise<void> {
	if (cartState.mode !== 'server') return;
	cartState.serverCart = await cartApi.getCart();
}

export function resetCart(): void {
	cartState.mode = 'guest';
	cartState.serverCart = null;
	cartState.guestItems = readGuestCart();
	cartState.error = null;
}

export async function buyNow(product: Product, variant: ProductVariant, quantity = 1): Promise<void> {
	await addItem(product, variant, quantity);
	await goto(resolve('/checkout'));
}

export function enrichServerCartItems(_items: CartItemWithPrice[], _products: Product[]): void {
	// Reserved for future server-cart product enrichment.
}
