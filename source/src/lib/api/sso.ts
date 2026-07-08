import { apiFetch } from './client';
import type { Token } from '$lib/types';

export async function exchangeSsoToken(exchangeToken: string): Promise<Token> {
	return apiFetch<Token>('/api/v1/tools/sso/exchange', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ exchange_token: exchangeToken })
	});
}
