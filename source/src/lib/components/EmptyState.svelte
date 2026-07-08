<script lang="ts">
	let { message }: { message: string } = $props();
</script>

<p class="empty-state">{message}</p>

<style>
	.empty-state {
		padding: 2rem;
		text-align: center;
		color: var(--clr-muted);
		border: 1px dashed var(--clr-border);
		border-radius: var(--radius);
	}
</style>
