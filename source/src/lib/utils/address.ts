import type { ShippingAddress } from '$lib/types';

export function emptyAddress(): ShippingAddress {
	return {
		full_name: '',
		line1: '',
		line2: '',
		city: '',
		state: '',
		postal_code: '',
		country: ''
	};
}

export function formatAddressLines(address: Record<string, unknown> | null | undefined): string[] {
	if (!address) return [];
	const fields = [
		'full_name',
		'name',
		'line1',
		'line2',
		'city',
		'state',
		'postal_code',
		'country',
		'email',
		'phone'
	];
	return fields
		.map((field) => address[field])
		.filter((value): value is string => typeof value === 'string' && value.trim().length > 0);
}
