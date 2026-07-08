<script lang="ts">
	import { resolve } from '$app/paths';

	let {
		currentPage,
		totalPages
	}: {
		currentPage: number;
		totalPages: number;
	} = $props();
</script>

{#if totalPages > 1}
	<nav class="pagination" aria-label="Pagination">
		{#if currentPage > 1}
			<a href={resolve('/products') + `?page=${currentPage - 1}`}>Previous</a>
		{/if}
		<span>Page {currentPage} of {totalPages}</span>
		{#if currentPage < totalPages}
			<a href={resolve('/products') + `?page=${currentPage + 1}`}>Next</a>
		{/if}
	</nav>
{/if}

<style>
	.pagination {
		display: flex;
		justify-content: center;
		align-items: center;
		gap: 1rem;
		margin-top: 2rem;
	}
</style>
