import { apiFetch } from '$lib/api/client';
import type { Cart, CartItemWithPrice } from '$lib/types';

export async function getCart(): Promise<Cart> {
	const data = await apiFetch<Cart & { items?: CartItemWithPrice[] }>('/api/v1/cart', {
		auth: true
	});
	return {
		...data,
		items: data.items ?? []
	};
}

export async function addCartItem(productId: number, variantId: number, quantity = 1): Promise<void> {
	await apiFetch('/api/v1/cart/items', {
		method: 'POST',
		auth: true,
		body: JSON.stringify({ product_id: productId, variant_id: variantId, quantity })
	});
}

export async function updateCartItem(itemId: number, quantity: number): Promise<void> {
	await apiFetch(`/api/v1/cart/items/${itemId}`, {
		method: 'PATCH',
		auth: true,
		body: JSON.stringify({ quantity })
	});
}

export async function removeCartItem(itemId: number): Promise<void> {
	await apiFetch(`/api/v1/cart/items/${itemId}`, {
		method: 'DELETE',
		auth: true
	});
}

export async function clearCart(): Promise<void> {
	await apiFetch('/api/v1/cart/items', {
		method: 'DELETE',
		auth: true
	});
}
