<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { page } from '$app/stores';

	let { initialSearch = '' }: { initialSearch?: string } = $props();

	let query = $state('');

	$effect.pre(() => {
		query = initialSearch;
	});

	function handleSubmit(event: SubmitEvent) {
		event.preventDefault();
		const params = new URLSearchParams($page.url.searchParams);
		if (query.trim()) {
			params.set('search', query.trim());
		} else {
			params.delete('search');
		}
		params.delete('page');
		const search = params.toString();
		goto(`${resolve('/products')}${search ? `?${search}` : ''}`);
	}
</script>

<form class="search-bar" onsubmit={handleSubmit}>
	<input type="search" placeholder="Search products..." bind:value={query} />
	<button type="submit">Search</button>
</form>
