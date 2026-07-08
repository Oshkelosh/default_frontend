<script lang="ts">
	let {
		title,
		description = '',
		canonical = '',
		ogImage = null,
		ogType = 'website',
		jsonLd = [],
		robots
	}: {
		title: string;
		description?: string | null;
		canonical?: string | null;
		ogImage?: string | null;
		ogType?: string;
		jsonLd?: Array<Record<string, unknown>>;
		robots?: string;
	} = $props();

	const jsonLdScripts = $derived(
		jsonLd.filter((entry) => entry && Object.keys(entry).length > 0)
	);
</script>

<svelte:head>
	<title>{title}</title>
	{#if description}
		<meta name="description" content={description} />
	{/if}
	{#if canonical}
		<link rel="canonical" href={canonical} />
	{/if}
	{#if robots}
		<meta name="robots" content={robots} />
	{/if}
	<meta property="og:title" content={title} />
	{#if description}
		<meta property="og:description" content={description} />
	{/if}
	{#if canonical}
		<meta property="og:url" content={canonical} />
	{/if}
	<meta property="og:type" content={ogType} />
	{#if ogImage}
		<meta property="og:image" content={ogImage} />
	{/if}
	{#each jsonLdScripts as schema, index (index)}
		{@html `<script type="application/ld+json">${JSON.stringify(schema)}</script>`}
	{/each}
</svelte:head>
