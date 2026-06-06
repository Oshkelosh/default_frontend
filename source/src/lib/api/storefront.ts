import { apiFetch } from './client';
import type { ActiveFrontendInfo, SiteSettings, StorefrontConfig } from '$lib/types';

const DEFAULT_SITE: SiteSettings = {
	store_name: 'Oshkelosh',
	primary_color: '#2563eb',
	secondary_color: '#64748b',
	font_family: 'system-ui, sans-serif',
	meta_description: 'Shop our curated collection'
};

const DEFAULT_FRONTEND: ActiveFrontendInfo = {
	addon_id: 'basic',
	addon_name: 'Basic Storefront',
	version: '0.1.0',
	config: {
		layout: 'grid',
		products_per_page: 12,
		show_category_nav: true
	}
};

export async function getStorefrontConfig(): Promise<StorefrontConfig> {
	try {
		const data = await apiFetch<{ site: SiteSettings; frontend: ActiveFrontendInfo }>(
			'/api/v1/storefront/config'
		);
		return {
			site: { ...DEFAULT_SITE, ...data.site },
			frontend: {
				...DEFAULT_FRONTEND,
				...data.frontend,
				config: { ...DEFAULT_FRONTEND.config, ...data.frontend.config }
			}
		};
	} catch (error) {
		if (error instanceof Error && 'status' in error && (error as { status: number }).status === 503) {
			return {
				site: DEFAULT_SITE,
				frontend: DEFAULT_FRONTEND,
				configUnavailable: true
			};
		}
		return {
			site: DEFAULT_SITE,
			frontend: DEFAULT_FRONTEND,
			configUnavailable: true
		};
	}
}
