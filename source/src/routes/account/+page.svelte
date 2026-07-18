<script lang="ts">
	import { resolve } from '$app/paths';
	import { goto } from '$app/navigation';
	import AddressForm from '$lib/components/AddressForm.svelte';
	import PushNotifications from '$lib/components/PushNotifications.svelte';
	import SeoHead from '$lib/components/SeoHead.svelte';
	import { resendVerification, updateProfile } from '$lib/api/auth';
	import { authState, logout, refreshUser } from '$lib/auth/session.svelte';
	import { ApiError } from '$lib/types';
	import type { ShippingAddress } from '$lib/types';
	import { emptyAddress } from '$lib/utils/address';
	import { absoluteUrl } from '$lib/utils/seo';

	let { data } = $props();

	const site = $derived(data.config.site);
	const emailVerificationEnabled = $derived(data.config.auth?.email_verification_enabled ?? false);
	const user = $derived(authState.user);
	const hasPassword = $derived(authState.user?.auth_methods?.includes('password') ?? true);

	const memberSince = $derived(
		authState.user
			? new Date(authState.user.created_at).toLocaleDateString(undefined, {
					year: 'numeric',
					month: 'long',
					day: 'numeric'
				})
			: ''
	);

	const signInMethods = $derived(
		(authState.user?.auth_methods ?? [])
			.map((method) =>
				method === 'password'
					? 'Email & password'
					: method.charAt(0).toUpperCase() + method.slice(1)
			)
			.join(', ') || 'Email & password'
	);

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

	function sameAddress(a?: ShippingAddress | null, b?: ShippingAddress | null): boolean {
		if (!b) return true;
		if (!a) return false;
		return (
			JSON.stringify(addressPayload({ ...emptyAddress(), ...a })) ===
			JSON.stringify(addressPayload({ ...emptyAddress(), ...b }))
		);
	}

	// Prefill once from the profile loaded in +page.ts (initSession).
	const initial = authState.user;
	let fullName = $state(initial?.full_name ?? '');
	let phone = $state(initial?.phone ?? '');
	let shippingAddress = $state<ShippingAddress>({
		...emptyAddress(),
		...(initial?.default_shipping_address ?? {})
	});
	let billingAddress = $state<ShippingAddress>({
		...emptyAddress(),
		...(initial?.default_billing_address ?? {})
	});
	let billingSameAsShipping = $state(
		sameAddress(initial?.default_shipping_address, initial?.default_billing_address)
	);

	let profileSaving = $state(false);
	let profileMessage = $state<string | null>(null);
	let profileError = $state<string | null>(null);

	let addressSaving = $state(false);
	let addressMessage = $state<string | null>(null);
	let addressError = $state<string | null>(null);

	let currentPassword = $state('');
	let newPassword = $state('');
	let confirmPassword = $state('');
	let passwordSaving = $state(false);
	let passwordMessage = $state<string | null>(null);
	let passwordError = $state<string | null>(null);

	let resending = $state(false);
	let resent = $state(false);
	let resendError = $state<string | null>(null);

	function errorMessage(err: unknown, fallback: string): string {
		return err instanceof ApiError ? err.message : fallback;
	}

	async function saveProfile(event: SubmitEvent) {
		event.preventDefault();
		profileSaving = true;
		profileMessage = null;
		profileError = null;
		try {
			await updateProfile({ full_name: fullName.trim(), phone: phone.trim() });
			await refreshUser();
			profileMessage = 'Profile saved.';
		} catch (err) {
			profileError = errorMessage(err, 'Could not save profile.');
		} finally {
			profileSaving = false;
		}
	}

	async function saveAddresses(event: SubmitEvent) {
		event.preventDefault();
		addressSaving = true;
		addressMessage = null;
		addressError = null;
		try {
			await updateProfile({
				default_shipping_address: addressPayload(shippingAddress),
				default_billing_address: addressPayload(
					billingSameAsShipping ? shippingAddress : billingAddress
				)
			});
			await refreshUser();
			addressMessage = 'Addresses saved.';
		} catch (err) {
			addressError = errorMessage(err, 'Could not save addresses.');
		} finally {
			addressSaving = false;
		}
	}

	async function savePassword(event: SubmitEvent) {
		event.preventDefault();
		passwordMessage = null;
		passwordError = null;
		if (newPassword !== confirmPassword) {
			passwordError = 'Passwords do not match.';
			return;
		}
		passwordSaving = true;
		try {
			await updateProfile({
				password: newPassword,
				...(hasPassword ? { current_password: currentPassword } : {})
			});
			await refreshUser();
			currentPassword = '';
			newPassword = '';
			confirmPassword = '';
			passwordMessage = 'Password updated.';
		} catch (err) {
			passwordError = errorMessage(err, 'Could not update password.');
		} finally {
			passwordSaving = false;
		}
	}

	async function handleResend() {
		resending = true;
		resendError = null;
		try {
			await resendVerification();
			resent = true;
		} catch (err) {
			resendError = errorMessage(err, 'Could not send the verification email.');
		} finally {
			resending = false;
		}
	}

	async function handleLogout() {
		await logout();
		await goto(resolve('/'));
	}
</script>

<SeoHead title={`Account | ${site.store_name}`} canonical={absoluteUrl(site, '/account')} robots="noindex, nofollow" />

<div class="page-header">
	<h1>Account</h1>
</div>

{#if user}
	{#if emailVerificationEnabled && !user.verified}
		<div class="verify-banner" role="status">
			<p>Please verify your email. We sent a link to <strong>{user.email}</strong>.</p>
			<button
				type="button"
				class="btn btn--secondary"
				disabled={resending || resent}
				onclick={handleResend}
			>
				{resending ? 'Sending…' : resent ? 'Verification email sent' : 'Resend verification email'}
			</button>
			{#if resendError}
				<p class="product-card__error" role="alert">{resendError}</p>
			{/if}
		</div>
	{/if}

	<div class="account-sections">
		<section class="account-card">
			<h2>Overview</h2>
			<dl class="account-facts">
				<div>
					<dt>Email</dt>
					<dd>{user.email}</dd>
				</div>
				<div>
					<dt>Member since</dt>
					<dd>{memberSince}</dd>
				</div>
				<div>
					<dt>Sign-in methods</dt>
					<dd>{signInMethods}</dd>
				</div>
			</dl>
		</section>

		<section class="account-card">
			<h2>Profile</h2>
			<form class="auth-form" onsubmit={saveProfile}>
				<label>
					Full name
					<input type="text" bind:value={fullName} autocomplete="name" />
				</label>
				<label>
					Phone
					<input type="tel" bind:value={phone} autocomplete="tel" />
				</label>
				<button type="submit" class="btn btn--primary" disabled={profileSaving}>
					{profileSaving ? 'Saving…' : 'Save profile'}
				</button>
				{#if profileMessage}
					<p class="account-card__success" role="status">{profileMessage}</p>
				{/if}
				{#if profileError}
					<p class="product-card__error" role="alert">{profileError}</p>
				{/if}
			</form>
		</section>

		<section class="account-card">
			<h2>Addresses</h2>
			<form class="auth-form" onsubmit={saveAddresses}>
				<AddressForm bind:address={shippingAddress} title="Shipping address" required />

				<label class="checkbox-label">
					<input type="checkbox" bind:checked={billingSameAsShipping} />
					<span>Billing address same as shipping</span>
				</label>

				{#if !billingSameAsShipping}
					<AddressForm bind:address={billingAddress} title="Billing address" required />
				{/if}

				<button type="submit" class="btn btn--primary" disabled={addressSaving}>
					{addressSaving ? 'Saving…' : 'Save addresses'}
				</button>
				{#if addressMessage}
					<p class="account-card__success" role="status">{addressMessage}</p>
				{/if}
				{#if addressError}
					<p class="product-card__error" role="alert">{addressError}</p>
				{/if}
			</form>
		</section>

		<section class="account-card">
			<h2>{hasPassword ? 'Change password' : 'Set a password'}</h2>
			{#if !hasPassword}
				<p class="account-card__hint">
					You currently sign in with a linked account. Set a password to also sign in with your
					email address.
				</p>
			{/if}
			<form class="auth-form" onsubmit={savePassword}>
				{#if hasPassword}
					<label>
						Current password
						<input
							type="password"
							bind:value={currentPassword}
							required
							autocomplete="current-password"
						/>
					</label>
				{/if}
				<label>
					New password
					<input
						type="password"
						bind:value={newPassword}
						required
						minlength="8"
						autocomplete="new-password"
					/>
				</label>
				<label>
					Confirm new password
					<input
						type="password"
						bind:value={confirmPassword}
						required
						minlength="8"
						autocomplete="new-password"
					/>
				</label>
				<p class="account-card__hint">
					At least 8 characters, with an uppercase letter, a lowercase letter, and a digit.
				</p>
				<button type="submit" class="btn btn--primary" disabled={passwordSaving}>
					{passwordSaving ? 'Saving…' : hasPassword ? 'Change password' : 'Set password'}
				</button>
				{#if passwordMessage}
					<p class="account-card__success" role="status">{passwordMessage}</p>
				{/if}
				{#if passwordError}
					<p class="product-card__error" role="alert">{passwordError}</p>
				{/if}
			</form>
		</section>

		<PushNotifications
			push={data.config.notifications?.push}
			pushEnabled={user.push_enabled ?? false}
		/>

		<section class="account-card">
			<h2>Orders & session</h2>
			<div class="account-actions">
				<a href={resolve('/orders')} class="btn btn--secondary">View orders</a>
				<button type="button" class="btn btn--secondary" onclick={handleLogout}>Logout</button>
			</div>
		</section>
	</div>
{:else}
	<div class="auth-panel">
		<p class="cart-banner">Sign in to manage your account.</p>
		<a href={resolve('/login') + '?redirect=/account'} class="btn btn--primary account-signin">
			Sign in
		</a>
	</div>
{/if}

<style>
	.verify-banner {
		max-width: 560px;
		background: oklch(0.95 0.04 85);
		border: 1px solid oklch(0.85 0.08 85);
		color: oklch(0.35 0.06 85);
		padding: 0.75rem 1rem;
		border-radius: var(--radius);
		margin-bottom: 1.5rem;
		font-size: 0.875rem;
		line-height: 1.5;
		display: grid;
		gap: 0.75rem;
	}

	.verify-banner p {
		margin: 0;
	}

	.verify-banner .btn {
		justify-self: start;
	}

	.account-sections {
		display: grid;
		gap: 1.5rem;
		max-width: 560px;
	}

	.account-card {
		display: grid;
		gap: 1rem;
		padding: 1.25rem;
		border: 1px solid var(--clr-border);
		border-radius: var(--radius);
		background: white;
	}

	.account-card h2 {
		margin: 0;
		font-size: 1.125rem;
	}

	.account-facts {
		display: grid;
		gap: 0.75rem;
		margin: 0;
	}

	.account-facts dt {
		font-size: 0.8125rem;
		font-weight: 600;
		color: var(--clr-text-muted);
	}

	.account-facts dd {
		margin: 0;
		font-size: 0.9375rem;
	}

	.account-card__hint {
		margin: 0;
		font-size: 0.875rem;
		color: var(--clr-text-muted);
	}

	.account-card__success {
		margin: 0;
		font-size: 0.875rem;
		color: oklch(0.35 0.06 145);
	}

	.checkbox-label {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.875rem;
		cursor: pointer;
	}

	.account-actions {
		display: flex;
		gap: 0.5rem;
	}

	.account-signin {
		justify-self: start;
	}

	/* PushNotifications brings its own bottom margin; the grid gap covers spacing. */
	.account-sections :global(.push-card) {
		margin-bottom: 0;
		max-width: none;
	}
</style>
