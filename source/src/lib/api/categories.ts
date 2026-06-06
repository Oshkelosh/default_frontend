import { apiFetch } from './client';
import type { Category, PaginatedResponse } from '$lib/types';

export async function listCategories(): Promise<Category[]> {
	const data = await apiFetch<PaginatedResponse<Category> | Category[] | Record<string, unknown>>(
		'/api/v1/categories'
	);

	if (Array.isArray(data)) {
		return data;
	}

	if ('items' in data && Array.isArray(data.items)) {
		return data.items as Category[];
	}

	return [];
}

export async function getCategory(slug: string): Promise<Category> {
	return apiFetch<Category>(`/api/v1/categories/${slug}`);
}
