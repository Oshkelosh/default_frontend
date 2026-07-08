<script lang="ts">
	import type { ShippingAddress } from '$lib/types';

	let {
		address = $bindable(),
		title = 'Address',
		required = false
	}: {
		address: ShippingAddress;
		title?: string;
		required?: boolean;
	} = $props();
</script>

<fieldset class="address-form">
	<legend>{title}</legend>

	<label>
		<span class="field-label">Full name</span>
		<input type="text" bind:value={address.name} autocomplete="name" {required} />
	</label>
	<label>
		<span class="field-label">Address line 1</span>
		<input type="text" bind:value={address.line1} autocomplete="address-line1" {required} />
	</label>
	<label>
		<span class="field-label">Address line 2</span>
		<input type="text" bind:value={address.line2} autocomplete="address-line2" />
	</label>
	<div class="address-form__row">
		<label>
			<span class="field-label">City</span>
			<input type="text" bind:value={address.city} autocomplete="address-level2" {required} />
		</label>
		<label>
			<span class="field-label">State / Province</span>
			<input type="text" bind:value={address.state} autocomplete="address-level1" />
		</label>
	</div>
	<div class="address-form__row">
		<label>
			<span class="field-label">Postal code</span>
			<input type="text" bind:value={address.postal_code} autocomplete="postal-code" {required} />
		</label>
		<label>
			<span class="field-label">Country</span>
			<input type="text" bind:value={address.country} autocomplete="country-name" {required} />
		</label>
	</div>
</fieldset>

<style>
	.address-form {
		border: 1px solid var(--clr-border);
		border-radius: var(--radius);
		padding: 1rem;
		margin: 0;
		display: flex;
		flex-direction: column;
		gap: 0.875rem;
	}

	.address-form legend {
		font-weight: 600;
		padding: 0 0.25rem;
	}

	.field-label {
		display: block;
		font-size: 0.875rem;
		font-weight: 500;
		margin-bottom: 0.375rem;
	}

	label input {
		width: 100%;
		padding: 0.625rem 0.875rem;
		border: 1px solid var(--clr-border);
		border-radius: var(--radius);
		font: inherit;
		box-sizing: border-box;
	}

	.address-form__row {
		display: grid;
		gap: 0.875rem;
	}

	@media (min-width: 640px) {
		.address-form__row {
			grid-template-columns: 1fr 1fr;
		}
	}
</style>
