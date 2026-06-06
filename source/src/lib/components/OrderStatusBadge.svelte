<script lang="ts">
	let { status }: { status: string } = $props();

	const label = $derived(status.charAt(0).toUpperCase() + status.slice(1));
</script>

<span class="order-status order-status--{status}">{label}</span>

<style>
	.order-status {
		display: inline-block;
		padding: 0.25rem 0.625rem;
		border-radius: 999px;
		font-size: 0.75rem;
		font-weight: 600;
		text-transform: capitalize;
	}

	.order-status--pending {
		background: oklch(0.95 0.04 85);
		color: oklch(0.4 0.08 85);
	}

	.order-status--paid {
		background: oklch(0.93 0.04 145);
		color: oklch(0.35 0.1 145);
	}

	.order-status--shipped,
	.order-status--delivered {
		background: oklch(0.93 0.04 250);
		color: oklch(0.35 0.1 250);
	}

	.order-status--cancelled {
		background: oklch(0.95 0.02 264);
		color: var(--clr-muted);
	}
</style>
