/**
 * Sound Sculpture — Signature generative visual for the MPC Sound Lab homepage.
 *
 * An interactive Canvas-based wave structure that:
 * - Morphs between waveform types (sine, square, sawtooth, triangle)
 * - Responds to scroll position (morph parameter shifts)
 * - Reacts to mouse movement (wave field distortion)
 * - Draws layered, glowing wave lines with depth
 * - Auto-cycles through waveforms slowly
 *
 * Pure Canvas 2D, no dependencies. Respects prefers-reduced-motion.
 */
export class SoundSculpture {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d', { alpha: true });
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.time = 0;
    this.scrollY = 0;
    this.targetScrollY = 0;
    this.mouseX = 0.5;
    this.mouseY = 0.5;
    this.targetMouseX = 0.5;
    this.targetMouseY = 0.5;
    this.animationId = null;
    this._reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Waveform cycle state
    this.waveforms = ['sine', 'triangle', 'sawtooth', 'square'];
    this.currentWaveIdx = 0;
    this.morphProgress = 0; // 0..1 morph between current and next
    this.morphSpeed = 0.002; // very slow auto-cycle
    this.waveCycleTime = 0;

    // Layer configuration
    this.layers = [];
    this._initLayers();

    // Particles for ambient depth
    this.particles = [];
    this._initParticles();

    this._bindEvents();
    this.resize();
  }

  _initLayers() {
    // Multiple wave layers at different depths, colors, opacities
    const palette = [
      { r: 0,   g: 199, b: 226 }, // cyan
      { r: 124, g: 111, b: 230 }, // violet
      { r: 0,   g: 199, b: 226 }, // cyan
      { r: 124, g: 111, b: 230 }, // violet
      { r: 0,   g: 199, b: 226 }, // cyan
    ];

    for (let i = 0; i < 5; i++) {
      this.layers.push({
        amplitude: 30 + i * 12,
        frequency: 0.008 + i * 0.003,
        speed: 0.3 + i * 0.15,
        yOffset: 0.2 + i * 0.14,
        color: palette[i],
        opacity: 0.5 - i * 0.08,
        lineWidth: 1.5 - i * 0.2,
        parallax: 0.05 + i * 0.04,
      });
    }
  }

  _initParticles() {
    const count = 24;
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: Math.random(),
        y: Math.random(),
        vx: (Math.random() - 0.5) * 0.0002,
        vy: -(0.00005 + Math.random() * 0.0001),
        size: 0.8 + Math.random() * 2,
        opacity: 0.06 + Math.random() * 0.14,
        phase: Math.random() * Math.PI * 2,
        isCyan: Math.random() < 0.6,
      });
    }
  }

  _bindEvents() {
    window.addEventListener('resize', () => this.resize());
    window.addEventListener('scroll', () => {
      this.targetScrollY = window.scrollY;
    }, { passive: true });

    this.canvas.addEventListener('mousemove', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      this.targetMouseX = (e.clientX - rect.left) / rect.width;
      this.targetMouseY = (e.clientY - rect.top) / rect.height;
    });

    this.canvas.addEventListener('mouseleave', () => {
      this.targetMouseX = 0.5;
      this.targetMouseY = 0.5;
    });
  }

  resize() {
    const rect = this.canvas.getBoundingClientRect();
    const w = rect.width;
    const h = rect.height;
    this.canvas.width = w * this.dpr;
    this.canvas.height = h * this.dpr;
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.scale(this.dpr, this.dpr);
    this.w = w;
    this.h = h;
  }

  start() {
    if (this._reducedMotion) {
      this._renderStatic();
      return;
    }
    if (this.animationId) return;
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

  _waveValue(phase, type) {
    // Normalize phase to 0..2π
    const p = phase % (Math.PI * 2);
    const t = p / (Math.PI * 2); // 0..1

    switch (type) {
      case 'sine':
        return Math.sin(p);
      case 'square':
        return t < 0.5 ? 1 : -1;
      case 'sawtooth':
        return 2 * t - 1;
      case 'triangle':
        return t < 0.5 ? (4 * t - 1) : (3 - 4 * t);
      default:
        return Math.sin(p);
    }
  }

  _morphedWave(phase, fromType, toType, morph) {
    const a = this._waveValue(phase, fromType);
    const b = this._waveValue(phase, toType);
    return a * (1 - morph) + b * morph;
  }

  update() {
    this.time += 0.008;

    // Smooth scroll
    this.scrollY += (this.targetScrollY - this.scrollY) * 0.06;

    // Smooth mouse
    this.mouseX += (this.targetMouseX - this.mouseX) * 0.05;
    this.mouseY += (this.targetMouseY - this.mouseY) * 0.05;

    // Auto-cycle waveforms
    this.waveCycleTime += this.morphSpeed;
    if (this.waveCycleTime >= 1) {
      this.waveCycleTime = 0;
      this.currentWaveIdx = (this.currentWaveIdx + 1) % this.waveforms.length;
    }
    this.morphProgress = this.waveCycleTime;

    // Update particles
    for (const p of this.particles) {
      p.x += p.vx;
      p.y += p.vy;
      p.phase += 0.008;
      if (p.y < -0.05) {
        p.y = 1.05;
        p.x = Math.random();
      }
      if (p.x < -0.05) p.x = 1.05;
      if (p.x > 1.05) p.x = -0.05;
    }
  }

  _renderStatic() {
    // Single frame for reduced motion
    this.render();
  }

  render() {
    const ctx = this.ctx;
    const w = this.w;
    const h = this.h;

    ctx.clearRect(0, 0, w, h);

    // Background radial glow — mouse-reactive
    const glowX = w * this.mouseX;
    const glowY = h * this.mouseY;
    const glowR = Math.max(100, Math.min(w, h) * 0.6);
    const glowGrad = ctx.createRadialGradient(glowX, glowY, 0, glowX, glowY, glowR);
    glowGrad.addColorStop(0, 'rgba(0, 199, 226, 0.06)');
    glowGrad.addColorStop(0.5, 'rgba(124, 111, 230, 0.02)');
    glowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = glowGrad;
    ctx.fillRect(0, 0, w, h);

    // Scroll-modulated morph: scroll position shifts the morph parameter
    const scrollMorph = Math.min(1, this.scrollY / 600);
    const effectiveMorph = (this.morphProgress + scrollMorph * 0.3) % 1;

    const fromWave = this.waveforms[this.currentWaveIdx];
    const toWave = this.waveforms[(this.currentWaveIdx + 1) % this.waveforms.length];

    // Draw wave layers
    for (let li = 0; li < this.layers.length; li++) {
      const layer = this.layers[li];
      const parallaxY = this.scrollY * layer.parallax;
      const baseY = h * layer.yOffset + parallaxY;

      // Mouse distortion: shift wave horizontally based on mouse X
      const mouseShift = (this.mouseX - 0.5) * 40 * (1 - li * 0.15);
      const mouseAmpBoost = 1 + (1 - this.mouseY) * 0.3; // higher mouse = more amp

      const amp = layer.amplitude * mouseAmpBoost;
      const freq = layer.frequency;
      const phase = this.time * layer.speed + mouseShift * 0.01;

      ctx.beginPath();
      ctx.moveTo(0, baseY);

      const step = 2;
      for (let x = 0; x <= w; x += step) {
        const wavePhase = x * freq + phase;
        const waveVal = this._morphedWave(wavePhase, fromWave, toWave, effectiveMorph);
        // Add secondary harmonics for richness
        const secondary = Math.sin(x * freq * 2.3 + phase * 1.4) * amp * 0.15;
        const y = baseY + waveVal * amp + secondary;
        ctx.lineTo(x, y);
      }

      const c = layer.color;
      const op = layer.opacity;

      // Stroke with glow
      ctx.strokeStyle = `rgba(${c.r}, ${c.g}, ${c.b}, ${op})`;
      ctx.lineWidth = layer.lineWidth;
      ctx.shadowColor = `rgba(${c.r}, ${c.g}, ${c.b}, 0.3)`;
      ctx.shadowBlur = 8;
      ctx.stroke();
      ctx.shadowBlur = 0;
    }

    // Draw particles
    for (const p of this.particles) {
      const px = p.x * w;
      const py = p.y * h - this.scrollY * 0.02;
      const wrappedY = ((py % h) + h) % h;

      const pulse = 0.5 + Math.sin(p.phase) * 0.5;
      const size = p.size * pulse;
      const alpha = p.opacity * pulse;

      const r = p.isCyan ? 0 : 124;
      const g = p.isCyan ? 199 : 111;
      const b = p.isCyan ? 226 : 230;

      // Glow
      const pg = ctx.createRadialGradient(px, wrappedY, 0, px, wrappedY, size * 4);
      pg.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${alpha})`);
      pg.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);
      ctx.fillStyle = pg;
      ctx.beginPath();
      ctx.arc(px, wrappedY, size * 4, 0, Math.PI * 2);
      ctx.fill();

      // Core
      ctx.beginPath();
      ctx.arc(px, wrappedY, size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${r + 60}, ${g + 30}, ${b}, ${alpha * 1.8})`;
      ctx.fill();
    }

    // Thin center line — editorial marker
    ctx.strokeStyle = 'rgba(0, 199, 226, 0.08)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, h * 0.5);
    ctx.lineTo(w, h * 0.5);
    ctx.stroke();
  }
}
