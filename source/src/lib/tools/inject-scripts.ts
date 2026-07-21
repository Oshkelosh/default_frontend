import { loadScript } from '$lib/push/load-script';
import type { StorefrontScript } from '$lib/types';

/** Paths gated by requireAuth in the default storefront. */
export const PRIVATE_PREFIXES = ['/account', '/checkout', '/orders'] as const;

export function isPrivatePath(pathname: string): boolean {
	const normalized = pathname.replace(/\/+$/, '') || '/';
	return PRIVATE_PREFIXES.some(
		(prefix) => normalized === prefix || normalized.startsWith(`${prefix}/`)
	);
}

export function shouldLoadScript(
	routes: StorefrontScript['routes'] | undefined,
	pathname: string
): boolean {
	const scope = routes ?? 'all';
	const priv = isPrivatePath(pathname);
	if (scope === 'private') return priv;
	if (scope === 'public') return !priv;
	return true;
}

/** Inject matching storefront scripts once (stays loaded after first match). */
export function syncStorefrontScripts(
	scripts: StorefrontScript[] | undefined,
	pathname: string
): void {
	if (!scripts?.length) return;
	for (const entry of scripts) {
		if (!entry?.id || !entry.src) continue;
		if (!shouldLoadScript(entry.routes, pathname)) continue;
		void loadScript(entry.src, entry.attrs).catch(() => {
			/* third-party load failures should not break the shop */
		});
	}
}
