import { getStorefrontConfig } from '$lib/api/storefront';
import { listCategories } from '$lib/api/categories';
import type { Category } from '$lib/types';
import {
	readPreferredCurrencyCookie,
	setShopCurrency,
	writePreferredCurrencyCookie
} from '$lib/utils/money';

export const ssr = false;

export async function load() {
	const config = await getStorefrontConfig();
	setShopCurrency(config.site.shop_currency);
	// Seed cookie from IP hint only when unset — do not overwrite address-locked preference.
	if (config.site.preferred_currency && !readPreferredCurrencyCookie()) {
		writePreferredCurrencyCookie(config.site.preferred_currency);
	}
	let categories: Category[] = [];

	try {
		categories = await listCategories();
	} catch {
		categories = [];
	}

	return { config, categories };
}
