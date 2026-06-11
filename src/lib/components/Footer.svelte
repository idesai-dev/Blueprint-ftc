<script lang="ts">
	const year = new Date().getFullYear();
</script>

<footer class="footer">
	<div class="container container--wide inner">
		<div class="brand">
			<a href="/" class="logo">
				<span class="logo-mark">⬡</span>
				<span>Blueprint</span>
			</a>
			<p class="tagline">The FTC knowledge base</p>
		</div>

		<nav class="footer-nav" aria-label="Footer navigation">
			<a href="/">Home</a>
			<a href="/software">Software</a>
			<a href="/hardware">Hardware</a>
			<a href="/outreach">Outreach</a>
			<a href="/about">About</a>
		</nav>

		<p class="copy">&copy; {year} Blueprint - An open FTC knowledge base.</p>
	</div>
</footer>

<style>
	.footer {
		margin-top: auto;
		border-top: 1px solid var(--border-subtle);
		background: var(--bg-secondary);
		padding: 2.5rem 0 1.5rem;
	}

	.inner {
		display: grid;
		grid-template-columns: 1fr auto;
		grid-template-rows: auto auto;
		gap: 1rem 2rem;
		align-items: start;
	}

	.brand {
		display: flex;
		flex-direction: column;
		gap: 0.4rem;
	}

	.logo {
		display: flex;
		align-items: center;
		gap: 0.4rem;
		font-family: var(--font-sans);
		font-weight: 700;
		font-size: 1rem;
		color: var(--text-primary);
		text-decoration: none;
	}

	.logo:hover {
		color: var(--text-primary);
		opacity: 0.8;
	}

	.logo-mark {
		font-size: 1.2rem;
		background: var(--gradient-accent);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
	}

	.tagline {
		font-size: 0.82rem;
		color: var(--text-muted);
	}

	.footer-nav {
		display: flex;
		flex-direction: column;
		gap: 0.4rem;
		align-items: flex-end;
	}

	.footer-nav a {
		font-size: 0.85rem;
		color: var(--text-secondary);
		text-decoration: none;
		transition: color var(--transition-fast);
	}

	.footer-nav a:hover {
		color: var(--text-primary);
	}

	.copy {
		grid-column: 1 / -1;
		font-size: 0.75rem;
		color: var(--text-muted);
		border-top: 1px solid var(--border-subtle);
		padding-top: 1rem;
		margin-top: 0.5rem;
	}

	@media (max-width: 480px) {
		.inner {
			grid-template-columns: 1fr;
		}

		.footer-nav {
			flex-direction: row;
			align-items: flex-start;
			gap: 1rem;
		}
	}
</style>
