<script lang="ts">
</script>

<svelte:head>
	<title>About | Blueprint</title>
	<meta
		name="description"
		content="Learn more about Luminary Robotics (FTC Team 35300) and the creators of Blueprint."
	/>
</svelte:head>

<header class="post-header text-center">
	<div class="post-header-bg" aria-hidden="true"></div>
	<div class="container container--narrow">
		<div class="animate-fade-up" style="margin-bottom: 1rem;">
			<span class="badge">FTC Team 35300</span>
		</div>
		<h1 class="post-title animate-fade-up" style="animation-delay:60ms; margin: 0 auto 1rem;">Luminary Robotics</h1>
		<p class="subtitle animate-fade-up" style="animation-delay:120ms">
			An elite competitive robotics organization building the future through engineering, community outreach, and STEM education.
		</p>
		<div class="title-rule animate-fade-up mx-auto" style="animation-delay:180ms" aria-hidden="true"></div>
	</div>
</header>

<section class="about-section">
	<div class="container">
		<div class="about-grid animate-fade-up" style="animation-delay: 200ms">
			
			<div class="main-content">
				<h2>The Origin Story</h2>
				<p>
					Luminary Robotics is a rookie team formed from the merger of four veteran teams: <strong>Hunga Munga</strong>, <strong>Slingshot</strong>, <strong>ChaiGPT</strong>, and <strong>Shooting Stars</strong>. Based in Austin, Texas, our roster brings together years of competitive experience and technical expertise.
				</p>
				<p>
					We created <strong>Blueprint</strong> as a digital notebook and resource hub to document our journey, share our engineering processes, and give back to the FTC community.
				</p>



				<h2 style="margin-top: 3rem;">Get in Touch</h2>
				<p>
					Check out our <a href="https://luminaryrobotics.org" target="_blank" rel="noopener noreferrer">official team website</a> or watch our matches and reveals on <a href="https://youtube.com/@luminaryrobotics" target="_blank" rel="noopener noreferrer">YouTube</a>.
				</p>
			</div>

			<aside class="sidebar">
				<div class="sidebar-card">
					<div class="sidebar-icon">⬡</div>
					<h4>The Creators</h4>
					<p>
						<strong>Ishaan Desai</strong> & <strong>Arnav Saraf</strong><br>
						Members of legacy team Slingshot (FTC 20240), now engineering the future with Luminary Robotics.
					</p>
					<div class="sidebar-links">
						<a href="/software" class="sidebar-link">
							Read the prints →
						</a>
					</div>
				</div>

				<div class="sidebar-card sidebar-card--muted">
					<h4>Core Values</h4>
					<ul class="stack-list">
						<li><span class="tag tag--cyan">Clarity</span></li>
						<li><span class="tag tag--green">Simplicity</span></li>
						<li><span class="tag tag--yellow">Results</span></li>
					</ul>
				</div>
			</aside>

		</div>
	</div>
</section>

<style>
	.post-header {
		position: relative;
		padding: 4rem 0 3rem;
		border-bottom: 1px solid var(--border-subtle);
		background: var(--gradient-hero);
		overflow: hidden;
		text-align: center;
	}

	.post-header .container {
		position: relative;
		z-index: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.post-header h1 {
		font-size: clamp(2.5rem, 8vw, 4rem);
		line-height: 1.1;
		max-width: 800px;
	}

	.subtitle {
		font-size: 1.15rem;
		color: var(--text-secondary);
		max-width: 680px;
		margin: 0 auto;
		line-height: 1.6;
	}

	.title-rule {
		height: 2px;
		background: var(--gradient-accent);
		border-radius: 2px;
		width: 60px;
		opacity: 0.6;
		margin: 1.5rem auto 0;
	}

	.badge {
		display: inline-block;
		padding: 0.3rem 0.8rem;
		background: rgba(116, 215, 237, 0.1);
		color: var(--accent-cyan);
		border-radius: var(--radius-pill);
		font-size: 0.75rem;
		font-family: var(--font-mono);
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.about-section {
		padding: 4rem 0 8rem;
	}

	.about-grid {
		display: grid;
		grid-template-columns: 1fr 300px;
		gap: 4rem;
		align-items: start;
	}

	@media (max-width: 820px) {
		.about-grid {
			grid-template-columns: 1fr;
			gap: 3rem;
		}
	}

	.main-content h2 {
		font-size: 1.75rem;
		margin-bottom: 1rem;
		color: var(--text-primary);
	}

	.main-content p {
		color: var(--text-body);
		line-height: 1.8;
		margin-bottom: 1.25rem;
		font-size: 1.05rem;
	}

	.main-content a {
		color: var(--accent-cyan);
		text-decoration: none;
		border-bottom: 1px solid transparent;
		transition: border-color var(--transition-fast);
	}

	.main-content a:hover {
		border-color: var(--accent-cyan);
	}

	.main-content strong {
		color: var(--text-primary);
		font-weight: 600;
	}



	/* Sidebar */
	.sidebar {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	.sidebar-card {
		background: var(--bg-card);
		border: 1px solid var(--border);
		border-radius: var(--radius-lg);
		padding: 1.5rem;
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.sidebar-card--muted {
		background: var(--bg-secondary);
	}

	.sidebar-icon {
		font-size: 1.8rem;
		color: var(--accent-cyan);
		line-height: 1;
		margin-bottom: 0.5rem;
	}

	.sidebar-card h4 {
		font-size: 1.1rem;
		font-weight: 600;
		color: var(--text-primary);
		margin-bottom: 0.25rem;
	}

	.sidebar-card p {
		font-size: 0.9rem;
		color: var(--text-secondary);
		line-height: 1.6;
	}

	.sidebar-links {
		margin-top: 0.5rem;
		padding-top: 1rem;
		border-top: 1px solid var(--border);
	}

	.sidebar-link {
		font-size: 0.9rem;
		font-weight: 500;
		color: var(--text-primary);
		text-decoration: none;
		transition: color var(--transition-fast);
	}

	.sidebar-link:hover {
		color: var(--accent-cyan);
	}

	.stack-list {
		list-style: none;
		padding: 0;
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
	}
</style>
