export interface SiteSettings {
	store_name: string;
	logo_url?: string | null;
	favicon_url?: string | null;
	primary_color?: string;
	secondary_color?: string;
	font_family?: string;
	support_email?: string | null;
	meta_description?: string | null;
}

export interface FrontendConfig {
	layout?: 'grid' | 'list';
	products_per_page?: number;
	show_category_nav?: boolean;
}

export interface ActiveFrontendInfo {
	addon_id: string;
	addon_name: string;
	version: string;
	config?: FrontendConfig;
}

export interface StorefrontConfig {
	site: SiteSettings;
	frontend: ActiveFrontendInfo;
	configUnavailable?: boolean;
}

export interface ProductImage {
	id?: number;
	url?: string;
	key?: string;
	alt_text?: string | null;
	sort_order?: number;
	[key: string]: unknown;
}

export interface Product {
	id: number;
	name: string;
	description?: string | null;
	price_cents: number;
	price?: string;
	compare_at_price_cents?: number | null;
	compare_at_price?: string | null;
	sku?: string | null;
	inventory_quantity: number;
	status: string;
	category?: string | null;
	tags?: Record<string, unknown>[];
	images?: ProductImage[];
	created_at?: string;
	updated_at?: string;
}

export interface Category {
	id: number;
	name: string;
	slug: string;
	description?: string | null;
	parent_id?: number | null;
	sort_order: number;
	created_at: string;
	updated_at: string;
	children?: Category[];
}

export interface PaginatedResponse<T> {
	items: T[];
	total: number;
	page?: number;
	page_size?: number;
	pages?: number;
}

export interface ProductListParams {
	page?: number;
	page_size?: number;
	category?: string;
	search?: string;
	sort?: string;
	order?: 'asc' | 'desc';
	status?: string;
}

export class ApiError extends Error {
	status: number;

	constructor(message: string, status: number) {
		super(message);
		this.name = 'ApiError';
		this.status = status;
	}
}
