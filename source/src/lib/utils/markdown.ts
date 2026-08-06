import { marked } from 'marked';
import DOMPurify from 'dompurify';

marked.setOptions({ gfm: true, breaks: true });

/** Render Markdown to sanitized HTML (client-only; routes use ssr=false). */
export function renderMarkdown(source: string): string {
	const raw = marked.parse(source || '', { async: false }) as string;
	if (typeof window === 'undefined') return raw;
	return DOMPurify.sanitize(raw);
}
