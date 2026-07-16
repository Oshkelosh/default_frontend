import { requireAuth } from '$lib/auth/guards';
import { initSession } from '$lib/auth/session.svelte';

export const ssr = false;

export async function load({ parent, url }) {
	// Load the profile first so the page can prefill forms from authState.
	await initSession();
	requireAuth(url.pathname);
	const { config } = await parent();
	return { config };
}
