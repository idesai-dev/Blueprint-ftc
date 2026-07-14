<script lang="ts">
	import { page } from '$app/stores';

	const sections = [
		{ href: '/software', label: 'Software', icon: 'code', match: '/software' },
		{ href: '/hardware', label: 'Hardware', icon: 'wrench', match: '/hardware' },
		{ href: '/outreach', label: 'Outreach', icon: 'people', match: '/outreach' },
		{ href: '/simulators/pid', label: 'Simulators', icon: 'wave', match: '/simulators' },
		{ href: '/complete-rookie-guide', label: 'Rookie Guide', icon: 'book', match: '/complete-rookie-guide' },
		{ href: '/review', label: 'Get a Review', icon: 'check', match: '/review' }
	];

	let path = $derived($page.url.pathname);
	const isActive = (m: string) => path === m || path.startsWith(m + '/');
</script>

<nav class="sections" aria-label="Sections">
	{#each sections as s}
		<a href={s.href} class="section" class:active={isActive(s.match)} aria-current={isActive(s.match) ? 'page' : undefined}>
			<span class="icon" aria-hidden="true">
				{#if s.icon === 'code'}
					<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
				{:else if s.icon === 'wrench'}
					<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
				{:else if s.icon === 'people'}
					<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
				{:else if s.icon === 'wave'}
					<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12h4l3 8 4-16 3 8h4"/></svg>
				{:else if s.icon === 'book'}
					<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
				{:else}
					<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 12l2 2 4-4"/><path d="M12 3l1.9 3.8 4.2.6-3 3 .7 4.2-3.8-2-3.8 2 .7-4.2-3-3 4.2-.6z"/></svg>
				{/if}
			</span>
			<span class="label">{s.label}</span>
		</a>
	{/each}
</nav>

<style>
	.sections {
		display: flex;
		flex-direction: column;
		gap: 2px;
		margin-bottom: 1.25rem;
	}

	.section {
		display: flex;
		align-items: center;
		gap: 0.65rem;
		padding: 0.5rem 0.65rem;
		border-radius: var(--radius-sm);
		text-decoration: none;
		color: var(--text-secondary);
		font-size: 0.9rem;
		font-weight: 500;
		transition: background var(--transition-fast), color var(--transition-fast);
	}

	.section:hover {
		background: var(--bg-secondary);
		color: var(--text-primary);
	}

	.section.active {
		background: var(--bg-card-hover);
		color: var(--text-primary);
		font-weight: 600;
	}

	.icon {
		display: inline-flex;
		flex-shrink: 0;
		color: var(--text-muted);
	}

	.icon svg {
		width: 17px;
		height: 17px;
	}

	.section:hover .icon,
	.section.active .icon {
		color: var(--accent-cyan);
	}
</style>
