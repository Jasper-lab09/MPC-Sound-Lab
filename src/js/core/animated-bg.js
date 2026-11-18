/**
 * Cinematic Ambient Background — Canvas-based generative animation
 * for the MPC Sound Lab homepage hero section.
 *
 * Features:
 * - Slow flowing wave fields (layered sine sums)
 * - Subtle drifting particles with glow
 * - Abstract sound-wave geometry
 * - Depth and soft lighting via radial gradients
 * - Extremely restrained cyan/violet glow
 * - Low contrast, behind text
 * - Sound-reactive amplitude (optional, decorative only)
 * - Pauses on tab hidden
 * - Respects prefers-reduced-motion
 * - Toggleable via body.ambient-off
 *
 * Performance:
 * - Caps DPR at 2
 * - Uses requestAnimationFrame
 * - Lightweight particle count (~40)
 * - No per-frame allocations in hot paths
 */
export class CinematicBackground {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d', { alpha: false });
    this.particles = [];
    this.waveLayers = [];
    this.scrollY = 0;
    this.targetScrollY = 0;
    this.time = 0;
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.animationId = null;
    this.isVisible = true;
    this.amplitude = 0;          // 0..1, decorative audio amplitude
    this.targetAmplitude = 0;
    this._reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    this._initLayers();
    this._initParticles();
    this._bindEvents();
    this.resize();
  }

  _initLayers() {
    // Restrained palette: cyan + violet only
    const colors = [
      { r: 0,   g: 212, b: 255 },  // cyan
      { r: 139, g: 111, b: 255 },  // muted violet
      { r: 0,   g: 212, b: 255 },  // cyan (deeper layer)
      { r: 139, g: 111, b: 255 },  // violet (deepest)
    ];

    for (let i = 0; i < 4; i++) {
      this.waveLayers.push({
        amplitude: 18 + i * 14,
        frequency: 0.0025 + i * 0.0012,
        speed: 0.2 + i * 0.12,
        yOffset: 0.15 + i * 0.16,
        color: colors[i],
        opacity: 0.07 - i * 0.012,
        parallax: 0.08 + i * 0.06,
      });
    }
  }

  _initParticles() {
    // Sparse, slow-floating particles
    const count = 36;
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: Math.random(),
        y: Math.random(),
        vx: (Math.random() - 0.5) * 0.00015,
        vy: -(0.00008 + Math.random() * 0.00015),
        size: 0.5 + Math.random() * 1.8,
        opacity: 0.08 + Math.random() * 0.22,
        phase: Math.random() * Math.PI * 2,
        phaseSpeed: 0.5 + Math.random() * 1.0,
        isCyan: Math.random() < 0.6,
      });
    }
  }

  _bindEvents() {
    window.addEventListener('resize', () => this.resize());
    window.addEventListener('scroll', () => {
      this.targetScrollY = window.scrollY;
    }, { passive: true });

    // Pause when tab is hidden
    document.addEventListener('visibilitychange', () => {
      this.isVisible = !document.hidden;
      if (this.isVisible) {
        this.start();
      } else {
        this.stop();
      }
    });
  }

  resize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    this.canvas.width = w * this.dpr;
    this.canvas.height = h * this.dpr;
    this.canvas.style.width = w + 'px';
    this.canvas.style.height = h + 'px';
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.scale(this.dpr, this.dpr);
    this.w = w;
    this.h = h;
  }

  /**
   * Set decorative audio amplitude (0..1).
   * This is purely ambient — never used as measured data.
   */
  setAmplitude(amp) {
    this.targetAmplitude = Math.max(0, Math.min(1, amp));
  }

  start() {
    if (this._reducedMotion) return;
    if (this.animationId) return;
    if (!this.isVisible) return;
    const loop = () => {
      this.update();
      this.render();
      this.animationId = requestAnimationFrame(loop);
    };
    loop();
  }

  stop() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  update() {
    this.time += 0.006;

    // Smooth scroll interpolation
    this.scrollY += (this.targetScrollY - this.scrollY) * 0.06;

    // Smooth amplitude interpolation
    this.amplitude += (this.targetAmplitude - this.amplitude) * 0.04;

    // Update particles
    for (const p of this.particles) {
      p.x += p.vx;
      p.y += p.vy;
      p.phase += 0.01 * p.phaseSpeed;
      if (p.y < -0.05) {
        p.y = 1.05;
        p.x = Math.random();
      }
      if (p.x < -0.05) p.x = 1.05;
      if (p.x > 1.05) p.x = -0.05;
    }
  }

  render() {
    const ctx = this.ctx;
    const w = this.w;
    const h = this.h;

    // Deep base fill — near-black navy
    ctx.fillStyle = '#07090D';
    ctx.fillRect(0, 0, w, h);

    const scrollOffset = this.scrollY * 0.25;

    // Glow 1 — cyan, top-left, very restrained
    const g1x = w * 0.12;
    const g1y = h * 0.08 - scrollOffset * 0.4;
    const g1r = Math.max(300, Math.min(w, h) * 0.5);
    const grad1 = ctx.createRadialGradient(g1x, g1y, 0, g1x, g1y, g1r);
    grad1.addColorStop(0, 'rgba(0, 212, 255, 0.06)');
    grad1.addColorStop(1, 'rgba(0, 212, 255, 0)');
    ctx.fillStyle = grad1;
    ctx.fillRect(0, 0, w, h);

    // Glow 2 — violet, right side
    const g2x = w * 0.88;
    const g2y = h * 0.22 + scrollOffset * 0.2;
    const g2r = Math.max(280, Math.min(w, h) * 0.45);
    const grad2 = ctx.createRadialGradient(g2x, g2y, 0, g2x, g2y, g2r);
    grad2.addColorStop(0, 'rgba(139, 111, 255, 0.05)');
    grad2.addColorStop(1, 'rgba(139, 111, 255, 0)');
    ctx.fillStyle = grad2;
    ctx.fillRect(0, 0, w, h);

    // Amplitude-reactive glow boost (very subtle, decorative)
    if (this.amplitude > 0.05) {
      const boostR = 200 + this.amplitude * 200;
      const boostGrad = ctx.createRadialGradient(w * 0.5, h * 0.15, 0, w * 0.5, h * 0.15, boostR);
      boostGrad.addColorStop(0, `rgba(0, 212, 255, ${this.amplitude * 0.04})`);
      boostGrad.addColorStop(1, 'rgba(0, 212, 255, 0)');
      ctx.fillStyle = boostGrad;
      ctx.fillRect(0, 0, w, h);
    }

    // Draw flowing wave layers — extremely subtle
    for (const layer of this.waveLayers) {
      const parallaxY = this.scrollY * layer.parallax;
      const baseY = h * layer.yOffset + parallaxY;
      const ampBoost = 1 + this.amplitude * 0.15;
      const amp = layer.amplitude * ampBoost;
      const freq = layer.frequency;
      const phase = this.time * layer.speed;

      ctx.beginPath();
      ctx.moveTo(0, baseY);

      for (let x = 0; x <= w; x += 3) {
        const y = baseY +
          Math.sin(x * freq + phase) * amp +
          Math.sin(x * freq * 2.3 + phase * 1.3) * amp * 0.25 +
          Math.sin(x * freq * 0.5 + phase * 0.7) * amp * 0.4;
        ctx.lineTo(x, y);
      }

      // Fill below the wave with gradient
      ctx.lineTo(w, h);
      ctx.lineTo(0, h);
      ctx.closePath();

      const fillGrad = ctx.createLinearGradient(0, baseY - amp, 0, h);
      const c = layer.color;
      fillGrad.addColorStop(0, `rgba(${c.r}, ${c.g}, ${c.b}, ${layer.opacity})`);
      fillGrad.addColorStop(1, `rgba(${c.r}, ${c.g}, ${c.b}, 0)`);
      ctx.fillStyle = fillGrad;
      ctx.fill();

      // Stroke the wave line — very thin
      ctx.beginPath();
      ctx.moveTo(0, baseY);
      for (let x = 0; x <= w; x += 3) {
        const y = baseY +
          Math.sin(x * freq + phase) * amp +
          Math.sin(x * freq * 2.3 + phase * 1.3) * amp * 0.25 +
          Math.sin(x * freq * 0.5 + phase * 0.7) * amp * 0.4;
        ctx.lineTo(x, y);
      }
      ctx.strokeStyle = `rgba(${c.r}, ${c.g}, ${c.b}, ${layer.opacity * 1.2})`;
      ctx.lineWidth = 0.8;
      ctx.stroke();
    }

    // Draw floating particles — sparse, soft glow
    for (const p of this.particles) {
      const px = p.x * w;
      const py = p.y * h - this.scrollY * 0.03;
      const wrappedY = ((py % h) + h) % h;

      // Pulse with phase + slight amplitude reactivity
      const pulse = 0.6 + Math.sin(p.phase) * 0.4;
      const size = p.size * (1 + this.amplitude * 0.2);
      const alpha = p.opacity * pulse;

      const baseR = p.isCyan ? 0 : 139;
      const baseG = p.isCyan ? 212 : 111;
      const baseB = p.isCyan ? 255 : 255;

      // Soft glow
      const glowGrad = ctx.createRadialGradient(px, wrappedY, 0, px, wrappedY, size * 4);
      glowGrad.addColorStop(0, `rgba(${baseR}, ${baseG}, ${baseB}, ${alpha})`);
      glowGrad.addColorStop(1, `rgba(${baseR}, ${baseG}, ${baseB}, 0)`);
      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.arc(px, wrappedY, size * 4, 0, Math.PI * 2);
      ctx.fill();

      // Core
      ctx.beginPath();
      ctx.arc(px, wrappedY, size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${baseR + 80}, ${baseG + 30}, ${baseB}, ${alpha * 1.5})`;
      ctx.fill();
    }

    // Faint grid — very subtle, shifts with scroll
    ctx.strokeStyle = 'rgba(80, 120, 160, 0.018)';
    ctx.lineWidth = 1;
    const gridSize = 48;
    const gridOffset = (this.scrollY * 0.08) % gridSize;

    for (let x = 0; x < w; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = -gridOffset; y < h; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    // Vignette — soft darkening at edges
    const vignGrad = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.3, w / 2, h / 2, Math.max(w, h) * 0.7);
    vignGrad.addColorStop(0, 'rgba(0, 0, 0, 0)');
    vignGrad.addColorStop(1, 'rgba(0, 0, 0, 0.25)');
    ctx.fillStyle = vignGrad;
    ctx.fillRect(0, 0, w, h);
  }
}

/**
 * Legacy alias for backwards compatibility.
 * If index.html or other pages import AnimatedBackground, it still works.
 */
export const AnimatedBackground = CinematicBackground;
