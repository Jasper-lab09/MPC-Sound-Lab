/**
 * Animated Background — Canvas-based flowing waveform/particle animation
 * with scroll parallax for the homepage hero section.
 * Creates a "video-like" dynamic background that responds to scroll.
 */
export class AnimatedBackground {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.particles = [];
    this.waveLayers = [];
    this.scrollY = 0;
    this.targetScrollY = 0;
    this.time = 0;
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.animationId = null;
    this._initLayers();
    this._initParticles();
    this._bindEvents();
    this.resize();
  }

  _initLayers() {
    // Multiple wave layers at different depths for parallax
    const colors = [
      { r: 0, g: 212, b: 255 },    // cyan
      { r: 176, g: 96, b: 255 },   // purple
      { r: 255, g: 32, b: 128 },   // magenta
      { r: 64, g: 128, b: 255 },   // blue
    ];

    for (let i = 0; i < 4; i++) {
      this.waveLayers.push({
        amplitude: 30 + i * 20,
        frequency: 0.003 + i * 0.0015,
        speed: 0.3 + i * 0.15,
        yOffset: 0.2 + i * 0.18,
        color: colors[i],
        opacity: 0.12 - i * 0.02,
        parallax: 0.1 + i * 0.08,
      });
    }
  }

  _initParticles() {
    // Floating particles that drift upward
    const count = 60;
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: Math.random(),
        y: Math.random(),
        vx: (Math.random() - 0.5) * 0.0003,
        vy: -(0.0001 + Math.random() * 0.0003),
        size: 0.5 + Math.random() * 2,
        opacity: 0.15 + Math.random() * 0.35,
        hue: Math.random() < 0.5 ? 190 : 280, // cyan or purple
      });
    }
  }

  _bindEvents() {
    window.addEventListener('resize', () => this.resize());
    window.addEventListener('scroll', () => {
      this.targetScrollY = window.scrollY;
    }, { passive: true });
  }

  resize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    this.canvas.width = w * this.dpr;
    this.canvas.height = h * this.dpr;
    this.canvas.style.width = w + 'px';
    this.canvas.style.height = h + 'px';
    this.ctx.scale(this.dpr, this.dpr);
    this.w = w;
    this.h = h;
  }

  start() {
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

  update() {
    this.time += 0.01;

    // Smooth scroll interpolation
    this.scrollY += (this.targetScrollY - this.scrollY) * 0.08;

    // Update particles
    for (const p of this.particles) {
      p.x += p.vx;
      p.y += p.vy;
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

    // Clear with deep base color
    ctx.fillStyle = '#050510';
    ctx.fillRect(0, 0, w, h);

    // Draw radial glows that shift with scroll
    const scrollOffset = this.scrollY * 0.3;

    // Glow 1 — cyan top-left
    const g1x = w * 0.15;
    const g1y = h * 0.1 - scrollOffset * 0.5;
    const grad1 = ctx.createRadialGradient(g1x, g1y, 0, g1x, g1y, 500);
    grad1.addColorStop(0, 'rgba(0, 212, 255, 0.15)');
    grad1.addColorStop(1, 'rgba(0, 212, 255, 0)');
    ctx.fillStyle = grad1;
    ctx.fillRect(0, 0, w, h);

    // Glow 2 — purple right
    const g2x = w * 0.85;
    const g2y = h * 0.25 + scrollOffset * 0.3;
    const grad2 = ctx.createRadialGradient(g2x, g2y, 0, g2x, g2y, 450);
    grad2.addColorStop(0, 'rgba(176, 96, 255, 0.12)');
    grad2.addColorStop(1, 'rgba(176, 96, 255, 0)');
    ctx.fillStyle = grad2;
    ctx.fillRect(0, 0, w, h);

    // Glow 3 — magenta bottom
    const g3x = w * 0.5;
    const g3y = h * 0.9 - scrollOffset * 0.2;
    const grad3 = ctx.createRadialGradient(g3x, g3y, 0, g3x, g3y, 400);
    grad3.addColorStop(0, 'rgba(255, 32, 128, 0.08)');
    grad3.addColorStop(1, 'rgba(255, 32, 128, 0)');
    ctx.fillStyle = grad3;
    ctx.fillRect(0, 0, w, h);

    // Draw flowing wave layers
    for (const layer of this.waveLayers) {
      const parallaxY = this.scrollY * layer.parallax;
      const baseY = h * layer.yOffset + parallaxY;
      const amp = layer.amplitude;
      const freq = layer.frequency;
      const phase = this.time * layer.speed;

      ctx.beginPath();
      ctx.moveTo(0, baseY);

      for (let x = 0; x <= w; x += 2) {
        const y = baseY +
          Math.sin(x * freq + phase) * amp +
          Math.sin(x * freq * 2.3 + phase * 1.3) * amp * 0.3 +
          Math.sin(x * freq * 0.5 + phase * 0.7) * amp * 0.5;
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

      // Stroke the wave line
      ctx.beginPath();
      ctx.moveTo(0, baseY);
      for (let x = 0; x <= w; x += 2) {
        const y = baseY +
          Math.sin(x * freq + phase) * amp +
          Math.sin(x * freq * 2.3 + phase * 1.3) * amp * 0.3 +
          Math.sin(x * freq * 0.5 + phase * 0.7) * amp * 0.5;
        ctx.lineTo(x, y);
      }
      ctx.strokeStyle = `rgba(${c.r}, ${c.g}, ${c.b}, ${layer.opacity * 1.5})`;
      ctx.lineWidth = 1.2;
      ctx.stroke();
    }

    // Draw floating particles
    for (const p of this.particles) {
      const px = p.x * w;
      const py = p.y * h - this.scrollY * 0.05;
      const wrappedY = ((py % h) + h) % h; // wrap around

      const size = p.size;
      const color = p.hue === 190
        ? `rgba(0, 212, 255, ${p.opacity})`
        : `rgba(176, 96, 255, ${p.opacity})`;

      // Glow
      ctx.beginPath();
      ctx.arc(px, wrappedY, size * 3, 0, Math.PI * 2);
      const glowGrad = ctx.createRadialGradient(px, wrappedY, 0, px, wrappedY, size * 3);
      glowGrad.addColorStop(0, color);
      glowGrad.addColorStop(1, p.hue === 190 ? 'rgba(0, 212, 255, 0)' : 'rgba(176, 96, 255, 0)');
      ctx.fillStyle = glowGrad;
      ctx.fill();

      // Core
      ctx.beginPath();
      ctx.arc(px, wrappedY, size, 0, Math.PI * 2);
      ctx.fillStyle = p.hue === 190
        ? `rgba(120, 230, 255, ${p.opacity * 2})`
        : `rgba(200, 150, 255, ${p.opacity * 2})`;
      ctx.fill();
    }

    // Draw subtle grid that shifts with scroll
    ctx.strokeStyle = 'rgba(100, 140, 255, 0.03)';
    ctx.lineWidth = 1;
    const gridSize = 56;
    const gridOffset = (this.scrollY * 0.1) % gridSize;

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
  }
}
