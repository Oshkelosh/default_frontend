export const ssr = false;

export async function load({ url, parent }) {
	const { config } = await parent();
	const redirect = url.searchParams.get('redirect') ?? null;
	return { config, redirect };
}
