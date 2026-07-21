<script lang="ts">
	import SeoHead from '$lib/components/SeoHead.svelte';
	import EmptyState from '$lib/components/EmptyState.svelte';
	import { isPrivacyPolicyPublished } from '$lib/types';
	import { absoluteUrl, truncateText } from '$lib/utils/seo';

	let { data } = $props();

	const site = $derived(data.config.site);
	const published = $derived(isPrivacyPolicyPublished(site));
	const title = $derived(site.privacy_policy_title?.trim() || 'Privacy Policy');
	const pageTitle = $derived(`${title} | ${site.store_name}`);
	const description = $derived(
		truncateText(site.privacy_policy_body, 160) || site.meta_description || undefined
	);
</script>

<SeoHead
	title={pageTitle}
	{description}
	canonical={absoluteUrl(site, '/privacy')}
	siteName={site.store_name}
	ogImage={site.logo_url}
/>

{#if published}
	<article class="privacy-page">
		<header class="page-header">
			<h1>{title}</h1>
			{#if site.privacy_policy_effective_date}
				<p>
					Effective
					<time datetime={site.privacy_policy_effective_date}>
						{site.privacy_policy_effective_date}
					</time>
				</p>
			{/if}
		</header>
		<div class="privacy-page__body">{site.privacy_policy_body}</div>
	</article>
{:else}
	<EmptyState message="No privacy policy has been published." />
{/if}

<style>
	.privacy-page {
		max-width: 42rem;
	}

	.privacy-page__body {
		white-space: pre-wrap;
		line-height: 1.6;
	}
</style>
