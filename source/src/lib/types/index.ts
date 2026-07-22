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
	shop_currency?: string;
	preferred_currency?: string | null;
	gdpr_banner_enabled?: boolean;
	gdpr_banner_text?: string | null;
	privacy_policy_enabled?: boolean;
	privacy_policy_title?: string;
	privacy_policy_body?: string | null;
	privacy_policy_effective_date?: string | null;
	about_page_enabled?: boolean;
	about_page_title?: string;
	about_page_body?: string | null;
	about_contact_body?: string | null;
}

/** True when the built-in /privacy page should be linked and indexed. */
export function isPrivacyPolicyPublished(site: SiteSettings): boolean {
	return !!site.privacy_policy_enabled && !!site.privacy_policy_body?.trim();
}

/** True when the built-in /about page should be linked and indexed. */
export function isAboutPagePublished(site: SiteSettings): boolean {
	return !!site.about_page_enabled && !!site.about_page_body?.trim();
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
	tools?: ToolsConfig;
	configUnavailable?: boolean;
}

export interface StorefrontScript {
	id: string;
	src: string;
	attrs?: Record<string, string | boolean>;
	routes?: 'all' | 'public' | 'private';
}

export interface ToolsConfig {
	scripts: StorefrontScript[];
	consent_categories?: string[];
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
	current_password?: string;
	push_token?: string | null;
	push_provider?: string | null;
}

export interface OrderCreatePayload {
	shipping_address?: ShippingAddress | null;
	billing_address?: ShippingAddress | null;
	notes?: string | null;
	currency?: string;
	shipping_selections?: Record<string, string> | null;
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

export interface ShippingRateOption {
	id: string;
	name: string;
	cents: number;
	min_delivery_days?: number | null;
	max_delivery_days?: number | null;
}

export interface ShippingBreakdownItem {
	source: string;
	fulfillment_key: string;
	cents: number;
	label: string;
	cart_item_ids: number[];
	addon_id?: string | null;
	subtotal_cents?: number | null;
	options?: ShippingRateOption[];
	selected_id?: string | null;
}

export interface CartQuote {
	subtotal_cents: number;
	tax_cents: number;
	shipping_cents: number;
	tax_source: string;
	currency?: string;
	preferred_currency?: string | null;
	shipping_breakdown: ShippingBreakdownItem[];
}

export interface CartItemShippingEstimate {
	cart_item_id: number;
	shipping_cents: number;
	currency?: string;
	label: string;
	source: string;
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

export class ApiError extends Error {
	status: number;

	constructor(message: string, status: number) {
		super(message);
		this.name = 'ApiError';
		this.status = status;
	}
}
