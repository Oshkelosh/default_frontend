import { authFetch } from './client';
import type { Cart, CartItemWithPrice } from '$lib/types';

export async function getCart(): Promise<Cart> {
	const data = await authFetch<Record<string, unknown>>('/api/v1/cart');
	return normalizeCart(data);
}

export async function addCartItem(
	productId: number,
	quantity = 1
): Promise<CartItemWithPrice> {
	return authFetch<CartItemWithPrice>('/api/v1/cart/items', {
		method: 'POST',
		body: JSON.stringify({ product_id: productId, quantity })
	});
}

export async function updateCartItem(itemId: number, quantity: number): Promise<CartItemWithPrice> {
	return authFetch<CartItemWithPrice>(`/api/v1/cart/items/${itemId}`, {
		method: 'PATCH',
		body: JSON.stringify({ quantity })
	});
}

export async function removeCartItem(itemId: number): Promise<void> {
	await authFetch(`/api/v1/cart/items/${itemId}`, { method: 'DELETE' });
}

export async function clearCart(): Promise<void> {
	await authFetch('/api/v1/cart/items', { method: 'DELETE' });
}

function normalizeCart(data: Record<string, unknown>): Cart {
	const items = (data.items ?? []) as CartItemWithPrice[];
	return {
		id: Number(data.id),
		session_id: data.session_id as string | null | undefined,
		user_id: data.user_id as number | null | undefined,
		items,
		subtotal_cents: Number(data.subtotal_cents ?? 0),
		subtotal: data.subtotal as string | number | undefined,
		created_at: data.created_at as string | undefined,
		updated_at: data.updated_at as string | undefined
	};
}
