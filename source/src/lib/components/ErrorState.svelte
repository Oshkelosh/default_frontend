<script lang="ts">
	let {
		message,
		onRetry
	}: {
		message: string;
		onRetry?: () => void;
	} = $props();
</script>

<div class="error-state" role="alert">
	<p>{message}</p>
	{#if onRetry}
		<button type="button" class="btn btn--secondary" onclick={onRetry}>Try again</button>
	{/if}
</div>

<style>
	.error-state {
		padding: 1.5rem;
		border: 1px solid #fecaca;
		border-radius: var(--radius);
		background: #fef2f2;
		color: #991b1b;
	}

	.error-state p {
		margin: 0 0 1rem;
	}
</style>
