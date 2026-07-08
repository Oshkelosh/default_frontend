import { apiFetch } from '$lib/api/client';
import type { Category } from '$lib/types';

export async function listCategories(): Promise<Category[]> {
	const data = await apiFetch<Category[] | { items: Category[] }>('/api/v1/categories');
	if (Array.isArray(data)) return data;
	return data.items ?? [];
}

export async function getCategory(slug: string): Promise<Category> {
	return apiFetch<Category>(`/api/v1/categories/${encodeURIComponent(slug)}`);
}
