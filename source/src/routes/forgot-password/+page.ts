export const ssr = false;

export async function load({ url, parent }) {
	const { config } = await parent();
	const auth = url.searchParams.get('auth');
	return { config, auth };
}
