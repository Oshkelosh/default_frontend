export function formatAddressLines(address: Record<string, unknown> | null | undefined): string[] {
	if (!address) return [];
	const fields = ['name', 'line1', 'line2', 'city', 'state', 'postal_code', 'country', 'email', 'phone'];
	return fields
		.map((field) => address[field])
		.filter((value): value is string => typeof value === 'string' && value.trim().length > 0);
}
