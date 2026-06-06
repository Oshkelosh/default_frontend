<script lang="ts">
	let {
		message = 'Something went wrong.',
		onRetry
	}: {
		message?: string;
		onRetry?: () => void;
	} = $props();
</script>

<div class="error-state">
	<p>{message}</p>
	{#if onRetry}
		<button type="button" class="btn" onclick={onRetry}>Try again</button>
	{/if}
</div>
