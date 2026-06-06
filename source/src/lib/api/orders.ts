import { authFetch } from './client';
import type { CheckoutSession, Order, PaginatedResponse } from '$lib/types';

export async function createOrder(): Promise<Order> {
	return authFetch<Order>('/api/v1/orders', { method: 'POST' });
}

export async function listOrders(params: {
	page?: number;
	page_size?: number;
	status?: string;
} = {}): Promise<PaginatedResponse<Order>> {
	const search = new URLSearchParams();
	if (params.page) search.set('page', String(params.page));
	if (params.page_size) search.set('page_size', String(params.page_size));
	if (params.status) search.set('status', params.status);
	const query = search.toString();
	return authFetch<PaginatedResponse<Order>>(`/api/v1/orders${query ? `?${query}` : ''}`);
}

export async function getOrder(orderId: number): Promise<Order> {
	return authFetch<Order>(`/api/v1/orders/${orderId}`);
}

export async function checkoutOrder(orderId: number): Promise<CheckoutSession> {
	return authFetch<CheckoutSession>(`/api/v1/orders/${orderId}/checkout`, {
		method: 'POST'
	});
}

export async function cancelOrder(orderId: number): Promise<Order> {
	return authFetch<Order>(`/api/v1/orders/${orderId}/cancel`, { method: 'POST' });
}
