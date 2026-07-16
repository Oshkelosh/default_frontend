export interface SiteSettings {
	store_name: string;
	logo_url?: string | null;
	favicon_url?: string | null;
	primary_color?: string;
	secondary_color?: string;
	font_family?: string;
	support_email?: string | null;
	meta_description?: string | null;
	site_url?: string | null;
}

export interface FrontendConfig {
	layout?: 'grid' | 'list';
	products_per_page?: number;
	hero_products?: number;
	category_products?: number;
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
	auth?: AuthConfig;
	notifications?: NotificationsConfig;
	configUnavailable?: boolean;
}

export interface PushConfig {
	provider: string;
	config: Record<string, string>;
}

export interface NotificationsConfig {
	push?: PushConfig | null;
}

export interface SsoProvider {
	id: string;
	label: string;
	authorize_url: string;
}

export interface AuthConfig {
	sso_providers: SsoProvider[];
	email_verification_enabled?: boolean;
}

export interface ProductImage {
	id?: number;
	url?: string;
	variants?: Record<string, string>;
	key?: string;
	alt_text?: string | null;
	sort_order?: number;
	variant_id?: number | null;
	[key: string]: unknown;
}

export interface ProductVariant {
	id: number;
	product_id: number;
	title: string;
	position: number;
	price_cents: number;
	price?: string;
	compare_at_price_cents?: number | null;
	inventory_quantity: number;
	sku?: string | null;
	status: string;
	attributes?: Record<string, string>;
	images?: ProductImage[];
}

export interface Product {
	id: number;
	name: string;
	slug?: string | null;
	meta_title?: string | null;
	meta_description?: string | null;
	description?: string | null;
	price_cents: number;
	price?: string;
	compare_at_price_cents?: number | null;
	compare_at_price?: string | null;
	sku?: string | null;
	inventory_quantity: number;
	has_variants?: boolean;
	options?: Record<string, string>;
	status: string;
	category?: string | null;
	tags?: Record<string, unknown>[];
	images?: ProductImage[];
	created_at?: string;
	updated_at?: string;
}

export interface ProductDetail extends Product {
	variants?: ProductVariant[];
}

export interface Category {
	id: number;
	name: string;
	slug: string;
	description?: string | null;
	meta_title?: string | null;
	meta_description?: string | null;
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
	/** Category slug sent as `?category=` (resolved server-side). */
	category?: string;
	search?: string;
	sort?: string;
	order?: 'asc' | 'desc';
	status?: string;
}

export interface User {
	id: number;
	email: string;
	full_name?: string | null;
	phone?: string | null;
	default_shipping_address?: ShippingAddress | null;
	default_billing_address?: ShippingAddress | null;
	banned: boolean;
	verified: boolean;
	verified_at?: string | null;
	is_admin?: boolean;
	auth_methods?: string[];
	push_enabled?: boolean;
	created_at: string;
	updated_at: string;
}

export interface ShippingAddress {
	full_name?: string | null;
	name?: string;
	line1?: string;
	line2?: string | null;
	city?: string;
	state?: string | null;
	postal_code?: string;
	country?: string;
	email?: string | null;
	phone?: string | null;
	[key: string]: unknown;
}

export interface UserProfileUpdate {
	full_name?: string | null;
	phone?: string | null;
	default_shipping_address?: ShippingAddress | null;
	default_billing_address?: ShippingAddress | null;
	password?: string;
	push_token?: string | null;
	push_provider?: string | null;
}

export interface OrderCreatePayload {
	shipping_address?: ShippingAddress | null;
	billing_address?: ShippingAddress | null;
	notes?: string | null;
	currency?: string;
}

export interface OrderCheckoutPayload {
	shipping_address?: ShippingAddress | null;
	billing_address?: ShippingAddress | null;
}

export interface Token {
	access_token: string;
	refresh_token: string;
	token_type?: string;
}

export interface RegisterResponse extends Token {
	user: User;
}

export interface UserRegister {
	email: string;
	password: string;
	full_name?: string | null;
	phone?: string | null;
	default_shipping_address: ShippingAddress;
	default_billing_address?: ShippingAddress | null;
	billing_same_as_shipping?: boolean;
}

export interface UserLogin {
	email: string;
	password: string;
}

export interface CartItemWithPrice {
	id: number;
	cart_id: number;
	product_id: number;
	variant_id: number;
	quantity: number;
	product_name: string;
	variant_title: string;
	unit_price_cents: number;
	unit_price?: string | number;
	line_total_cents: number;
	line_total?: string | number;
	created_at?: string;
	updated_at?: string;
}

export interface Cart {
	id: number;
	session_id?: string | null;
	user_id?: number | null;
	items: CartItemWithPrice[];
	subtotal_cents: number;
	subtotal?: string | number;
	created_at?: string;
	updated_at?: string;
}

export interface OrderItem {
	id: number;
	order_id: number;
	product_id?: number | null;
	product_name: string;
	product_sku: string;
	quantity: number;
	unit_price_cents: number;
	unit_price?: string;
	total_price_cents: number;
	total_price?: string;
	created_at?: string;
}

export interface Order {
	id: number;
	session_id?: string | null;
	user_id?: number | null;
	status: string;
	total_cents: number;
	total?: string;
	tax_cents: number;
	tax?: string;
	shipping_cents: number;
	shipping?: string;
	currency: string;
	shipping_address?: Record<string, unknown> | null;
	billing_address?: Record<string, unknown> | null;
	notes?: string | null;
	items?: OrderItem[];
	created_at: string;
	updated_at: string;
}

export interface CheckoutSession {
	success?: boolean;
	session_id?: string;
	url?: string;
	order_id?: string | number;
	amount?: number;
	currency?: string;
	note?: string;
}

export interface CartLine {
	item: CartItemWithPrice;
	product: Product | null;
}

export class ApiError extends Error {
	status: number;

	constructor(message: string, status: number) {
		super(message);
		this.name = 'ApiError';
		this.status = status;
	}
}
