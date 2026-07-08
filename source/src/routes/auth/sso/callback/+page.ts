export const ssr = false;

export async function load({ url, parent }) {
	const { config } = await parent();
	const exchangeToken = url.searchParams.get('exchange_token');
	const redirect = url.searchParams.get('redirect');
	return { config, exchangeToken, redirect };
}
