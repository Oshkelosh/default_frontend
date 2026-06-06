/** API origin. In dev, points at the FastAPI server; in production, same-origin (empty). */
export function getApiBase(): string {
	const configured = import.meta.env.VITE_API_BASE_URL;
	if (configured) {
		return configured.replace(/\/$/, '');
	}
	return import.meta.env.DEV ? 'http://127.0.0.1:8000' : '';
}

export function apiUrl(path: string): string {
	const normalized = path.startsWith('/') ? path : `/${path}`;
	return `${getApiBase()}${normalized}`;
}
