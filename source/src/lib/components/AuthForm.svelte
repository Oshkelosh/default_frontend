<script lang="ts">
	let {
		title,
		submitLabel,
		error = null,
		loading = false,
		onsubmit,
		children
	}: {
		title: string;
		submitLabel: string;
		error?: string | null;
		loading?: boolean;
		onsubmit: (event: SubmitEvent) => void | Promise<void>;
		children: import('svelte').Snippet;
	} = $props();
</script>

<div class="auth-form">
	<div class="page-header">
		<h1>{title}</h1>
	</div>

	{#if error}
		<div class="auth-form__error" role="alert">{error}</div>
	{/if}

	<form onsubmit={onsubmit}>
		{@render children()}
		<button type="submit" class="btn auth-form__submit" disabled={loading}>
			{loading ? 'Please wait…' : submitLabel}
		</button>
	</form>
</div>

<style>
	.auth-form {
		max-width: 420px;
		margin: 0 auto;
	}

	.auth-form form {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.auth-form__error {
		background: oklch(0.95 0.04 25);
		border: 1px solid oklch(0.85 0.08 25);
		color: oklch(0.35 0.08 25);
		padding: 0.75rem 1rem;
		border-radius: var(--radius);
		margin-bottom: 1rem;
		font-size: 0.875rem;
	}

	.auth-form__submit {
		margin-top: 0.5rem;
		width: 100%;
	}

	.auth-form__submit:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}
</style>
