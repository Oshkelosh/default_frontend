<script lang="ts">
	import '../app.css';
	import { afterNavigate } from '$app/navigation';
	import { apiUrl } from '$lib/api/config';
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import GdprBanner from '$lib/components/GdprBanner.svelte';
	import { initSession } from '$lib/auth/session.svelte';
	import { initCart } from '$lib/cart/cart.svelte';
	import { syncStorefrontScripts } from '$lib/tools/inject-scripts';
	import { seoIntro } from '$lib/utils/seoIntro.svelte';
	import { contrastTextColor } from '$lib/utils/theme';

	const themeCssUrl = apiUrl('/api/v1/storefront/theme.css');

	let { data, children } = $props();

	const site = $derived(data.config.site);

	$effect(() => {
		void initSession();
		void initCart();
	});

	$effect(() => {
		if (site.primary_color) {
			document.documentElement.style.setProperty('--color-primary', site.primary_color);
			document.documentElement.style.setProperty(
				'--color-on-primary',
				contrastTextColor(site.primary_color)
			);
		}
		if (site.secondary_color) {
			document.documentElement.style.setProperty('--color-secondary', site.secondary_color);
			document.documentElement.style.setProperty(
				'--color-on-secondary',
				contrastTextColor(site.secondary_color)
			);
		}
		if (site.font_family) {
			document.documentElement.style.setProperty('--font-sans', site.font_family);
		}
	});

	afterNavigate(({ from, to }) => {
		syncStorefrontScripts(data.config.tools?.scripts, to?.url.pathname ?? '/');
		if (from) {
			document.getElementById('seo-intro')?.remove();
			seoIntro.present = false;
		}
	});

	/** Move server-injected #seo-intro to the top of main (crawler HTML stays intact). */
	function adoptSeoIntro(node: HTMLElement) {
		const intro = document.getElementById('seo-intro');
		if (intro && intro.parentElement !== node) {
			node.insertBefore(intro, node.firstChild);
			seoIntro.present = true;
		} else if (intro) {
			seoIntro.present = true;
		}
		return {
			destroy() {
				// Leave the node; next layout mount or afterNavigate will handle it.
			}
		};
	}
</script>

<svelte:head>
	<link rel="stylesheet" href={themeCssUrl} />
	{#if site.favicon_url}
		<link rel="icon" href={site.favicon_url} />
	{/if}
</svelte:head>

{#if data.config.configUnavailable}
	<div class="config-banner">
		Storefront config unavailable — using default branding.
	</div>
{/if}

<Header {site} navLinks={data.config.tools?.nav_links ?? []} />

<main class="container" style="padding: 2rem 0;" use:adoptSeoIntro>
	{@render children()}
</main>

<Footer {site} />
<GdprBanner {site} />
