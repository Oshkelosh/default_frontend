import { apiFetch } from '$lib/api/client';
import type { PaginatedResponse, Product, ProductDetail, ProductListParams } from '$lib/types';

type ProductListResponse = PaginatedResponse<Product> & {
	total_pages?: number;
	pages?: number;
};

function normalizeProductList(data: ProductListResponse): PaginatedResponse<Product> {
	return {
		...data,
		pages: data.pages ?? data.total_pages ?? 1
	};
}

export async function listProducts(params: ProductListParams = {}): Promise<PaginatedResponse<Product>> {
	const search = new URLSearchParams();
	if (params.page) search.set('page', String(params.page));
	if (params.page_size) search.set('page_size', String(params.page_size));
	if (params.category) search.set('category', params.category);
	if (params.search) search.set('search', params.search);
	if (params.sort) search.set('sort', params.sort);
	if (params.order) search.set('order', params.order);
	if (params.status) search.set('status', params.status);

	const query = search.toString();
	const path = query ? `/api/v1/products?${query}` : '/api/v1/products';
	const data = await apiFetch<ProductListResponse>(path);
	return normalizeProductList(data);
}

export async function getProductBySlug(slug: string): Promise<ProductDetail> {
	return apiFetch<ProductDetail>(`/api/v1/products/by-slug/${encodeURIComponent(slug)}`);
}

export async function getProductById(productId: number): Promise<Product> {
	return apiFetch<Product>(`/api/v1/products/${productId}`);
}

export const getProduct = getProductById;
