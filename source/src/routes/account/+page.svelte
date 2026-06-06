<script lang="ts">
	import { resolve } from '$app/paths';
	import ErrorState from '$lib/components/ErrorState.svelte';
	import { logout } from '$lib/auth/session.svelte';
	import { goto } from '$app/navigation';

	let { data } = $props();

	const user = $derived(data.user);

	async function handleLogout() {
		await logout();
		await goto(resolve('/'));
	}
</script>

<svelte:head>
	<title>Account | {data.config.site.store_name}</title>
</svelte:head>

{#if data.error}
	<ErrorState message={data.error} />
{:else if user}
	<div class="account">
		<div class="page-header">
			<h1>Your account</h1>
		</div>

		<dl class="account__details">
			<div>
				<dt>Email</dt>
				<dd>{user.email}</dd>
			</div>
			{#if user.full_name}
				<div>
					<dt>Name</dt>
					<dd>{user.full_name}</dd>
				</div>
			{/if}
			<div>
				<dt>Member since</dt>
				<dd>{new Date(user.created_at).toLocaleDateString()}</dd>
			</div>
		</dl>

		<div class="account__actions">
			<a href={resolve('/orders')} class="btn">View orders</a>
			<button type="button" class="btn btn--secondary" onclick={handleLogout}>Sign out</button>
		</div>
	</div>
{/if}

<style>
	.account__details {
		display: grid;
		gap: 1rem;
		margin: 0 0 2rem;
	}

	.account__details dt {
		font-size: 0.75rem;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		color: var(--clr-muted);
		margin-bottom: 0.25rem;
	}

	.account__details dd {
		margin: 0;
		font-size: 1rem;
	}

	.account__actions {
		display: flex;
		flex-wrap: wrap;
		gap: 0.75rem;
	}

	.btn--secondary {
		background: white;
		color: var(--clr-text);
		border: 1px solid var(--clr-border);
	}
</style>
