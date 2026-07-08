export const ssr = false;

export async function load({ url, parent }) {
	const { config } = await parent();
	const token = url.searchParams.get('token');
	return { config, token };
}
