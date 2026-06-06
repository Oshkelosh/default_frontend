import { apiFetch } from './client';
import type { PaginatedResponse, Product, ProductListParams } from '$lib/types';

function buildQuery(params: ProductListParams): string {
	const search = new URLSearchParams();
	if (params.page) search.set('page', String(params.page));
	if (params.page_size) search.set('page_size', String(params.page_size));
	if (params.category) search.set('category', params.category);
	if (params.search) search.set('search', params.search);
	if (params.sort) search.set('sort', params.sort);
	if (params.order) search.set('order', params.order);
	if (params.status) search.set('status', params.status);
	const query = search.toString();
	return query ? `?${query}` : '';
}

export async function listProducts(
	params: ProductListParams = {}
): Promise<PaginatedResponse<Product>> {
	const data = await apiFetch<Record<string, unknown>>(
		`/api/v1/products${buildQuery({ status: 'published', ...params })}`
	);
	return normalizeProductList(data);
}

export async function getProduct(id: number): Promise<Product> {
	return apiFetch<Product>(`/api/v1/products/${id}`);
}

function normalizeProductList(data: Record<string, unknown>): PaginatedResponse<Product> {
	const items = (data.items ?? data.products ?? []) as Product[];
	const total = Number(data.total ?? items.length);
	const page = Number(data.page ?? 1);
	const page_size = Number(data.page_size ?? (items.length || 20));
	const pages = Number(data.pages ?? Math.max(1, Math.ceil(total / page_size)));

	return { items, total, page, page_size, pages };
}
