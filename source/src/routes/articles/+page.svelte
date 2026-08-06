<script lang="ts">
	import { resolve } from '$app/paths';
	import SeoHead from '$lib/components/SeoHead.svelte';
	import EmptyState from '$lib/components/EmptyState.svelte';
	import ErrorState from '$lib/components/ErrorState.svelte';
	import { renderMarkdown } from '$lib/utils/markdown';
	import {
		absoluteUrl,
		breadcrumbJsonLd,
		itemListJsonLd,
		truncateText
	} from '$lib/utils/seo';

	let { data } = $props();

	const site = $derived(data.config.site);
	const hub = $derived(data.hub);
	const title = $derived((hub?.meta_title || hub?.intro_title || 'Articles').trim());
	const pageTitle = $derived(`${title} | ${site.store_name}`);
	const description = $derived(
		hub?.meta_description?.trim() ||
			truncateText(hub?.intro_markdown, 160) ||
			site.meta_description ||
			undefined
	);
	const canonical = $derived(absoluteUrl(site, '/articles'));
	const introHtml = $derived(hub ? renderMarkdown(hub.intro_markdown || '') : '');
	const listItems = $derived(
		(hub?.posts ?? []).map((post) => ({
			name: post.title,
			url: absoluteUrl(site, `/articles/${post.slug}`)
		}))
	);
	const breadcrumbs = $derived(
		breadcrumbJsonLd([
			{ name: 'Home', url: absoluteUrl(site, '/') },
			{ name: hub?.intro_title || 'Articles', url: canonical }
		])
	);
	const collectionLd = $derived(itemListJsonLd(pageTitle, canonical, listItems));
</script>

{#if data.error}
	<ErrorState message={data.error} />
{:else if hub}
	<SeoHead
		title={pageTitle}
		{description}
		{canonical}
		siteName={site.store_name}
		ogImage={site.logo_url}
		jsonLd={[breadcrumbs, collectionLd]}
	/>

	<nav class="breadcrumbs" aria-label="Breadcrumb">
		<a href={resolve('/')}>Home</a>
		<span aria-hidden="true">/</span>
		<span>{hub.intro_title || 'Articles'}</span>
	</nav>

	<header class="page-header">
		<h1>{hub.intro_title || 'Articles'}</h1>
	</header>

	{#if hub.intro_markdown?.trim()}
		<div class="md-body">{@html introHtml}</div>
	{/if}

	{#if hub.posts.length}
		<ul class="articles-list">
			{#each hub.posts as post (post.slug)}
				<li>
					<a href={resolve(`/articles/${post.slug}`)}>
						<strong>{post.title}</strong>
						{#if post.excerpt}
							<p>{post.excerpt}</p>
						{/if}
					</a>
				</li>
			{/each}
		</ul>
	{:else}
		<EmptyState message="No articles published yet." />
	{/if}
{:else}
	<EmptyState message="Articles are not available." />
{/if}

<style>
	.breadcrumbs {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
		margin-bottom: 1.25rem;
		font-size: 0.875rem;
		color: var(--clr-muted);
	}

	.breadcrumbs a {
		color: var(--clr-muted);
		text-decoration: none;
	}

	.breadcrumbs a:hover {
		color: var(--color-primary);
		text-decoration: underline;
	}

	.md-body {
		line-height: 1.65;
		margin-bottom: 1.5rem;
		max-width: 42rem;
	}

	.md-body :global(p) {
		margin: 0 0 1rem;
	}

	.md-body :global(a) {
		color: var(--color-primary);
	}

	.articles-list p {
		margin: 0.25rem 0 0;
		color: var(--clr-muted);
		font-size: 0.875rem;
	}
</style>
