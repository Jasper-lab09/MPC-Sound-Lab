/**
 * Spectrogram Renderer — Waterfall display
 * Shows frequency content over time with axis labels
 */
export class SpectrogramRenderer {
  constructor(canvas, analyser) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.analyser = analyser;
    this.bufferLength = analyser.frequencyBinCount;
    this.dataArray = new Uint8Array(this.bufferLength);
    this._setupCanvas();

    this.scrollSpeed = 2;
    this.lastDrawTime = 0;
    this._initialized = false;
  }

  _setupCanvas() {
    const rect = this.canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    this.canvas.width = rect.width * dpr;
    this.canvas.height = rect.height * dpr;
    this.ctx.scale(dpr, dpr);
    this.width = rect.width;
    this.height = rect.height;
    this.padL = 36;
    this.padR = 8;
    this.padT = 8;
    this.padB = 20;
    this.plotW = this.width - this.padL - this.padR;
    this.plotH = this.height - this.padT - this.padB;
  }

  resize() {
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this._setupCanvas();
    this._initialized = false; // force redraw of frame
  }

  _magnitudeToColor(value) {
    const t = value / 255;
    if (t < 0.2) {
      const k = t / 0.2;
      return [Math.round(8 + k * 12), Math.round(8 + k * 12), Math.round(12 + k * 20)];
    } else if (t < 0.4) {
      const k = (t - 0.2) / 0.2;
      return [Math.round(20 + k * 10), Math.round(20 + k * 60), Math.round(32 + k * 100)];
    } else if (t < 0.6) {
      const k = (t - 0.4) / 0.2;
      return [Math.round(30 + k * 30), Math.round(80 + k * 120), Math.round(132 - k * 60)];
    } else if (t < 0.8) {
      const k = (t - 0.6) / 0.2;
      return [Math.round(60 + k * 180), Math.round(200 - k * 20), Math.round(72 - k * 40)];
    } else {
      const k = (t - 0.8) / 0.2;
      return [255, Math.round(180 - k * 140), Math.round(32 + k * 20)];
    }
  }

  _drawFrame() {
    const ctx = this.ctx;
    const pl = this.padL, pt = this.padT, pw = this.plotW, ph = this.plotH;

    // Draw axis frame
    ctx.fillStyle = '#08080c';
    ctx.fillRect(0, 0, this.width, this.height);

    // Frequency labels (Y axis, log scale)
    const sampleRate = this.analyser.context.sampleRate;
    const maxFreq = sampleRate / 2;
    const minFreq = 20;

    ctx.font = '9px SF Mono, monospace';
    ctx.fillStyle = '#383844';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';

    const freqMarks = [100, 500, 1000, 2000, 5000, 10000];
    for (const freq of freqMarks) {
      if (freq > maxFreq) continue;
      // top = high freq, bottom = low freq
      const yRatio = 1 - Math.log(freq / minFreq) / Math.log(maxFreq / minFreq);
      const y = pt + yRatio * ph;
      ctx.fillText(freq >= 1000 ? `${freq / 1000}k` : `${freq}`, pl - 4, y);
    }

    // Bottom labels
    ctx.fillStyle = '#60606e';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'top';
    ctx.fillText('Hz (log)  ←  time →', pl + pw, pt + ph + 4);

    ctx.fillStyle = '#60606e';
    ctx.textAlign = 'left';
    ctx.fillText('FREQ', pl, pt - 2);

    this._initialized = true;
  }

  render(timestamp) {
    if (timestamp - this.lastDrawTime < 33) return;
    this.lastDrawTime = timestamp;

    if (!this._initialized) {
      this._drawFrame();
    }

    this.analyser.getByteFrequencyData(this.dataArray);

    const ctx = this.ctx;
    const pl = this.padL, pt = this.padT, pw = this.plotW, ph = this.plotH;
    const sampleRate = this.analyser.context.sampleRate;
    const maxFreq = sampleRate / 2;
    const minFreq = 20;

    // Scroll existing plot content left
    try {
      const imageData = ctx.getImageData(pl + this.scrollSpeed, pt, pw - this.scrollSpeed, ph);
      ctx.putImageData(imageData, pl, pt);
    } catch (e) {
      // If getImageData fails (cross-origin), just redraw
    }

    // Clear the rightmost strip
    ctx.fillStyle = '#08080c';
    ctx.fillRect(pl + pw - this.scrollSpeed, pt, this.scrollSpeed, ph);

    // Draw new frequency column on the right edge
    const colX = pl + pw - this.scrollSpeed;

    for (let y = 0; y < ph; y++) {
      const freqRatio = 1 - y / ph;
      const freq = minFreq * Math.pow(maxFreq / minFreq, freqRatio);

      const bin = Math.floor((freq * this.analyser.fftSize) / sampleRate);
      const clampedBin = Math.max(0, Math.min(bin, this.bufferLength - 1));
      const magnitude = this.dataArray[clampedBin];

      const [r, g, b] = this._magnitudeToColor(magnitude);
      ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
      ctx.fillRect(colX, pt + y, this.scrollSpeed, 1);
    }
  }
}
