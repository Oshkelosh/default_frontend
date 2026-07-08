import { listProducts } from '$lib/api/products';
import { ApiError } from '$lib/types';
import type { Category, PaginatedResponse, Product } from '$lib/types';

export const ssr = false;

const emptyProducts = (pageSize: number): PaginatedResponse<Product> => ({
	items: [],
	total: 0,
	page: 1,
	page_size: pageSize,
	pages: 1
});

async function loadCategorySection(category: Category, pageSize: number) {
	try {
		const products = await listProducts({
			category: category.slug,
			sort: 'popularity',
			order: 'desc',
			page_size: pageSize
		});
		return { category, products };
	} catch {
		return null;
	}
}

export async function load({ parent }) {
	const { config, categories } = await parent();
	const frontendConfig = config.frontend.config;
	const heroPageSize = frontendConfig?.hero_products ?? 5;
	const categoryPageSize = frontendConfig?.category_products ?? 8;

	let popularProducts = emptyProducts(heroPageSize);
	let error: string | null = null;

	try {
		popularProducts = await listProducts({
			sort: 'popularity',
			order: 'desc',
			page_size: heroPageSize
		});
	} catch (err) {
		error =
			err instanceof ApiError ? err.message : 'Failed to load products. Please try again later.';
	}

	const categoryResults = await Promise.all(
		(categories as Category[]).map((category) =>
			loadCategorySection(category, categoryPageSize)
		)
	);
	const categorySections = categoryResults.filter(
		(section): section is { category: Category; products: PaginatedResponse<Product> } =>
			section !== null && section.products.items.length > 0
	);

	return {
		popularProducts,
		categorySections,
		error
	};
}
