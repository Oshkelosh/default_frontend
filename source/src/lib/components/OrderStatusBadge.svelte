<script lang="ts">
	let { status }: { status: string } = $props();
</script>

<span class="order-status">{status}</span>

<style>
	.order-status {
		display: inline-block;
		padding: 0.125rem 0.5rem;
		border-radius: 999px;
		background: oklch(0.95 0.01 264);
		font-size: 0.75rem;
		font-weight: 600;
		text-transform: capitalize;
	}
</style>
