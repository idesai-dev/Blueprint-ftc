import { getAllPosts } from '$lib/utils/posts';

export const prerender = true;

const SITE_URL = 'https://ftcblueprint.com';

export async function GET() {
	const posts = await getAllPosts();

	const pages = [
		'',
		'/complete-rookie-guide',
		'/software',
		'/hardware',
		'/outreach',
		'/suggest',
		'/editor',
		'/simulators/pid',
		'/simulators/feedforward',
		'/simulators/motionprofile',
		'/simulators/pid-game',
		'/simulators/mecanum'
	];

	// Only index released guides
	const releasedPosts = posts.filter(
		(p) => !p.meta.tags?.includes('coming soon') && p.slug !== 'complete-rookie-guide'
	);

	const allUrls = [
		...pages.map((p) => `${SITE_URL}${p}`),
		...releasedPosts.map((p) => {
			let section = 'software';
			if (p.meta.tags?.includes('hardware')) section = 'hardware';
			else if (p.meta.tags?.includes('outreach')) section = 'outreach';
			return `${SITE_URL}/${section}/${p.slug}`;
		})
	];

	const xml = `<?xml version="1.0" encoding="UTF-8" ?>
<urlset xmlns="https://www.sitemaps.org/schemas/sitemap/0.9">
${allUrls
	.map(
		(url) => `    <url>
        <loc>${url}</loc>
        <changefreq>${url === SITE_URL ? 'daily' : 'weekly'}</changefreq>
        <priority>${url === SITE_URL ? '1.0' : '0.8'}</priority>
    </url>`
	)
	.join('\n')}
</urlset>`;

	return new Response(xml.trim(), {
		headers: {
			'Content-Type': 'application/xml',
			'Cache-Control': 'max-age=0, s-maxage=3600'
		}
	});
}
