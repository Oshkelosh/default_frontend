<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';

	let {
		currentPage,
		totalPages
	}: {
		currentPage: number;
		totalPages: number;
	} = $props();

	function goToPage(pageNum: number) {
		const params = new URLSearchParams($page.url.searchParams);
		if (pageNum <= 1) {
			params.delete('page');
		} else {
			params.set('page', String(pageNum));
		}
		const search = params.toString();
		goto(`${$page.url.pathname}${search ? `?${search}` : ''}`);
	}
</script>

{#if totalPages > 1}
	<nav class="pagination" aria-label="Pagination">
		<button type="button" disabled={currentPage <= 1} onclick={() => goToPage(currentPage - 1)}>
			Previous
		</button>
		<span>Page {currentPage} of {totalPages}</span>
		<button
			type="button"
			disabled={currentPage >= totalPages}
			onclick={() => goToPage(currentPage + 1)}
		>
			Next
		</button>
	</nav>
{/if}
