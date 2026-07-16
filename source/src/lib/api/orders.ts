import { apiFetch } from '$lib/api/client';
import type { CheckoutSession, Order, OrderCreatePayload, PaginatedResponse } from '$lib/types';

export async function listOrders(): Promise<PaginatedResponse<Order>> {
	return apiFetch<PaginatedResponse<Order>>('/api/v1/orders', { auth: true });
}

export async function createOrder(
	payload: OrderCreatePayload,
	idempotencyKey: string
): Promise<Order> {
	return apiFetch<Order>('/api/v1/orders', {
		method: 'POST',
		auth: true,
		headers: { 'Idempotency-Key': idempotencyKey },
		body: JSON.stringify(payload)
	});
}

export async function checkoutOrder(orderId: number): Promise<CheckoutSession> {
	return apiFetch<CheckoutSession>(`/api/v1/orders/${orderId}/checkout`, {
		method: 'POST',
		auth: true
	});
}

export async function getOrder(orderId: number): Promise<Order> {
	return apiFetch<Order>(`/api/v1/orders/${orderId}`, { auth: true });
}

export async function cancelOrder(orderId: number): Promise<void> {
	await apiFetch(`/api/v1/orders/${orderId}/cancel`, {
		method: 'POST',
		auth: true
	});
}
