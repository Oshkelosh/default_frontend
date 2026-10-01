<script lang="ts">
	import { resolve } from '$app/paths';
	import {
		REOPEN_COOKIE_NOTICE_EVENT,
		openZarazConsentModal,
		resolveCookieConsentMode,
		showCookieSettings
	} from '$lib/consent';
	import type { SiteSettings } from '$lib/types';
	import { isAboutPagePublished, isPrivacyPolicyPublished } from '$lib/types';

	let { site }: { site: SiteSettings } = $props();

	const showAboutLink = $derived(isAboutPagePublished(site));
	const showPrivacyLink = $derived(isPrivacyPolicyPublished(site));
	const cookieSettings = $derived(showCookieSettings(resolveCookieConsentMode(site)));

	function onCookieSettings() {
		if (!openZarazConsentModal()) {
			window.dispatchEvent(new Event(REOPEN_COOKIE_NOTICE_EVENT));
		}
	}

	/** Adopt server-injected #seo-catalog-nav into the footer (crawler HTML stays intact). */
	function adoptCatalogNav(node: HTMLElement) {
		const nav = document.getElementById('seo-catalog-nav');
		if (nav && nav.parentElement !== node) {
			node.appendChild(nav);
		}
		return {
			destroy() {
				// Leave nav in place; next footer mount will re-adopt if needed.
			}
		};
	}
</script>

<footer class="shop-footer">
	<div class="container shop-footer__inner">
		<div class="shop-footer__brand">
			<p>
				&copy; {new Date().getFullYear()}
				{site.store_name} | Powered by
				<a href="https://github.com/oshkelosh" target="_blank" rel="noopener noreferrer"
					>Oshkelosh</a
				>
			</p>
			<div class="shop-footer__catalog" use:adoptCatalogNav></div>
		</div>
		<div class="shop-footer__links">
			{#if showAboutLink}
				<a href={resolve('/about')}>About</a>
			{/if}
			{#if showPrivacyLink}
				<a href={resolve('/privacy')}>Privacy policy</a>
			{/if}
			{#if cookieSettings}
				<button type="button" class="shop-footer__cookie" onclick={onCookieSettings}>
					Cookie settings
				</button>
			{/if}
			{#if site.support_email}
				<a href="mailto:{site.support_email}">{site.support_email}</a>
			{/if}
		</div>
	</div>
</footer>

<style>
	.shop-footer {
		border-top: 1px solid var(--color-secondary-border);
		padding: 2rem 0;
		margin-top: 2rem;
		background: var(--color-secondary-subtle);
		color: var(--clr-muted);
		font-size: 0.875rem;
	}

	.shop-footer__inner {
		display: flex;
		flex-wrap: wrap;
		justify-content: space-between;
		gap: 1rem 1.5rem;
	}

	.shop-footer__brand {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: 0.75rem;
		min-width: min(100%, 16rem);
	}

	.shop-footer__brand p {
		margin: 0;
	}

	.shop-footer__catalog {
		min-height: 0;
	}

	.shop-footer__catalog :global(.seo-catalog-nav) {
		margin: 0;
		padding: 0;
		background: transparent;
		border: none;
		font: inherit;
		color: inherit;
	}

	.shop-footer__catalog :global(.seo-catalog-nav__inner) {
		width: auto;
		max-width: none;
		margin: 0;
		padding: 0;
		justify-content: flex-start;
	}

	.shop-footer__links {
		display: flex;
		flex-wrap: wrap;
		align-items: flex-start;
		gap: 1rem;
	}

	.shop-footer a,
	.shop-footer__cookie {
		color: var(--clr-muted);
		text-decoration: none;
	}

	.shop-footer a:hover,
	.shop-footer__cookie:hover {
		color: var(--color-primary);
		text-decoration: underline;
	}

	.shop-footer__cookie {
		appearance: none;
		background: none;
		border: none;
		padding: 0;
		font: inherit;
		cursor: pointer;
	}
</style>
