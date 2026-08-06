import { apiFetch } from './client';
import { ApiError } from '$lib/types';

export interface ArticleListItem {
	slug: string;
	title: string;
	published_at?: string | null;
	excerpt?: string;
}

export interface ArticlesHub {
	intro_title: string;
	intro_markdown: string;
	meta_title?: string | null;
	meta_description?: string | null;
	posts: ArticleListItem[];
}

export interface ArticlePost {
	slug: string;
	title: string;
	body_markdown: string;
	meta_title?: string | null;
	meta_description?: string | null;
	published_at?: string | null;
	updated_at?: string | null;
}

export async function getArticlesHub(): Promise<ArticlesHub> {
	return apiFetch<ArticlesHub>('/api/v1/tools/articles/hub');
}

export async function getArticleBySlug(slug: string): Promise<ArticlePost> {
	try {
		return await apiFetch<ArticlePost>(`/api/v1/tools/articles/posts/${encodeURIComponent(slug)}`);
	} catch (err) {
		if (err instanceof ApiError) throw err;
		throw err;
	}
}
