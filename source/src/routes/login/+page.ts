export const ssr = false;

export async function load({ url, parent }) {
	const { config } = await parent();
	const redirect = url.searchParams.get('redirect') ?? null;
	const auth = url.searchParams.get('auth');
	const error = url.searchParams.get('error');
	return { config, redirect, auth, error };
}
