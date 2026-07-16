<script lang="ts">
	import { resolve } from '$app/paths';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import AddressForm from '$lib/components/AddressForm.svelte';
	import SeoHead from '$lib/components/SeoHead.svelte';
	import { authState, login, logout, register } from '$lib/auth/session.svelte';
	import { ApiError } from '$lib/types';
	import type { ShippingAddress } from '$lib/types';
	import { emptyAddress } from '$lib/utils/address';
	import { absoluteUrl } from '$lib/utils/seo';

	let { data } = $props();

	const site = $derived(data.config.site);
	const returnTo = $derived(page.url.searchParams.get('returnTo') ?? '/');
	const emailVerificationEnabled = $derived(data.config.auth?.email_verification_enabled ?? false);

	let mode = $state<'login' | 'register'>('login');
	let email = $state('');
	let password = $state('');
	let shippingAddress = $state(emptyAddress());
	let billingAddress = $state(emptyAddress());
	let billingSameAsShipping = $state(true);
	let error = $state<string | null>(null);
	let submitting = $state(false);

	function addressPayload(address: ShippingAddress) {
		return {
			full_name: address.full_name?.trim() || null,
			line1: address.line1?.trim() ?? '',
			line2: address.line2?.trim() || null,
			city: address.city?.trim() ?? '',
			state: address.state?.trim() || null,
			postal_code: address.postal_code?.trim() ?? '',
			country: address.country?.trim() ?? ''
		};
	}

	async function handleLogin(event: SubmitEvent) {
		event.preventDefault();
		submitting = true;
		error = null;
		try {
			await login({ email, password });
			await goto(returnTo.startsWith('/') ? returnTo : resolve('/'));
		} catch (err) {
			error = err instanceof Error ? err.message : 'Login failed';
		} finally {
			submitting = false;
		}
	}

	async function handleRegister(event: SubmitEvent) {
		event.preventDefault();
		submitting = true;
		error = null;
		try {
			await register({
				email,
				password,
				full_name: shippingAddress.full_name?.trim() || null,
				default_shipping_address: addressPayload(shippingAddress),
				billing_same_as_shipping: billingSameAsShipping,
				...(billingSameAsShipping
					? {}
					: { default_billing_address: addressPayload(billingAddress) })
			});
			await goto(returnTo.startsWith('/') ? returnTo : resolve('/'));
		} catch (err) {
			error = err instanceof ApiError ? err.message : 'Registration failed';
		} finally {
			submitting = false;
		}
	}

	async function handleLogout() {
		await logout();
		await goto(resolve('/'));
	}
</script>

<SeoHead title={`Account | ${site.store_name}`} canonical={absoluteUrl(site, '/account')} />

<div class="page-header">
	<h1>Account</h1>
</div>

{#if authState.user}
	{#if emailVerificationEnabled && !authState.user.verified}
		<div class="verify-banner" role="status">
			Please verify your email. We sent a link to <strong>{authState.user.email}</strong>.
		</div>
	{/if}

	<div class="auth-panel">
		<p>Signed in as <strong>{authState.user.email}</strong></p>
		{#if authState.user.full_name}
			<p>{authState.user.full_name}</p>
		{/if}

		<div class="auth-tabs">
			<a href={resolve('/orders')} class="btn btn--secondary">Orders</a>
			<button type="button" class="btn btn--secondary" onclick={handleLogout}>Logout</button>
		</div>
	</div>
{:else}
	<div class="auth-panel">
		<p class="cart-banner">
			Sign in or create an account to sync your cart and checkout.
		</p>

		<div class="auth-tabs">
			<button
				type="button"
				class="btn"
				class:btn--primary={mode === 'login'}
				class:btn--secondary={mode !== 'login'}
				onclick={() => (mode = 'login')}
			>
				Login
			</button>
			<button
				type="button"
				class="btn"
				class:btn--primary={mode === 'register'}
				class:btn--secondary={mode !== 'register'}
				onclick={() => (mode = 'register')}
			>
				Register
			</button>
		</div>

		{#if mode === 'login'}
			<form class="auth-form" onsubmit={handleLogin}>
				<label>
					Email
					<input type="email" bind:value={email} required autocomplete="email" />
				</label>
				<label>
					Password
					<input
						type="password"
						bind:value={password}
						required
						autocomplete="current-password"
					/>
				</label>
				<button type="submit" class="btn btn--primary" disabled={submitting}>
					{submitting ? 'Signing in…' : 'Sign in'}
				</button>
			</form>
		{:else}
			<form class="auth-form" onsubmit={handleRegister}>
				<label>
					Email
					<input type="email" bind:value={email} required autocomplete="email" />
				</label>
				<label>
					Password
					<input
						type="password"
						bind:value={password}
						required
						minlength="8"
						autocomplete="new-password"
					/>
				</label>

				<AddressForm bind:address={shippingAddress} title="Shipping address" required />

				<label class="checkbox-label">
					<input type="checkbox" bind:checked={billingSameAsShipping} />
					<span>Billing address same as shipping</span>
				</label>

				{#if !billingSameAsShipping}
					<AddressForm bind:address={billingAddress} title="Billing address" required />
				{/if}

				<button type="submit" class="btn btn--primary" disabled={submitting}>
					{submitting ? 'Creating account…' : 'Create account'}
				</button>
			</form>
		{/if}

		{#if error}
			<p class="product-card__error" role="alert">{error}</p>
		{/if}
	</div>
{/if}

<style>
	.verify-banner {
		background: oklch(0.95 0.04 85);
		border: 1px solid oklch(0.85 0.08 85);
		color: oklch(0.35 0.06 85);
		padding: 0.75rem 1rem;
		border-radius: var(--radius);
		margin-bottom: 1rem;
		font-size: 0.875rem;
		line-height: 1.5;
	}

	.checkbox-label {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.875rem;
		cursor: pointer;
	}
</style>
