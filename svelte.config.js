import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { mdsvex } from 'mdsvex';

import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

export default {
	extensions: ['.svelte', '.md'],
	preprocess: [vitePreprocess(), mdsvex({
		extensions: ['.md'],
		remarkPlugins: [remarkMath],
		rehypePlugins: [[rehypeKatex, { output: 'html' }]]
	})],
	kit: {
		adapter: adapter({
			fallback: '404.html'
		}),
		prerender: {
			entries: ['*', '/editor'],
			handleHttpError: ({ path, referrer, message }) => {
				if (message.includes('404')) {
					console.warn(`Warning: 404 on ${path} (linked from ${referrer})`);
					return;
				}
				throw new Error(message);
			},
			handleUnseenRoutes: 'ignore'
		}
	}
};
