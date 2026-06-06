<script lang="ts">
	import '../app.css';
	import { apiUrl } from '$lib/api/config';
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import { initSession } from '$lib/auth/session.svelte';

	const themeCssUrl = apiUrl('/api/v1/storefront/theme.css');

	let { data, children } = $props();

	const site = $derived(data.config.site);
	const frontendConfig = $derived(data.config.frontend.config ?? {});
	const showCategoryNav = $derived(frontendConfig.show_category_nav !== false);

	$effect(() => {
		void initSession();
	});

	$effect(() => {
		if (site.primary_color) {
			document.documentElement.style.setProperty('--color-primary', site.primary_color);
		}
		if (site.secondary_color) {
			document.documentElement.style.setProperty('--color-secondary', site.secondary_color);
		}
		if (site.font_family) {
			document.documentElement.style.setProperty('--font-sans', site.font_family);
		}
	});
</script>

<svelte:head>
	<link rel="stylesheet" href={themeCssUrl} />
	<title>{site.store_name}</title>
	{#if site.meta_description}
		<meta name="description" content={site.meta_description} />
	{/if}
	{#if site.favicon_url}
		<link rel="icon" href={site.favicon_url} />
	{/if}
</svelte:head>

{#if data.config.configUnavailable}
	<div class="config-banner">
		Storefront config unavailable — using default branding.
	</div>
{/if}

<Header {site} categories={data.categories} {showCategoryNav} />

<main class="container" style="padding: 2rem 0;">
	{@render children()}
</main>

<Footer {site} />
