<script lang="ts">
	import { resolve } from '$app/paths';
	import SeoHead from '$lib/components/SeoHead.svelte';
	import ErrorState from '$lib/components/ErrorState.svelte';
	import { renderMarkdown } from '$lib/utils/markdown';
	import { absoluteUrl, breadcrumbJsonLd, truncateText } from '$lib/utils/seo';

	let { data } = $props();

	const site = $derived(data.config.site);
	const post = $derived(data.post);
	const pageTitle = $derived(
		post ? `${(post.meta_title || post.title).trim()} | ${site.store_name}` : site.store_name
	);
	const description = $derived(
		post?.meta_description?.trim() ||
			truncateText(post?.body_markdown, 160) ||
			site.meta_description ||
			undefined
	);
	const canonical = $derived(post ? absoluteUrl(site, `/articles/${post.slug}`) : null);
	const bodyHtml = $derived(post ? renderMarkdown(post.body_markdown || '') : '');
	const breadcrumbs = $derived.by(() => {
		if (!post || !canonical) return null;
		return breadcrumbJsonLd([
			{ name: 'Home', url: absoluteUrl(site, '/') },
			{ name: 'Articles', url: absoluteUrl(site, '/articles') },
			{ name: post.title, url: canonical }
		]);
	});
	const articleLd = $derived.by(() => {
		if (!post || !canonical) return null;
		const payload: Record<string, unknown> = {
			'@context': 'https://schema.org',
			'@type': 'Article',
			headline: post.title,
			mainEntityOfPage: canonical,
			author: { '@type': 'Organization', name: site.store_name }
		};
		if (description) payload.description = description;
		if (post.published_at) payload.datePublished = post.published_at;
		if (post.updated_at) payload.dateModified = post.updated_at;
		return payload;
	});
</script>

{#if data.error}
	<ErrorState message={data.error} />
{:else if post}
	<SeoHead
		title={pageTitle}
		{description}
		canonical={canonical}
		ogType="article"
		siteName={site.store_name}
		ogImage={site.logo_url}
		jsonLd={[breadcrumbs, articleLd].filter(Boolean) as Array<Record<string, unknown>>}
	/>

	<article class="article-page">
		<nav class="breadcrumbs" aria-label="Breadcrumb">
			<a href={resolve('/')}>Home</a>
			<span aria-hidden="true">/</span>
			<a href={resolve('/articles')}>Articles</a>
			<span aria-hidden="true">/</span>
			<span>{post.title}</span>
		</nav>

		<header class="page-header">
			<h1>{post.title}</h1>
		</header>

		<div class="md-body">{@html bodyHtml}</div>
	</article>
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

	.article-page {
		max-width: 42rem;
	}

	.md-body {
		line-height: 1.65;
	}

	.md-body :global(p) {
		margin: 0 0 1rem;
	}

	.md-body :global(h2),
	.md-body :global(h3) {
		margin: 1.75rem 0 0.75rem;
	}

	.md-body :global(a) {
		color: var(--color-primary);
	}

	.md-body :global(ul),
	.md-body :global(ol) {
		padding-left: 1.25rem;
		margin: 0 0 1rem;
	}

	.md-body :global(pre) {
		overflow: auto;
		padding: 0.75rem 1rem;
		background: var(--color-secondary-subtle);
		border-radius: var(--radius);
	}

	.md-body :global(code) {
		font-family: ui-monospace, monospace;
		font-size: 0.9em;
	}
</style>
