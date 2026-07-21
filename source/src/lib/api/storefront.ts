import { apiFetch } from './client';
import type {
	ActiveFrontendInfo,
	AuthConfig,
	NotificationsConfig,
	SiteSettings,
	StorefrontConfig,
	ToolsConfig
} from '$lib/types';

const DEFAULT_AUTH: AuthConfig = { sso_providers: [] };

const DEFAULT_NOTIFICATIONS: NotificationsConfig = { push: null };

const DEFAULT_TOOLS: ToolsConfig = { scripts: [] };

const DEFAULT_SITE: SiteSettings = {
	store_name: 'Oshkelosh',
	primary_color: '#2563eb',
	secondary_color: '#64748b',
	font_family: 'system-ui, sans-serif',
	meta_description: 'Shop our curated collection',
	site_url: null,
	shop_currency: 'USD'
};

const DEFAULT_FRONTEND: ActiveFrontendInfo = {
	addon_id: 'basic',
	addon_name: 'Basic Storefront',
	version: '0.1.0',
	config: {
		layout: 'grid',
		products_per_page: 12,
		hero_products: 5,
		category_products: 8,
		show_category_nav: true
	}
};

function normalizeTools(tools?: ToolsConfig | null): ToolsConfig {
	if (!tools) return { ...DEFAULT_TOOLS, scripts: [] };
	return {
		...DEFAULT_TOOLS,
		...tools,
		scripts: Array.isArray(tools.scripts) ? tools.scripts : []
	};
}

export async function getStorefrontConfig(): Promise<StorefrontConfig> {
	try {
		const data = await apiFetch<{
			site: SiteSettings;
			frontend: ActiveFrontendInfo;
			auth?: AuthConfig;
			notifications?: NotificationsConfig;
			tools?: ToolsConfig;
		}>('/api/v1/storefront/config');
		return {
			site: { ...DEFAULT_SITE, ...data.site },
			frontend: {
				...DEFAULT_FRONTEND,
				...data.frontend,
				config: { ...DEFAULT_FRONTEND.config, ...data.frontend.config }
			},
			auth: data.auth ?? DEFAULT_AUTH,
			notifications: data.notifications ?? DEFAULT_NOTIFICATIONS,
			tools: normalizeTools(data.tools)
		};
	} catch (error) {
		if (error instanceof Error && 'status' in error && (error as { status: number }).status === 503) {
			return {
				site: DEFAULT_SITE,
				frontend: DEFAULT_FRONTEND,
				auth: DEFAULT_AUTH,
				notifications: DEFAULT_NOTIFICATIONS,
				tools: DEFAULT_TOOLS,
				configUnavailable: true
			};
		}
		return {
			site: DEFAULT_SITE,
			frontend: DEFAULT_FRONTEND,
			auth: DEFAULT_AUTH,
			notifications: DEFAULT_NOTIFICATIONS,
			tools: DEFAULT_TOOLS,
			configUnavailable: true
		};
	}
}
