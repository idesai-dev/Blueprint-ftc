<script lang="ts">
	import type { Post } from '$lib/utils/posts';
	import HardwareLeftSidebar from '$lib/components/HardwareLeftSidebar.svelte';
	import DocIndex from '$lib/components/DocIndex.svelte';

	let { data }: { data: { posts: Post[] } } = $props();

	const completedCount = $derived(
		data.posts.filter((p) => (p.meta.tags || []).includes('completed')).length
	);
</script>

<svelte:head>
	<title>Hardware | Blueprint</title>
	<meta name="description" content="FTC hardware documentation: CAD, drivetrains, mechanisms, wiring, and weight." />
</svelte:head>

<div class="directory-container">
	<div class="main-layout">
		<HardwareLeftSidebar mode="section" />
		<div class="content-feed">
			<section class="blog-header">
				<div class="blog-header-inner">
					<div class="header-text">
						<h1>Hardware</h1>
						<p class="sub">{completedCount} article{completedCount !== 1 ? 's' : ''}</p>
					</div>
					<a href="/review?tab=cad" class="review-link">Get a CAD Review →</a>
				</div>
			</section>

			<section class="index-section">
				<div class="container">
					<DocIndex posts={data.posts} section="hardware" />
				</div>
			</section>
		</div>
	</div>
</div>

<style>
	.directory-container {
		display: flex;
		flex-direction: column;
		width: 100%;
		max-width: 100%;
		margin: 0 auto;
	}

	.main-layout {
		display: flex;
		flex-direction: column;
		gap: 0;
		width: 100%;
		margin: 0;
		padding: 0;
	}

	.content-feed {
		flex: 1;
		min-width: 0;
		padding-top: 0;
	}

	@media (min-width: 1101px) {
		.main-layout {
			flex-direction: row;
			padding: 0 0 0 1.5rem;
			gap: 0;
		}
	}

	.blog-header {
		padding: 2.25rem 3rem 1.75rem;
		background: transparent;
		border-bottom: 1px solid var(--border-subtle);
		width: 100%;
	}

	.blog-header-inner {
		max-width: 1150px;
		display: flex;
		flex-wrap: wrap;
		justify-content: space-between;
		align-items: center;
		gap: 2rem;
	}

	.header-text {
		display: flex;
		flex-direction: column;
		gap: 0.4rem;
		flex: 1;
		min-width: 300px;
	}

	h1 {
		font-size: 1.9rem;
		font-weight: 700;
		line-height: 1.15;
		letter-spacing: -0.02em;
		margin: 0;
	}

	.sub {
		font-size: 0.8rem;
		font-family: var(--font-mono);
		color: var(--text-muted);
	}

	.index-section {
		padding: 2.5rem 0 5rem;
	}

	.review-link {
		display: inline-flex;
		align-items: center;
		padding: 0.6rem 1.2rem;
		background: var(--bg-card);
		border: 1px solid var(--border);
		border-radius: var(--radius-md);
		color: var(--text-primary);
		font-size: 0.85rem;
		font-weight: 500;
		text-decoration: none;
		transition: all var(--transition-fast);
	}

	.review-link:hover {
		background: var(--bg-card-hover);
		border-color: var(--text-primary);
	}

	@media (max-width: 640px) {
		.blog-header {
			padding: 1.75rem 1.5rem;
		}

		.header-text {
			min-width: 0;
		}
	}
</style>
