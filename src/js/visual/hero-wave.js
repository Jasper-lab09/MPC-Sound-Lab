/**
 * HeroWave — original mathematical sound-wave visualization for the homepage hero.
 *
 * Renders a family of sine waves based on the actual equation
 *   x(t) = A · sin(2πft + φ)
 * composed into harmonic structures that morph slowly over time.
 *
 * Features:
 * - Pure Canvas 2D, no dependencies
 * - Sound-reactive to scroll position (wave complexity grows as you scroll down)
 * - Mouse parallax shifts phase
 * - Respects prefers-reduced-motion
 */
export class HeroWave {
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

    this._bindEvents();
    this.resize();
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
    this.canvas.width = rect.width * this.dpr;
    this.canvas.height = rect.height * this.dpr;
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.scale(this.dpr, this.dpr);
    this.w = rect.width;
    this.h = rect.height;
  }

  start() {
    if (this._reducedMotion) {
      this._drawStatic();
      return;
    }
    if (this.animationId) return;
    const loop = () => {
      this._update();
      this._render();
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

  _update() {
    this.time += 0.006;
    this.scrollY += (this.targetScrollY - this.scrollY) * 0.08;
    this.mouseX += (this.targetMouseX - this.mouseX) * 0.06;
    this.mouseY += (this.targetMouseY - this.mouseY) * 0.06;
  }

  _render() {
    const ctx = this.ctx;
    const w = this.w;
    const h = this.h;

    ctx.clearRect(0, 0, w, h);

    const scrollMorph = Math.min(1, this.scrollY / 600);
    const mousePhase = (this.mouseX - 0.5) * Math.PI * 0.4;
    const mouseAmp = 1 + (this.mouseY - 0.5) * 0.25;

    // Color palette: cobalt + acid, restrained
    const colors = [
      { r: 30,  g: 77,  b: 255,  a: 0.85 }, // cobalt
      { r: 216, g: 232, b: 41,   a: 0.55 }, // acid
      { r: 107, g: 139, b: 255,  a: 0.35 }, // cobalt dim
      { r: 30,  g: 77,  b: 255,  a: 0.22 }, // cobalt ghost
      { r: 216, g: 232, b: 41,   a: 0.22 }, // acid ghost
    ];

    // Each layer: a sum of harmonics with different fundamentals
    const layers = [
      { f: 0.0022, amp: 60, harmonics: [1, 0.5, 0.25, 0.12], y: 0.42, speed: 0.9 },
      { f: 0.0034, amp: 48, harmonics: [1, 0, 0.33, 0],     y: 0.52, speed: 0.7 },
      { f: 0.0016, amp: 72, harmonics: [1, 0.6, 0.2, 0.08], y: 0.58, speed: 0.5 },
      { f: 0.0045, amp: 34, harmonics: [1, 0.3, 0, 0.15],  y: 0.36, speed: 1.1 },
      { f: 0.0010, amp: 90, harmonics: [1, 0.4, 0.1, 0.05], y: 0.48, speed: 0.4 },
    ];

    const addHarmonics = 3 + Math.floor(scrollMorph * 4); // complexity grows with scroll

    for (let li = 0; li < layers.length; li++) {
      const layer = layers[li];
      const color = colors[li % colors.length];
      const alpha = color.a * (1 - scrollMorph * 0.25); // fade slightly as complexity rises
      const yBase = h * layer.y + Math.sin(this.time * 0.3 + li) * 12;

      ctx.beginPath();
      for (let x = 0; x <= w; x += 2) {
        let y = 0;
        const localPhase = this.time * layer.speed + mousePhase + li * 0.7;
        for (let hi = 0; hi < Math.min(layer.harmonics.length, addHarmonics); hi++) {
          const harmonic = layer.harmonics[hi];
          if (!harmonic) continue;
          const freq = layer.f * (hi + 1);
          const amp = layer.amp * harmonic * mouseAmp;
          y += Math.sin(x * freq + localPhase * (hi + 1)) * amp;
        }
        if (x === 0) ctx.moveTo(x, yBase + y);
        else ctx.lineTo(x, yBase + y);
      }

      ctx.lineWidth = (li === 0 ? 1.8 : 1.0);
      ctx.strokeStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${alpha})`;
      ctx.stroke();

      // Subtle glow on first layer
      if (li === 0) {
        ctx.save();
        ctx.shadowColor = `rgba(${color.r}, ${color.g}, ${color.b}, 0.45)`;
        ctx.shadowBlur = 22;
        ctx.stroke();
        ctx.restore();
      }
    }

    // Draw faint equation ghosted in lower-right
    ctx.save();
    ctx.font = `${Math.min(14, w * 0.012)}px "JetBrains Mono", monospace`;
    ctx.fillStyle = 'rgba(255,255,255,0.07)';
    ctx.textAlign = 'right';
    ctx.fillText('x(t) = A · sin(2πft + φ)', w - 40, h - 40);
    ctx.restore();
  }

  _drawStatic() {
    this._update();
    this._render();
  }
}
