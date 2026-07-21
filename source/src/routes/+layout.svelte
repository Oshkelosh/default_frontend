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

	afterNavigate(({ to }) => {
		syncStorefrontScripts(data.config.tools?.scripts, to?.url.pathname ?? '/');
	});
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

<Header {site} />

<main class="container" style="padding: 2rem 0;">
	{@render children()}
</main>

<Footer {site} />
<GdprBanner {site} />
