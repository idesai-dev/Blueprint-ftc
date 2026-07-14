<script lang="ts">
	import { onMount } from 'svelte';

	const P_SCALE = 0.08;
	const I_SCALE = 0.004;
	const D_SCALE = 0.22;
	const F_SCALE = 30;
	const MAX_INTEG = 2000;
	const ROBOT_SZ = 44;
	const GAME_H = 320;
	const TRAIL_MAX = 80;
	const ERR_MAX = 200;

	type RobotConfig = {
		id: string;
		name: string;
		color: string;
		border: string;
		mass: number;
		damping: number;
		stiction: number;
		optP: number;
		optI: number;
		optD: number;
		optF: number;
		hint: string;
	};

	const COLOR_PALETTE = [
		['#74D7ED', '#3DB8D5'],
		['#FCD34D', '#EAB308'],
		['#34D399', '#059669'],
		['#A78BFA', '#8B5CF6'],
		['#FB7185', '#E11D48'],
		['#60A5FA', '#2563EB'],
		['#F97316', '#EA580C'],
		['#22C55E', '#16A34A']
	] as const;

	function rand(min: number, max: number) {
		return min + Math.random() * (max - min);
	}

	function pick<T>(arr: readonly T[]) {
		return arr[Math.floor(Math.random() * arr.length)];
	}

	function randomRobot(): RobotConfig {
		const [color, border] = pick(COLOR_PALETTE);
		const mass = Number(rand(0.5, 3.0).toFixed(2));
		const damping = Number(rand(0.78, 0.93).toFixed(2));
		const stiction = Math.random() < 0.35 ? Number(rand(0.03, 0.14).toFixed(3)) : 0;

		const optP = Number(rand(0.03, 0.18).toFixed(3));
		const optI = Number(rand(0.0002, 0.006).toFixed(4));
		const optD = Number(rand(0.04, 0.42).toFixed(3));
		const optF = stiction > 0 ? Number(rand(0.01, 0.04).toFixed(3)) : 0;

		const hints = [
			'Try increasing P until it starts to oscillate, then add D to calm it down.',
			'Small P changes can make a huge difference on this configuration.',
			'If it stops short, a touch of P may help it settle.',
			'This setup responds fast, but can get unstable if overdriven.',
			'The best tuning usually comes from balancing P and D first.'
		];

		return {
			id: crypto.randomUUID(),
			name: 'Hidden Robot',
			color,
			border,
			mass,
			damping,
			stiction,
			optP,
			optI,
			optD,
			optF,
			hint: pick(hints)
		};
	}

	let robot = $state<RobotConfig>(randomRobot());

	let gameArea: HTMLDivElement;
	let gameWidth = $state(600);

	let homeX = $derived(gameWidth / 2);
	let homeY = $state(GAME_H / 2);

	let rx = $state(0);
	let ry = $state(0);
	let vx = 0,
		vy = 0;

	let kP = $state(0.08);
	let kI = $state(0.0);
	let kD = $state(0.16);
	let kF = $state(0);

	let integX = 0,
		integY = 0;
	let prevEX = 0,
		prevEY = 0;

	type Pt = { x: number; y: number; age: number };
	let trail = $state<Pt[]>([]);
	let errHist = $state<number[]>([]);
	let releaseErr = $state(1);

	let isDragging = $state(false);
	let isRunning = $state(false);
	let simTick = 0;

	let hintVisible = $state(false);
	let runStartMs = $state<number | null>(null);
	let elapsedSec = $state(0);

	let rafId: number;
	let lastT = 0;

	onMount(() => {
		function updateSize() {
			if (!gameArea) return;
			gameWidth = gameArea.clientWidth;
			if (!isRunning && !isDragging) {
				rx = gameWidth / 2;
				ry = GAME_H / 2;
			}
		}

		updateSize();
		const ro = new ResizeObserver(updateSize);
		ro.observe(gameArea);

		lastT = performance.now();
		rafId = requestAnimationFrame(tick);

		return () => {
			cancelAnimationFrame(rafId);
			ro.disconnect();
		};
	});

	function tick(now: number) {
		const dt = now - lastT;
		lastT = now;

		if (isRunning && !isDragging) {
			const steps = Math.max(1, Math.min(3, Math.round(dt / 16.67)));
			for (let i = 0; i < steps; i++) pidStep();
			trail = trail.map((p) => ({ ...p, age: p.age + dt / 1000 })).filter((p) => p.age < 1.8);

			if (runStartMs !== null) {
				elapsedSec = (now - runStartMs) / 1000;
			}
		}

		rafId = requestAnimationFrame(tick);
	}

	function pidStep() {
		const ex = homeX - rx;
		const ey = homeY - ry;
		const mag = Math.hypot(ex, ey);

		if (mag < 0.8 && Math.hypot(vx, vy) < 0.3) {
			rx = homeX;
			ry = homeY;
			vx = 0;
			vy = 0;
			isRunning = false;
			integX = 0;
			integY = 0;
			runStartMs = null;
			elapsedSec = Number(elapsedSec.toFixed(1));
			return;
		}

		integX = Math.max(-MAX_INTEG, Math.min(MAX_INTEG, integX + ex));
		integY = Math.max(-MAX_INTEG, Math.min(MAX_INTEG, integY + ey));

		const dEx = ex - prevEX;
		const dEy = ey - prevEY;
		prevEX = ex;
		prevEY = ey;

		const ffActive = mag > 2 ? 1 : 0;
		const nx = ex / Math.max(mag, 0.01);
		const ny = ey / Math.max(mag, 0.01);
		const ffX = ffActive * kF * F_SCALE * nx;
		const ffY = ffActive * kF * F_SCALE * ny;

		const outX = kP * ex * P_SCALE + kI * integX * I_SCALE + kD * dEx * D_SCALE + ffX;
		const outY = kP * ey * P_SCALE + kI * integY * I_SCALE + kD * dEy * D_SCALE + ffY;

		const speed = Math.hypot(vx, vy);
		const force = Math.hypot(outX, outY);

		if (!(speed < 0.2 && robot.stiction > 0 && force < robot.stiction)) {
			vx += outX / robot.mass;
			vy += outY / robot.mass;
			vx *= robot.damping;
			vy *= robot.damping;
			rx += vx;
			ry += vy;
			rx = Math.max(ROBOT_SZ / 2, Math.min(gameWidth - ROBOT_SZ / 2, rx));
			ry = Math.max(ROBOT_SZ / 2, Math.min(GAME_H - ROBOT_SZ / 2, ry));
		}

		trail = [...trail.slice(-TRAIL_MAX), { x: rx, y: ry, age: 0 }];
		if (simTick++ % 2 === 0) errHist = [...errHist.slice(-ERR_MAX), mag];
	}

	function onPointerDown(e: PointerEvent) {
		if (e.button !== 0) return;
		e.preventDefault();
		(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
		isDragging = true;
		isRunning = false;
		vx = 0;
		vy = 0;
		integX = 0;
		integY = 0;
		prevEX = 0;
		prevEY = 0;
		trail = [];
		errHist = [];
		simTick = 0;
		runStartMs = null;
		elapsedSec = 0;
	}

	function onPointerMove(e: PointerEvent) {
		if (!isDragging) return;
		const rect = gameArea.getBoundingClientRect();
		rx = Math.max(-60, Math.min(gameWidth + 60, e.clientX - rect.left));
		ry = Math.max(-60, Math.min(GAME_H + 60, e.clientY - rect.top));
		trail = [...trail.slice(-TRAIL_MAX), { x: rx, y: ry, age: 0 }];
	}

	function onPointerUp() {
		if (!isDragging) return;
		isDragging = false;
		const mag = Math.hypot(homeX - rx, homeY - ry);
		if (mag > 8) {
			releaseErr = mag;
			isRunning = true;
			runStartMs = performance.now();
			elapsedSec = 0;
		} else {
			rx = homeX;
			ry = homeY;
		}
	}

	function resetSim() {
		isRunning = false;
		rx = homeX;
		ry = homeY;
		vx = 0;
		vy = 0;
		integX = 0;
		integY = 0;
		prevEX = 0;
		prevEY = 0;
		trail = [];
		errHist = [];
		simTick = 0;
		hintVisible = false;
		runStartMs = null;
		elapsedSec = 0;
	}

	function newRobotConfiguration() {
		robot = randomRobot();
		resetSim();
	}

	function toPath(hist: number[], maxE: number): string {
		if (hist.length < 2) return '';
		return hist
			.map((e, i) => {
				const x = 30 + (i / (ERR_MAX - 1)) * (540 - 60);
				const y = 130 - 30 - (Math.min(e, maxE) / maxE) * (130 - 60);
				return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
			})
			.join(' ');
	}

	let errPath = $derived(toPath(errHist, releaseErr));
	let robotLeft = $derived(rx - ROBOT_SZ / 2);
	let robotTop = $derived(ry - ROBOT_SZ / 2);
	let currentErr = $derived(errHist.at(-1) ?? 0);
</script>

<svelte:head>
	<title>PID Learning Game | Blueprint</title>
	<meta
		name="description"
		content="An interactive game for learning to tune PIDF control constants by dragging a robot and watching it return home."
	/>
</svelte:head>

<section class="page">
	<div class="container container--narrow">
		<header class="page-header text-center animate-fade-up">
			<span class="badge">Advanced Tools</span>
			<h1>PID Learning Game</h1>
			<p class="subtitle">
				Drag the robot anywhere on the field and watch it fight its way back using your PIDF
				constants. Each round hides a different robot configuration, so you learn to tune by feel.
			</p>
		</header>

		<div class="visualizer-wrap animate-fade-up" style="animation-delay: 100ms">
			<div class="game-shell">
				<div class="robot-bar">
					<span class="bar-label">CONFIGURATION</span>
					<button
						class="robot-btn config-btn"
						style="--rc: {robot.color}"
						onclick={newRobotConfiguration}
					>
						<span
							class="robot-btn-pip"
							style="background:{robot.color};box-shadow:0 0 6px {robot.color}66"
						></span>
						Tune a New Robot - Refresh
					</button>
				</div>

				<div class="game-area" bind:this={gameArea}>
					<svg class="game-svg" viewBox="0 0 {gameWidth} {GAME_H}" width="100%" height={GAME_H}>
						{#each Array.from({ length: 8 }, (_, i) => i) as col}
							{#each Array.from({ length: 5 }, (_, i) => i) as row}
								<circle
									cx={(gameWidth * (col + 0.5)) / 8}
									cy={(GAME_H * (row + 0.5)) / 5}
									r="1.5"
									fill="var(--border)"
									opacity="0.4"
								/>
							{/each}
						{/each}

						<circle
							cx={homeX}
							cy={homeY}
							r="28"
							fill="none"
							stroke="var(--accent-green)"
							stroke-width="1"
							stroke-dasharray="5 4"
							opacity="0.5"
						/>
						<circle
							cx={homeX}
							cy={homeY}
							r="5"
							fill="var(--accent-green)"
							opacity="0.7"
							style="filter: drop-shadow(0 0 4px var(--accent-green))"
						/>
						<line
							x1={homeX - 12}
							y1={homeY}
							x2={homeX + 12}
							y2={homeY}
							stroke="var(--accent-green)"
							stroke-width="1"
							opacity="0.4"
						/>
						<line
							x1={homeX}
							y1={homeY - 12}
							x2={homeX}
							y2={homeY + 12}
							stroke="var(--accent-green)"
							stroke-width="1"
							opacity="0.4"
						/>

						{#each trail as pt}
							<circle
								cx={pt.x}
								cy={pt.y}
								r={3.5 * Math.max(0, 1 - pt.age / 1.8)}
								fill={robot.color}
								opacity={0.65 * Math.max(0, 1 - pt.age / 1.8)}
							/>
						{/each}
					</svg>

					<div
						class="robot"
						class:dragging={isDragging}
						role="slider"
						tabindex="0"
						aria-label="Drag robot to reposition"
						aria-valuenow={Math.round(currentErr)}
						style="
                            left: {robotLeft}px;
                            top: {robotTop}px;
                            width: {ROBOT_SZ}px;
                            height: {ROBOT_SZ}px;
                            background: {robot.color}22;
                            border-color: {robot.border};
                            box-shadow: 0 0 14px {robot.color}55, inset 0 0 8px {robot.color}22;
                        "
						onpointerdown={onPointerDown}
						onpointermove={onPointerMove}
						onpointerup={onPointerUp}
						onpointercancel={onPointerUp}
					></div>

					{#if !isDragging && !isRunning && errHist.length === 0}
						<div class="drag-hint">Drag the robot anywhere, then watch it return</div>
					{/if}

					{#if isRunning}
						<div class="err-badge">
							err: {currentErr.toFixed(1)}px
						</div>
					{/if}
				</div>

				<div class="controls-section">
					<div class="section-label">PIDF CONSTANTS</div>
					<div class="pidf-grid">
						<div class="gain-group">
							<label for="kp-slider" class="gain-label">
								<span>kP</span>
								<span class="gain-val">{kP.toFixed(3)}</span>
							</label>
							<input id="kp-slider" type="range" min="0" max="0.30" step="0.001" bind:value={kP} />
						</div>

						<div class="gain-group">
							<label for="ki-slider" class="gain-label">
								<span>kI</span>
								<span class="gain-val muted">{kI.toFixed(2)}</span>
							</label>
							<input
								id="ki-slider"
								type="range"
								min="0"
								max="0.020"
								step="0.0001"
								bind:value={kI}
								disabled
								class="disabled-slider"
							/>
							<a class="learn-more" href="/software/common-practices"
								>Learn why this constant is disabled</a
							>
						</div>

						<div class="gain-group">
							<label for="kd-slider" class="gain-label">
								<span>kD</span>
								<span class="gain-val">{kD.toFixed(3)}</span>
							</label>
							<input id="kd-slider" type="range" min="0" max="0.80" step="0.005" bind:value={kD} />
						</div>

						<div class="gain-group">
							<label for="kf-slider" class="gain-label">
								<span>kF</span>
								<span class="gain-val">{kF.toFixed(3)}</span>
							</label>
							<input id="kf-slider" type="range" min="0" max="0.10" step="0.001" bind:value={kF} />
						</div>
					</div>
				</div>

				<div class="graph-section">
					<div class="graph-header">
						<span class="section-label">ERROR OVER TIME</span>
					</div>

					<svg width="100%" viewBox="0 0 540 130" class="err-graph">
						{#each [0, 0.25, 0.5, 0.75, 1] as frac}
							<line
								x1="30"
								y1={30 + frac * (130 - 60)}
								x2="510"
								y2={30 + frac * (130 - 60)}
								stroke="var(--border)"
								stroke-width="1"
								opacity="0.4"
								stroke-dasharray="3 4"
							/>
							<text
								x="26"
								y={30 + frac * (130 - 60) + 4}
								text-anchor="end"
								fill="var(--text-muted)"
								font-size="8"
								font-family="var(--font-mono)"
							>
								{((1 - frac) * releaseErr).toFixed(0)}
							</text>
						{/each}

						{#if errPath}
							<path
								d={errPath}
								fill="none"
								stroke={robot.color}
								stroke-width="2"
								stroke-linejoin="round"
							/>
						{/if}

						<line x1="30" y1="100" x2="510" y2="100" stroke="var(--border)" stroke-width="1" />
						<line x1="30" y1="30" x2="30" y2="100" stroke="var(--border)" stroke-width="1" />
						<text
							x="270"
							y="126"
							text-anchor="middle"
							fill="var(--text-muted)"
							font-size="8"
							font-family="var(--font-mono)">TIME →</text
						>
					</svg>

					<div class="time-readout">
						<span class="time-label">TIME ELAPSED</span>
						<span class="time-value">{elapsedSec.toFixed(1)} seconds</span>
					</div>
				</div>

				<div class="action-row">
					<button class="btn btn-secondary" onclick={resetSim}>Reset</button>
					<button
						class="btn btn-secondary"
						onclick={() => {
							hintVisible = !hintVisible;
						}}
					>
						{hintVisible ? 'Hide Hint' : 'Hint'}
					</button>
				</div>

				{#if hintVisible}
					<div class="hint-panel">
						<span class="hint-icon">Note</span>
						<p>{robot.hint}</p>
					</div>
				{/if}
			</div>
		</div>

		<div class="content animate-fade-up" style="animation-delay: 200ms">
			<h2>How it Works</h2>
			<div class="grid-2">
				<div class="card">
					<h3>1. The Challenge</h3>
					<p>
						Drag the robot anywhere on the field. When released, it uses your PIDF constants to
						return to the green target.
					</p>
				</div>
				<div class="card">
					<h3>2. The Hidden Setup</h3>
					<p>
						Each round uses a fresh secret configuration. The robot’s appearance changes so you know
						it’s different, but the physics are hidden so you have to tune by observing the
						response.
					</p>
				</div>
				<div class="card">
					<h3>3. The Constants</h3>
					<ul>
						<li><strong>P:</strong> Proportional to error, main driving force toward home.</li>
						<li><strong>I:</strong> Integral of error, corrects steady-state offsets slowly.</li>
						<li><strong>D:</strong> Derivative of error, damps oscillation like a brake.</li>
						<li><strong>F:</strong> Feedforward: constant push to overcome static friction.</li>
					</ul>
				</div>
				<div class="card">
					<h3>4. Reading the Graph</h3>
					<p>
						The error graph shows distance from the target over time. A well-tuned controller shows
						a smooth exponential decay to zero.
					</p>
				</div>
			</div>

			<div class="callout animate-fade-up" style="animation-delay: 300ms">
				<h3>Want to implement this in code?</h3>
				<p>
					Our full PID guide covers the theory and provides a ready-to-use Java implementation for
					the FTC SDK.
				</p>
				<a href="/software/pid-control" class="btn-link">View PID Guide →</a>
			</div>
		</div>
	</div>
</section>

<style>
	.page {
		padding: 5rem 0;
	}
	.page-header {
		margin-bottom: 3rem;
	}

	h1 {
		font-size: clamp(2.5rem, 8vw, 4rem);
		margin: 1rem 0;
	}

	.subtitle {
		font-size: 1.15rem;
		color: var(--text-secondary);
		max-width: 600px;
		margin: 0 auto;
		line-height: 1.6;
	}

	.visualizer-wrap {
		margin-bottom: 3rem;
	}

	.game-shell {
		background: var(--bg-card);
		border: 1px solid var(--border);
		border-radius: var(--radius-lg);
		overflow: hidden;
		box-shadow: 0 4px 24px rgba(0, 0, 0, 0.2);
	}

	.robot-bar {
		display: flex;
		align-items: center;
		gap: 1rem;
		padding: 0.7rem 1.1rem;
		border-bottom: 1px solid var(--border);
		background: var(--bg-secondary);
		flex-wrap: wrap;
	}

	.bar-label {
		font-family: var(--font-mono);
		font-size: 0.65rem;
		letter-spacing: 0.12em;
		color: var(--text-muted);
		white-space: nowrap;
	}

	.robot-btn {
		display: flex;
		align-items: center;
		gap: 0.4rem;
		padding: 0.3rem 0.7rem;
		background: var(--bg-card);
		border: 1px solid var(--border);
		border-radius: var(--radius-sm);
		font-family: var(--font-mono);
		font-size: 0.78rem;
		color: var(--text-secondary);
		cursor: pointer;
		transition: all 0.15s;
	}

	.robot-btn:hover {
		color: var(--text-primary);
		border-color: var(--rc);
	}

	.config-btn {
		min-width: 240px;
		justify-content: center;
	}

	.robot-btn-pip {
		width: 7px;
		height: 7px;
		border-radius: 50%;
		flex-shrink: 0;
	}

	.game-area {
		position: relative;
		width: 100%;
		height: 320px;
		overflow: visible;
		background: var(--bg-secondary);
		background-image: radial-gradient(circle, var(--border) 1px, transparent 1px);
		background-size: 40px 40px;
		background-position: center center;
		user-select: none;
	}

	.game-svg {
		position: absolute;
		top: 0;
		left: 0;
		pointer-events: none;
		overflow: visible;
	}

	.robot {
		position: absolute;
		border: 2px solid;
		border-radius: 8px;
		cursor: grab;
		touch-action: none;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: box-shadow 0.15s;
		z-index: 10;
		backdrop-filter: blur(2px);
	}

	.robot:hover {
		filter: brightness(1.15);
	}
	.robot.dragging {
		cursor: grabbing;
		filter: brightness(1.2);
	}

	.drag-hint {
		position: absolute;
		bottom: 14px;
		left: 50%;
		transform: translateX(-50%);
		font-family: var(--font-mono);
		font-size: 0.75rem;
		color: var(--text-muted);
		pointer-events: none;
		white-space: nowrap;
	}

	.err-badge {
		position: absolute;
		top: 12px;
		right: 12px;
		font-family: var(--font-mono);
		font-size: 0.72rem;
		color: var(--text-muted);
		background: var(--bg-card);
		border: 1px solid var(--border);
		border-radius: var(--radius-sm);
		padding: 0.2rem 0.5rem;
		pointer-events: none;
	}

	.controls-section {
		padding: 1rem 1.25rem 1.1rem;
		border-top: 1px solid var(--border);
	}

	.section-label {
		display: block;
		font-family: var(--font-mono);
		font-size: 0.65rem;
		letter-spacing: 0.12em;
		color: var(--text-muted);
		margin-bottom: 0.85rem;
	}

	.pidf-grid {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 1rem;
	}

	.gain-group {
		display: flex;
		flex-direction: column;
		gap: 0.35rem;
	}

	.gain-label {
		display: flex;
		justify-content: space-between;
		font-family: var(--font-mono);
		font-size: 0.82rem;
		color: var(--text-secondary);
	}

	.gain-val {
		color: var(--text-primary);
		font-weight: 600;
	}

	.gain-val.muted {
		color: var(--text-muted);
	}

	input[type='range'] {
		width: 100%;
		accent-color: var(--accent-cyan);
		cursor: pointer;
	}

	input[type='range']:disabled {
		opacity: 0.35;
		cursor: not-allowed;
		filter: grayscale(0.4);
	}

	.disabled-slider {
		pointer-events: none;
	}

	.learn-more {
		display: inline-block;
		margin-top: 0.3rem;
		font-family: var(--font-mono);
		font-size: 0.68rem;
		text-decoration: none;
		color: var(--accent-cyan);
		opacity: 0.9;
	}

	.learn-more:hover {
		text-decoration: underline;
		opacity: 1;
	}

	.graph-section {
		padding: 0.9rem 1.25rem 1rem;
		border-top: 1px solid var(--border);
		background: rgba(0, 0, 0, 0.1);
	}

	.graph-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 0.55rem;
	}

	.err-graph {
		display: block;
		width: 100%;
	}

	.time-readout {
		display: flex;
		flex-direction: column;
		gap: 0.1rem;
		margin-top: 0.3rem;
		font-family: var(--font-mono);
	}

	.time-label {
		font-size: 0.64rem;
		letter-spacing: 0.12em;
		color: var(--text-muted);
	}

	.time-value {
		font-size: 0.9rem;
		color: var(--text-primary);
		font-weight: 600;
	}

	.action-row {
		display: flex;
		gap: 0.75rem;
		padding: 0.9rem 1.25rem;
		border-top: 1px solid var(--border);
	}

	.btn {
		padding: 0.45rem 1.1rem;
		border-radius: var(--radius-sm);
		font-family: var(--font-mono);
		font-size: 0.82rem;
		cursor: pointer;
		border: 1px solid transparent;
		transition: all 0.15s;
	}

	.btn-secondary {
		background: var(--bg-secondary);
		color: var(--text-secondary);
		border-color: var(--border);
	}

	.btn-secondary:hover {
		color: var(--text-primary);
	}

	.hint-panel {
		display: flex;
		align-items: flex-start;
		gap: 0.75rem;
		padding: 0.85rem 1.25rem;
		border-top: 1px solid var(--border);
		font-size: 0.88rem;
		line-height: 1.5;
		background: rgba(251, 191, 36, 0.06);
		color: var(--text-secondary);
	}

	.hint-icon {
		font-size: 1rem;
		flex-shrink: 0;
	}

	.content h2 {
		margin-bottom: 2rem;
		text-align: center;
	}

	.grid-2 {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
		gap: 2rem;
		margin-bottom: 3rem;
	}

	.card {
		background: var(--bg-card);
		border: 1px solid var(--border);
		padding: 2rem;
		border-radius: var(--radius-lg);
	}

	.card h3 {
		margin-bottom: 1rem;
		color: var(--accent-cyan);
	}

	.card p,
	.card li {
		color: var(--text-body);
		font-size: 0.95rem;
		line-height: 1.6;
	}

	.card ul {
		list-style: none;
		padding: 0;
	}

	.card li {
		margin-bottom: 0.75rem;
	}

	.callout {
		background: var(--gradient-hero);
		border: 1px solid var(--border-subtle);
		padding: 3rem 2rem;
		border-radius: var(--radius-xl);
		text-align: center;
		margin-top: 4rem;
	}

	.callout h3 {
		margin-bottom: 1rem;
	}

	.callout p {
		color: var(--text-secondary);
		margin-bottom: 2rem;
		max-width: 500px;
		margin-left: auto;
		margin-right: auto;
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

	.btn-link {
		display: inline-block;
		padding: 0.8rem 1.8rem;
		background: var(--gradient-accent);
		color: white;
		border-radius: var(--radius-md);
		text-decoration: none;
		font-weight: 600;
		transition: transform 0.2s;
	}

	.btn-link:hover {
		transform: translateY(-2px);
	}

	@media (max-width: 520px) {
		.pidf-grid {
			grid-template-columns: 1fr 1fr;
		}
		.robot-bar {
			gap: 0.5rem;
		}
		.robot-btn {
			font-size: 0.72rem;
			padding: 0.25rem 0.5rem;
		}
		.action-row {
			flex-wrap: wrap;
		}
		.config-btn {
			min-width: 0;
			width: 100%;
			justify-content: center;
		}
	}
</style>
