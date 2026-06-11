<script lang="ts">
	import BlogCard from '$lib/components/BlogCard.svelte';
	import type { Post } from '$lib/utils/posts';
	import { onMount } from 'svelte';
	import { devModeState, initDevMode } from '$lib/stores/devMode.svelte';

	let { data }: { data: { recentPosts: Post[], completedCount: number } } = $props();

	onMount(() => {
		initDevMode();
	});

	onMount(() => {
		// Cursor glow
		const glow = document.getElementById('cursor-glow') as HTMLElement;
		if (!glow) return;

		let raf: number;
		let targetX = -600;
		let targetY = -600;
		let currentX = -600;
		let currentY = -600;
		const EASE = 0.07;

		const onMouseMove = (e: MouseEvent) => {
			targetX = e.clientX;
			targetY = e.clientY;
		};

		const render = () => {
			currentX += (targetX - currentX) * EASE;
			currentY += (targetY - currentY) * EASE;
			glow.style.transform = `translate(${currentX}px, ${currentY}px)`;
			raf = requestAnimationFrame(render);
		};

		const delayTimeout = setTimeout(() => {
			window.addEventListener('mousemove', onMouseMove, { passive: true });
			render();
			glow.style.opacity = '1';
		}, 800);

		return () => {
			clearTimeout(delayTimeout);
			window.removeEventListener('mousemove', onMouseMove);
			cancelAnimationFrame(raf);
		};
	});

	const visiblePosts = $derived(
		data.recentPosts
			.filter((p) => {
				if (devModeState.active) return true;
				const tags = (p.meta.tags || []).map((t) =>
					typeof t === 'string' ? t.toLowerCase().trim() : ''
				);
				return tags.includes('completed') || tags.includes('coming soon');
			})
			.slice(0, 3)
	);

	const features = [
		{
			icon: 'code',
			title: 'Software Guides',
			desc: 'PID, motion profiling, sensors, and autonomous programming - with real code.'
		},
		{
			icon: 'cpu',
			title: 'Interactive Simulators',
			desc: 'Visualize PID, feedforward, and mecanum kinematics in the browser.'
		},
		{
			icon: 'star',
			title: 'Portfolio & Code Reviews',
			desc: 'Get actionable feedback on your engineering portfolio and code from experienced alumni.'
		}
	];
</script>

<svelte:head>
	<title>Blueprint | FTC Knowledge Base</title>
	<meta name="description" content="Blueprint is the free technical reference for FIRST Tech Challenge - covering software, hardware, and outreach, written by FTC competitors." />
</svelte:head>

<!-- Cursor glow -->
<div id="cursor-glow" aria-hidden="true"></div>

<!-- Hero -->
<section class="hero">
	<div class="hero__inner container">
		<div class="hero__text">
			<div class="hero__label">Team Luminary #35300</div>
			<h1>The complete<br />FTC guide.</h1>
			<p class="hero__desc">
				Explore in-depth articles, interactive simulators, and real codebase examples built directly by FTC teams for FTC competitors.
			</p>
			<div class="hero__cta">
				<a href="/software" class="btn btn-primary" id="hero-read-btn">Browse articles</a>
				<a href="/simulators/pid" class="btn btn-ghost" id="hero-sim-btn">Open simulators</a>
			</div>
		</div>

		<div class="hero__features">
			{#each features as f, i}
				<div class="feature-row">
					<div class="feature-icon" aria-hidden="true">
						{#if f.icon === 'code'}
							<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
						{:else if f.icon === 'cpu'}
							<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/><line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/><line x1="20" y1="9" x2="23" y2="9"/><line x1="20" y1="14" x2="23" y2="14"/><line x1="1" y1="9" x2="4" y2="9"/><line x1="1" y1="14" x2="4" y2="14"/></svg>
						{:else}
							<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
						{/if}
					</div>
					<div class="feature-text">
						<span class="feature-title">{f.title}</span>
						<span class="feature-desc">{f.desc}</span>
					</div>
				</div>
			{/each}
		</div>
	</div>
</section>

<!-- Recent Articles -->
{#if visiblePosts.length > 0}
	<section class="recent">
		<div class="container">
			<div class="recent__header">
				<h2>Latest articles</h2>
				<a href="/software" class="view-all-link" id="home-view-all-link">View all -></a>
			</div>

			<div class="post-grid">
				{#each visiblePosts as post}
					<BlogCard {post} />
				{/each}
			</div>
		</div>
	</section>
{/if}

<style>
	/* -- Hero ----------------------------------------------- */
	.hero {
		border-bottom: 1px solid var(--border-subtle);
		background: var(--gradient-hero);
	}

	:global(html.dark) .hero {
		background: var(--bg-banner);
	}

	.hero__inner {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 4rem;
		align-items: center;
		padding-top: 5rem;
		padding-bottom: 5rem;
	}

	.hero__label {
		font-family: var(--font-mono);
		font-size: 0.72rem;
		font-weight: 500;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: var(--accent-cyan);
		margin-bottom: 1rem;
	}

	.hero__text h1 {
		font-family: var(--font-heading);
		font-size: clamp(3rem, 6vw, 4.5rem);
		font-weight: 700;
		line-height: 1.1;
		letter-spacing: -0.03em;
		color: var(--text-primary);
		margin-bottom: 1.25rem;
	}

	.hero__desc {
		font-size: 1.05rem;
		color: var(--text-secondary);
		line-height: 1.7;
		max-width: 420px;
		margin-bottom: 2rem;
	}

	.hero__cta {
		display: flex;
		gap: 0.75rem;
		flex-wrap: wrap;
	}

	/* -- Feature list ------------------------------------- */
	.hero__features {
		display: flex;
		flex-direction: column;
		gap: 0;
		border: 1px solid var(--border);
		border-radius: var(--radius-lg);
		background: var(--gradient-card);
		overflow: hidden;
	}

	.feature-row {
		display: flex;
		align-items: flex-start;
		gap: 1rem;
		padding: 1.4rem 1.75rem;
		border-bottom: 1px solid var(--border-subtle);
		transition: background var(--transition-base);
	}

	.feature-row:last-child {
		border-bottom: none;
	}

	.feature-row:hover {
		background: var(--bg-card-hover);
	}

	.feature-icon {
		flex-shrink: 0;
		width: 36px;
		height: 36px;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: var(--radius-sm);
		background: var(--bg-secondary);
		color: var(--text-primary);
		border: 1px solid var(--border);
		margin-top: 2px;
	}

	.feature-text {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.feature-title {
		font-family: var(--font-sans);
		font-size: 0.9rem;
		font-weight: 600;
		color: var(--text-primary);
		line-height: 1.2;
	}

	.feature-desc {
		font-size: 0.83rem;
		color: var(--text-secondary);
		line-height: 1.55;
	}

	/* -- Buttons ------------------------------------------ */
	.btn {
		display: inline-flex;
		align-items: center;
		gap: 0.4rem;
		padding: 0.6em 1.4em;
		border-radius: var(--radius-md);
		font-family: var(--font-sans);
		font-size: 0.9rem;
		font-weight: 500;
		text-decoration: none;
		cursor: pointer;
		border: 1px solid transparent;
		transition:
			background var(--transition-base),
			border-color var(--transition-base),
			color var(--transition-base),
			box-shadow var(--transition-base),
			transform var(--transition-fast);
	}

	.btn:hover { transform: translateY(-1px); }
	.btn:active { transform: translateY(0); }

	.btn-primary {
		background: var(--text-primary);
		color: var(--bg);
		border-color: var(--text-primary);
	}

	.btn-primary:hover {
		background: var(--accent-cyan);
		border-color: var(--accent-cyan);
		color: #ffffff;
	}

	.btn-ghost {
		background: transparent;
		color: var(--text-secondary);
		border-color: var(--border);
	}

	.btn-ghost:hover {
		background: var(--bg-secondary);
		border-color: var(--text-primary);
		color: var(--text-primary);
	}

	/* -- Recent articles ---------------------------------- */
	.recent {
		padding: 4rem 0 5rem;
	}

	.recent__header {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		margin-bottom: 2rem;
	}

	.recent__header h2 {
		font-size: 1.5rem;
		font-weight: 600;
		color: var(--text-primary);
	}

	.view-all-link {
		font-size: 0.85rem;
		font-weight: 500;
		color: var(--text-secondary);
		text-decoration: none;
		transition: color var(--transition-fast);
	}

	.view-all-link:hover {
		color: var(--text-primary);
	}

	.post-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 1.25rem;
	}

	/* -- Responsive --------------------------------------- */
	@media (max-width: 900px) {
		.hero__inner {
			grid-template-columns: 1fr;
			gap: 2.5rem;
			padding-top: 3.5rem;
			padding-bottom: 3.5rem;
		}

		.post-grid {
			grid-template-columns: 1fr 1fr;
		}
	}

	@media (max-width: 600px) {
		.post-grid {
			grid-template-columns: 1fr;
		}
	}
</style>
