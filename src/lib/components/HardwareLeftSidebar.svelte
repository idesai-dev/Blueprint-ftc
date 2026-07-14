<script lang="ts">
	import { page } from '$app/stores';

	const groups = [
		{
			title: 'Drivetrain',
			links: [
				{ href: '/hardware/hardware-drivetrain-overview', label: 'Drivetrain Overview' },
				{ href: '/hardware/hardware-mecanum-wheels', label: 'Mecanum Wheels' },
				{ href: '/hardware/hardware-tank-drive', label: 'Tank Drive' }
			]
		},
		{
			title: 'Mechanisms',
			links: [
				{ href: '/hardware/hardware-linear-slides', label: 'Linear Slides' },
				{ href: '/hardware/hardware-arms', label: 'Arms' },
				{ href: '/hardware/hardware-intakes', label: 'Intakes' },
				{ href: '/hardware/hardware-claws', label: 'Claws & End Effectors' }
			]
		},
		{
			title: 'Electronics',
			links: [
				{ href: '/hardware/hardware-control-hub', label: 'Control Hub' },
				{ href: '/hardware/hardware-motors-servos-guide', label: 'Motors & Servos Guide' },
				{ href: '/hardware/hardware-wiring-best-practices', label: 'Wiring Best Practices' }
			]
		},
		{
			title: 'CAD & Design',
			links: [
				{ href: '/hardware/hardware-cad-intro', label: 'CAD Introduction' },
				{ href: '/hardware/hardware-design-principles', label: 'Design Principles' }
			]
		}
	];

	import { devModeState } from '$lib/stores/devMode.svelte';
	import SidebarSections from './SidebarSections.svelte';

	let { mode = 'article' } = $props();

	let currentPath = $derived($page.url.pathname);
	
	function getCompletedPaths() {
		if ($page.data.completedPaths) return $page.data.completedPaths;
		if ($page.data.posts) {
			return $page.data.posts
				.filter((p: any) => {
					const tags = (p.meta.tags || []).map((t: string) => t.toLowerCase());
					return tags.includes('completed');
				})
				.map((p: any) => {
					const sectionTag = p.meta.tags?.find((t: string) => 
						['software', 'hardware', 'outreach'].includes(t.toLowerCase())
					);
					return `/${(sectionTag || 'outreach').toLowerCase()}/${p.slug}`;
				});
		}
		return [currentPath];
	}

	let completedPaths = $derived(getCompletedPaths());

	// Filter and group posts dynamically by panelCategory
	let dynamicGroups = $derived(() => {
		if (!$page.data.posts) return groups;
		
		const allPosts = $page.data.posts;
		const sectionPosts = allPosts.filter((p: any) => 
			(p.meta.tags || []).some((t: string) => t.toLowerCase() === 'hardware')
		);

		const grouped = sectionPosts.reduce((acc: any, p: any) => {
			const cat = p.meta.panelCategory || 'General';
			if (!acc[cat]) acc[cat] = [];
			acc[cat].push({ 
				href: `/hardware/${p.slug}`, 
				label: p.meta.title,
				devOnly: (p.meta.tags || []).some((t: string) => t.toLowerCase() === 'coming soon')
			});
			return acc;
		}, {});

		const sortedCats = Object.keys(grouped).sort((a, b) => a.localeCompare(b));

		return sortedCats.map(title => ({
			title,
			links: grouped[title].sort((a: any, b: any) => a.label.localeCompare(b.label))
		}));
	});

	let baseGroups = $derived(
		dynamicGroups()
			.map((group) => {
				const visibleLinks = group.links.filter(
					(link: any) => devModeState.active || completedPaths.includes(link.href)
				);
				return { ...group, links: visibleLinks };
			})
			.filter((group) => group.links.length > 0)
	);

	// Context-aware visible groups
	let visibleGroups = $derived(
		mode === 'article'
			? baseGroups.filter((group) => group.links.some((link: any) => link.href === currentPath))
			: baseGroups
	);

	let activeGroup = $derived(
		baseGroups.find((group) => group.links.some((link: any) => link.href === currentPath))
	);
	let mobileOpen = $state(false);
	let expandedGroups = $state<Record<string, boolean>>({});

	// Initialize expansion state
	$effect(() => {
		// Expand all groups initially by default
		baseGroups.forEach(group => {
			expandedGroups[group.title] = true;
		});
	});

	function toggleGroup(title: string) {
		if (expandedGroups[title] === undefined) {
			expandedGroups[title] = false; // Toggle it from the implicit initial state
		}
		expandedGroups[title] = !expandedGroups[title];
	}

	import { slide, fade } from 'svelte/transition';
</script>

{#if visibleGroups.length > 0}
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	{#if mobileOpen}
		<div class="mobile-backdrop" transition:fade={{duration: 200}} onclick={() => (mobileOpen = false)}></div>
	{/if}

	<nav class="left-sidebar" class:mobile-open={mobileOpen} aria-label="Section navigation">
		<div class="sidebar-header-mobile">
			<button class="close-sidebar-btn" onclick={() => (mobileOpen = false)}>✕</button>
			<p class="sidebar-label">{activeGroup ? activeGroup.title : 'Navigation'}</p>
		</div>
		<div class="sidebar-scroll">
			<SidebarSections />
			<div class="sidebar-divider"></div>
			{#each visibleGroups as group}
				<div class="sidebar-group">
					<button 
						class="sidebar-label-button" 
						onclick={() => toggleGroup(group.title)}
						aria-expanded={expandedGroups[group.title] === true}
					>
						<span class="sidebar-label">{group.title}</span>
						<svg 
							class="chevron-icon" 
							class:rotated={expandedGroups[group.title] !== true}
							width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"
						>
							<polyline points="6 9 12 15 18 9"></polyline>
						</svg>
					</button>
					
					{#if expandedGroups[group.title] === true}
						<div transition:slide={{ duration: 250 }}>
							<ul class="sidebar-list">
								{#each group.links as { href, label }}
									<li class="sidebar-item">
										<a
											{href}
											class="sidebar-link"
											class:active={currentPath === href}
											onclick={() => (mobileOpen = false)}
										>
											{label}
										</a>
									</li>
								{/each}
							</ul>
						</div>
					{/if}
				</div>

				<div class="sidebar-divider"></div>
			{/each}
		</div>
	</nav>
	
	<button 
		class="mobile-toggle-fab" 
		onclick={() => (mobileOpen = !mobileOpen)} 
		aria-label="Toggle section navigation" 
		class:active={mobileOpen}
	>
		<div class="bot-icon-wrap">
			<svg
				width="20"
				height="20"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2.5"
				stroke-linecap="round"
				stroke-linejoin="round"
			>
				<line x1="4" y1="12" x2="20" y2="12"></line>
				<line x1="4" y1="6" x2="20" y2="6"></line>
				<line x1="4" y1="18" x2="20" y2="18"></line>
			</svg>
		</div>
	</button>
{/if}

<style>
	.left-sidebar {
		position: sticky;
		top: var(--header-height);
		width: 310px;
		flex-shrink: 0;
		padding-top: 3rem;
		padding-left: 0.5rem;
		padding-right: 1.5rem;
		border-right: 2.5px solid var(--border);
	}

	.sidebar-scroll {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.sidebar-header-mobile {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 0.5rem;
	}

	.close-sidebar-btn {
		display: none;
	}

	.sidebar-label {
		font-family: var(--font-sans);
		font-size: 0.72rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		color: var(--text-primary);
		line-height: 1;
	}

	.sidebar-label-button {
		display: flex;
		align-items: center;
		justify-content: space-between;
		width: 100%;
		background: var(--bg-card);
		border: 1px solid var(--border-subtle);
		border-radius: var(--radius-sm);
		padding: 0.35rem 0.6rem;
		cursor: pointer;
		box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
		margin-bottom: 0.5rem;
		transition: all var(--transition-fast);
	}

	.sidebar-label-button:hover {
		border-color: var(--text-primary);
		background: var(--bg-card-hover);
	}

	.chevron-icon {
		color: var(--text-muted);
		transition: transform var(--transition-base);
	}

	.chevron-icon.rotated {
		transform: rotate(-90deg);
	}

	.sidebar-list {
		list-style: none;
		padding: 0;
		margin: 0;
		display: flex;
		flex-direction: column;
		gap: 0.4rem;
		padding-right: 1rem;
		margin-bottom: 1rem;
	}

	.sidebar-link {
		display: block;
		font-size: 0.82rem;
		font-family: var(--font-body);
		color: var(--text-muted);
		text-decoration: none;
		border-radius: var(--radius-sm);
		padding: 0.35rem 0.5rem;
		transition: all var(--transition-fast);
		line-height: 1.4;
	}

	.sidebar-link:hover {
		color: var(--text-primary);
		background: rgba(116, 215, 237, 0.05);
	}

	.sidebar-link.active {
		color: var(--accent-green);
		background: rgba(126, 255, 160, 0.07);
		font-weight: 500;
	}

	.sidebar-divider {
		height: 1px;
		background: var(--border-subtle);
		margin: 0.5rem 1rem 1rem 0;
		opacity: 0.5;
	}

	.mobile-toggle-fab {
		display: none;
	}

	.mobile-backdrop {
		display: none;
	}

	@media (max-width: 1100px) {
		.mobile-toggle-fab {
			display: flex;
			align-items: center;
			justify-content: center;
			gap: 0.5rem;
			position: fixed;
			bottom: 1.5rem;
			left: 1.5rem;
			width: auto;
			padding: 0 1.25rem;
			height: 54px;
			background: var(--bg-card);
			border: 1px solid var(--border);
			border-radius: var(--radius-pill);
			color: var(--text-primary);
			cursor: pointer;
			box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4), var(--glow-cyan);
			z-index: 1000;
			transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
		}

		.mobile-toggle-fab::after {
			content: 'DOCS';
			font-family: var(--font-sans);
			font-size: 0.85rem;
			font-weight: 700;
			letter-spacing: 0.05em;
		}

		.mobile-toggle-fab:hover {
			transform: scale(1.05) translateY(-2px);
			border-color: var(--accent-cyan);
		}

		.mobile-toggle-fab.active {
			background: var(--bg-card);
			border-color: var(--accent-cyan);
		}

		.left-sidebar {
			position: fixed;
			top: 0;
			left: 0;
			width: min(320px, 85vw);
			height: 100vh;
			max-height: none;
			background: var(--bg);
			z-index: 1100;
			border-radius: 0;
			border-right: 1px solid var(--border);
			border-left: none;
			padding: 1.5rem;
			transform: translateX(-100%);
			transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
			display: flex;
			flex-direction: column;
			box-shadow: 20px 0 50px rgba(0,0,0,0.5);
		}

		.left-sidebar.mobile-open {
			transform: translateX(0);
		}

		.sidebar-header-mobile {
			display: flex;
			flex-direction: row;
			align-items: center;
			justify-content: space-between;
			margin-bottom: 2rem;
			padding-bottom: 1rem;
			border-bottom: 1px solid var(--border-subtle);
		}

		.close-sidebar-btn {
			display: block;
			background: none;
			border: none;
			color: var(--text-muted);
			font-size: 1.2rem;
			cursor: pointer;
		}

		.sidebar-scroll {
			flex: 1;
			overflow-y: auto;
			padding-right: 0.5rem;
		}

		.sidebar-link {
			padding: 0.8rem 1rem;
			background: var(--bg-card);
			border: 1px solid var(--border-subtle);
			border-radius: var(--radius-md);
			font-size: 0.95rem;
		}

		.sidebar-link.active {
			background: rgba(116, 215, 237, 0.1);
			border-color: var(--accent-cyan);
			color: var(--accent-cyan);
		}

		.mobile-backdrop {
			display: block;
			position: fixed;
			inset: 0;
			background: rgba(0, 0, 0, 0.6);
			backdrop-filter: blur(4px);
			z-index: 1050;
		}
	}
</style>
