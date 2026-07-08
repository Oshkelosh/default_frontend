import { apiFetch } from '$lib/api/client';
import type { Order, PaginatedResponse } from '$lib/types';

export async function listOrders(): Promise<PaginatedResponse<Order>> {
	return apiFetch<PaginatedResponse<Order>>('/api/v1/orders', { auth: true });
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
