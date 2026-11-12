/**
 * Waveform Renderer — Time-domain oscilloscope
 * Desmos-style: clean grid, labeled axes with actual time values in ms
 */
export class WaveformRenderer {
  constructor(canvas, analyser) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.analyser = analyser;
    this.bufferLength = analyser.fftSize;
    this.dataArray = new Uint8Array(this.bufferLength);
    this._setupCanvas();
  }

  _setupCanvas() {
    const rect = this.canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    this.canvas.width = rect.width * dpr;
    this.canvas.height = rect.height * dpr;
    this.ctx.scale(dpr, dpr);
    this.width = rect.width;
    this.height = rect.height;
    this.padL = 40;
    this.padR = 10;
    this.padT = 10;
    this.padB = 22;
    this.plotW = this.width - this.padL - this.padR;
    this.plotH = this.height - this.padT - this.padB;
  }

  resize() {
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this._setupCanvas();
  }

  render() {
    this.analyser.getByteTimeDomainData(this.dataArray);

    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;
    const pl = this.padL, pr = this.padR, pt = this.padT, pb = this.padB;
    const pw = this.plotW, ph = this.plotH;

    // Background
    ctx.fillStyle = '#08080c';
    ctx.fillRect(0, 0, w, h);

    const sampleRate = this.analyser.context.sampleRate;
    const fftSize = this.analyser.fftSize;
    const durationMs = (fftSize / sampleRate) * 1000;

    // Grid — horizontal lines (amplitude)
    ctx.strokeStyle = '#1a1a24';
    ctx.lineWidth = 1;
    ctx.font = '9px SF Mono, JetBrains Mono, monospace';
    ctx.fillStyle = '#383844';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';

    const ampLabels = [
      { val: 1.0, label: '+1.0' },
      { val: 0.5, label: '+0.5' },
      { val: 0.0, label: ' 0.0' },
      { val: -0.5, label: '-0.5' },
      { val: -1.0, label: '-1.0' },
    ];
    for (const amp of ampLabels) {
      const y = pt + ph / 2 - amp.val * (ph / 2);
      ctx.beginPath();
      ctx.moveTo(pl, y);
      ctx.lineTo(pl + pw, y);
      ctx.stroke();
      ctx.fillText(amp.label, pl - 4, y);
    }

    // Center line (zero amplitude) — brighter
    ctx.strokeStyle = '#2a2a38';
    ctx.beginPath();
    ctx.moveTo(pl, pt + ph / 2);
    ctx.lineTo(pl + pw, pt + ph / 2);
    ctx.stroke();

    // Vertical grid (time) with actual time labels
    ctx.strokeStyle = '#1a1a24';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillStyle = '#383844';

    const numTicks = 5;
    for (let i = 0; i <= numTicks; i++) {
      const ratio = i / numTicks;
      const x = pl + ratio * pw;
      ctx.beginPath();
      ctx.moveTo(x, pt);
      ctx.lineTo(x, pt + ph);
      ctx.stroke();

      const timeMs = ratio * durationMs;
      let label;
      if (timeMs < 1) {
        label = `${(timeMs * 1000).toFixed(0)}μs`;
      } else if (timeMs < 10) {
        label = `${timeMs.toFixed(1)}ms`;
      } else {
        label = `${timeMs.toFixed(0)}ms`;
      }
      ctx.fillText(label, x, pt + ph + 4);
    }

    // Axis labels
    ctx.fillStyle = '#60606e';
    ctx.font = '9px SF Mono, JetBrains Mono, monospace';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText('AMPLITUDE', pl, pt - 2);
    ctx.textAlign = 'right';
    ctx.fillText('TIME →', pl + pw, pt + ph + 12);

    // Draw waveform
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = '#4fc3f7';
    ctx.beginPath();

    const sliceWidth = pw / this.bufferLength;
    let x = pl;

    for (let i = 0; i < this.bufferLength; i++) {
      const v = (this.dataArray[i] - 128) / 128; // -1 to +1
      const y = pt + ph / 2 + v * (ph / 2);

      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
      x += sliceWidth;
    }

    ctx.stroke();
  }
}
