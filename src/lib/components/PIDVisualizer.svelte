<script lang="ts">
	import { onMount } from 'svelte';

	// PID Constants
	let kp = $state(0.5);
	let ki = $state(0.01);
	let kd = $state(0.3);

	// Simulation Staten
	let target = 100;
	let currentPos = $state(0);
	let velocity = $state(0);
	let integralSum = $state(0);
	let lastError = $state(0);

	let history = $state<number[]>([]);
	const maxHistory = 100;

	let isRunning = $state(true);

	// Auto-reset state
	let autoResetSeconds = $state('4.5');
	let autoResetTimer = $state<ReturnType<typeof setInterval> | null>(null);
	let countdownTimer = $state<ReturnType<typeof setInterval> | null>(null);
	let countdown = $state<number | null>(null);

	function step() {
		if (!isRunning) return;

		const error = target - currentPos;
		const derivative = error - lastError;
		integralSum += error;

		// Anti-windup
		if (Math.abs(error) < 0.1) integralSum = 0;
		if (integralSum > 100) integralSum = 100;
		if (integralSum < -100) integralSum = -100;

		const output = kp * error + ki * integralSum + kd * derivative;

		// Physics
		velocity += output;
		velocity *= 0.9; // Friction/Damping
		currentPos += velocity;

		lastError = error;

		history.push(currentPos);
		if (history.length > maxHistory) history.shift();
	}

	onMount(() => {
		const interval = setInterval(step, 40);

		// start default auto‑reset timer (5.5 s)
		handleAutoResetInput();

		return () => {
			clearInterval(interval);
			if (autoResetTimer) clearInterval(autoResetTimer);
			if (countdownTimer) clearInterval(countdownTimer);
		};
	});

	function resetSim() {
		currentPos = 0;
		velocity = 0;
		integralSum = 0;
		lastError = 0;
		history = [];
	}

	function handleAutoResetInput() {
		if (autoResetTimer) {
			clearInterval(autoResetTimer);
			autoResetTimer = null;
		}
		if (countdownTimer) {
			clearInterval(countdownTimer);
			countdownTimer = null;
		}
		countdown = null;

		const seconds = parseFloat(autoResetSeconds);
		if (!isNaN(seconds) && seconds > 0) {
			const ms = Math.round(seconds * 1000);
			countdown = ms;

			autoResetTimer = setInterval(() => {
				resetSim();
				countdown = ms;
			}, ms);

			countdownTimer = setInterval(() => {
				countdown = Math.max(0, (countdown ?? 0) - 100);
				if (countdown <= 0) countdown = ms;
			}, 100);
		}
	}

	// SVG Helpers
	const width = 400;
	const height = 200;
	const pad = 20;

	let pathData = $derived(() => {
		if (history.length < 2) return '';
		return history
			.map((p, i) => {
				const x = (i / (maxHistory - 1)) * (width - 2 * pad) + pad;
				const y = height - ((p / 150) * (height - 2 * pad) + pad);
				return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
			})
			.join(' ');
	});
</script>

<div class="pid-visualizer">
	<div class="header">
		<h4>Interactive PID Tuner</h4>
		<div class="header-controls">
			<div class="auto-reset">
				<label for="auto-reset-input">Auto-reset (s)</label>
				<input
					id="auto-reset-input"
					type="number"
					min="0.5"
					step="0.5"
					placeholder="-"
					bind:value={autoResetSeconds}
					oninput={handleAutoResetInput}
					class="auto-reset-input"
				/>
				{#if countdown !== null}
					<span class="countdown">{(countdown / 1000).toFixed(1)}s</span>
				{/if}
			</div>
			<button onclick={resetSim} class="reset-btn">Reset Sim</button>
		</div>
	</div>

	<div class="visual-area">
		<svg {width} {height} viewBox="0 0 {width} {height}">
			<!-- Grid -->
			<line
				x1={pad}
				y1={height - pad}
				x2={width - pad}
				y2={height - pad}
				stroke="var(--border)"
				stroke-width="1"
			/>
			<line x1={pad} y1={pad} x2={pad} y2={height - pad} stroke="var(--border)" stroke-width="1" />

			<!-- Target Line -->
			<line
				x1={pad}
				y1={height - ((target / 150) * (height - 2 * pad) + pad)}
				x2={width - pad}
				y2={height - ((target / 150) * (height - 2 * pad) + pad)}
				stroke="var(--accent-green)"
				stroke-dasharray="4 4"
				opacity="0.5"
			/>

			<!-- Response Path -->
			<path
				d={pathData()}
				fill="none"
				stroke="var(--accent-cyan)"
				stroke-width="2.5"
				stroke-linejoin="round"
			/>

			<!-- Robot Indicator -->
			{#if history.length > 0}
				<circle
					cx={((history.length - 1) / (maxHistory - 1)) * (width - 2 * pad) + pad}
					cy={height - ((currentPos / 150) * (height - 2 * pad) + pad)}
					r="5"
					fill="var(--accent-cyan)"
					style="filter: drop-shadow(0 0 4px var(--accent-cyan))"
				/>
			{/if}
		</svg>
	</div>

	<div class="controls">
		<div class="control-group">
			<label for="kp-range">P (Proportional) <span>{kp.toFixed(2)}</span></label>
			<input id="kp-range" type="range" min="0" max="1" step="0.01" bind:value={kp} />
		</div>
		<div class="control-group">
			<label for="ki-range">I (Integral) <span>{ki.toFixed(3)}</span></label>
			<input id="ki-range" type="range" min="0" max="0.1" step="0.001" bind:value={ki} />
		</div>
		<div class="control-group">
			<label for="kd-range">D (Derivative) <span>{kd.toFixed(2)}</span></label>
			<input id="kd-range" type="range" min="0" max="2" step="0.05" bind:value={kd} />
		</div>
	</div>

	<div class="tuning-hint">
		{#if kp > 0.8}
			<p class="warning">High P might cause overshoot!</p>
		{:else if kd < 0.1 && kp > 0.2}
			<p class="tip">Try increasing D to stop the oscillation.</p>
		{:else if Math.abs(currentPos - target) < 1}
			<p class="success">Stable target lock reached.</p>
		{/if}
	</div>
</div>

<style>
	.pid-visualizer {
		background: var(--bg-card);
		border: 1px solid var(--border);
		border-radius: var(--radius-lg);
		padding: 1.5rem;
		margin: 2rem 0;
		box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
	}

	.header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 1.25rem;
	}

	.header h4 {
		margin: 0;
		color: var(--text-primary);
	}

	.header-controls {
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}

	.auto-reset {
		display: flex;
		align-items: center;
		gap: 0.4rem;
	}

	.auto-reset label {
		font-size: 0.8rem;
		font-family: var(--font-mono);
		color: var(--text-secondary);
		white-space: nowrap;
	}

	.countdown {
		font-size: 0.8rem;
		font-family: var(--font-mono);
		color: var(--accent-cyan);
		min-width: 2rem;
		text-align: left;
	}

	.auto-reset-input {
		width: 4rem;
		background: var(--bg-secondary);
		border: 1px solid var(--border);
		color: var(--text-primary);
		padding: 0.2rem 0.4rem;
		border-radius: var(--radius-sm);
		font-size: 0.8rem;
		font-family: var(--font-mono);
		text-align: center;
		transition: border-color 0.2s;
	}

	.auto-reset-input:focus {
		outline: none;
		border-color: var(--accent-cyan);
	}

	/* Hide number input spinners */
	.auto-reset-input::-webkit-outer-spin-button,
	.auto-reset-input::-webkit-inner-spin-button {
		-webkit-appearance: none;
	}
	.auto-reset-input[type='number'] {
		-moz-appearance: textfield;
		appearance: textfield;
	}

	.reset-btn {
		background: var(--bg-secondary);
		border: 1px solid var(--border);
		color: var(--text-secondary);
		padding: 0.25rem 0.75rem;
		border-radius: var(--radius-sm);
		font-size: 0.8rem;
		cursor: pointer;
		transition: all 0.2s;
	}

	.reset-btn:hover {
		background: var(--bg-card-hover);
		color: var(--text-primary);
	}

	.visual-area {
		width: 100%;
		display: flex;
		justify-content: center;
		margin-bottom: 1.5rem;
		background: rgba(0, 0, 0, 0.2);
		border-radius: var(--radius-md);
		overflow: hidden;
	}

	svg {
		max-width: 100%;
		height: auto;
	}

	.controls {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
		gap: 1.5rem;
		margin-bottom: 1rem;
	}

	.control-group {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.control-group label {
		font-size: 0.85rem;
		font-family: var(--font-mono);
		color: var(--text-secondary);
		display: flex;
		justify-content: space-between;
	}

	.control-group label span {
		color: var(--text-primary);
		font-weight: 600;
	}

	input[type='range'] {
		width: 100%;
		accent-color: var(--accent-cyan);
		cursor: pointer;
	}

	.tuning-hint {
		min-height: 1.5rem;
		font-size: 0.85rem;
		font-family: var(--font-body);
		text-align: center;
	}

	.warning {
		color: var(--accent-yellow);
	}
	.tip {
		color: var(--text-muted);
	}
	.success {
		color: var(--accent-green);
	}
</style>
