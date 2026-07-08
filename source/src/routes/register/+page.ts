export const ssr = false;

export async function load({ parent }) {
	const { config } = await parent();
	return { config };
}
