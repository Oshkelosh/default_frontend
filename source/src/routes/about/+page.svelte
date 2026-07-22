<script lang="ts">
	import SeoHead from '$lib/components/SeoHead.svelte';
	import EmptyState from '$lib/components/EmptyState.svelte';
	import { isAboutPagePublished } from '$lib/types';
	import { absoluteUrl, truncateText } from '$lib/utils/seo';

	let { data } = $props();

	const site = $derived(data.config.site);
	const published = $derived(isAboutPagePublished(site));
	const title = $derived(site.about_page_title?.trim() || 'About');
	const pageTitle = $derived(`${title} | ${site.store_name}`);
	const description = $derived(
		truncateText(site.about_page_body, 160) || site.meta_description || undefined
	);
	const contactBody = $derived(site.about_contact_body?.trim() || '');
</script>

<SeoHead
	title={pageTitle}
	{description}
	canonical={absoluteUrl(site, '/about')}
	siteName={site.store_name}
	ogImage={site.logo_url}
/>

{#if published}
	<article class="about-page">
		<section class="about-page__section" aria-labelledby="about-heading">
			<header class="page-header">
				<h1 id="about-heading">{title}</h1>
			</header>
			<div class="about-page__body">{site.about_page_body}</div>
		</section>

		<section class="about-page__section" aria-labelledby="contact-heading">
			<h2 id="contact-heading">Contact Us</h2>
			{#if contactBody}
				<div class="about-page__body">{contactBody}</div>
			{/if}
			{#if site.support_email}
				<p class="about-page__email">
					<a href="mailto:{site.support_email}">{site.support_email}</a>
				</p>
			{/if}
		</section>
	</article>
{:else}
	<EmptyState message="No about page has been published." />
{/if}

<style>
	.about-page {
		max-width: 42rem;
	}

	.about-page__section + .about-page__section {
		margin-top: 2.5rem;
		padding-top: 2rem;
		border-top: 1px solid var(--clr-border);
	}

	.about-page__section h2 {
		margin: 0 0 1rem;
		font-size: 1.35rem;
	}

	.about-page__body {
		white-space: pre-wrap;
		line-height: 1.6;
	}

	.about-page__email {
		margin: 1rem 0 0;
	}

	.about-page__email a {
		color: var(--color-primary);
	}
</style>
