export interface PostMeta {
	title: string;
	date: string;
	description: string;
	tags?: string[];
	author?: string;
	cover?: string;
	published?: boolean;
	wordCount?: number;
	panelCategory?: string;
}

export interface Post {
	slug: string;
	meta: PostMeta;
}

/**
 * Format a date string for display.
 */
export function formatDate(dateStr: string): string {
	return new Date(dateStr).toLocaleDateString('en-US', {
		year: 'numeric',
		month: 'long',
		day: 'numeric',
		timeZone: 'UTC'
	});
}

/**
 * Returns a tag color class based on tag name, so it is consistent.
 */
const tagColors = ['tag--cyan', 'tag--green', 'tag--yellow'];
export function tagColor(tag: string): string {
	let hash = 0;
	if (tag.length === 0) return tagColors[0];
	for (let i = 0; i < tag.length; i++) {
		hash = tag.charCodeAt(i) + ((hash << 5) - hash);
		hash = hash & hash; // Convert to 32bit integer
	}
	const index = Math.abs(hash) % tagColors.length;
	return tagColors[index];
}

export async function getAllPosts(): Promise<Post[]> {
	const modules = import.meta.glob<{ metadata: PostMeta; default: any }>('/src/posts/*.md');

	const posts: (Post | null)[] = await Promise.all(
		Object.entries(modules).map(async ([path, resolver]) => {
			const { metadata } = await resolver();
			if (!metadata) return null;
			const slug = path.replace('/src/posts/', '').replace('.md', '');
			return { slug, meta: { ...metadata } };
		})
	);

	return (posts.filter((p) => p !== null) as Post[])
		.filter((p) => p.meta.published !== false)
		.sort((a, b) => new Date(b.meta.date).getTime() - new Date(a.meta.date).getTime());
}
