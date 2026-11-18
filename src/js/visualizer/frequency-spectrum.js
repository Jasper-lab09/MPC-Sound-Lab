/**
 * Frequency Spectrum Renderer — FFT bar chart with optional overlays
 *
 * Features:
 * - Log frequency axis with labeled tick marks (Desmos-style)
 * - dBFS magnitude axis (0 to -60 dBFS)
 * - Optional harmonic peak labels (when harmonic analysis is provided)
 * - Optional window-function comparison overlay (computed via custom FFT)
 * - 80 aggregated bars for visual clarity
 */
import {
  createWindow,
  computeMagnitudeSpectrum,
  magnitudeToDBFS,
  windowSum,
  WINDOW_INFO,
} from './dsp-utils.js';

export class FrequencySpectrumRenderer {
  constructor(canvas, analyser) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.analyser = analyser;
    this.bufferLength = analyser.frequencyBinCount;
    this.dataArray = new Uint8Array(this.bufferLength);
    this._setupCanvas();

    // Overlay state
    this.harmonicData = null; // from HarmonicAnalyzer
    this.windowOverlay = null; // {type, spectrum} for comparison
    this._overlayWindow = null;
    this._overlayCache = null;

    // Interaction state
    this._hoverX = null;       // mouse x position (CSS pixels)
    this._hoverY = null;
    this._selectedBar = null;  // bar index of clicked peak
    this._barData = [];        // last rendered bar data [{x, y, w, h, freq, dB}]

    // Callbacks for external UI
    this.onHover = null;       // (info|null) => void
    this.onSelectPeak = null;  // (info|null) => void

    this._bindInteraction();
  }

  // ── Interaction: hover + click ──────────────────────────

  _bindInteraction() {
    this.canvas.addEventListener('mousemove', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      this._hoverX = e.clientX - rect.left;
      this._hoverY = e.clientY - rect.top;
    });

    this.canvas.addEventListener('mouseleave', () => {
      this._hoverX = null;
      this._hoverY = null;
      if (this.onHover) this.onHover(null);
    });

    this.canvas.addEventListener('click', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      this._handleClick(mx);
    });
  }

  _handleClick(mx) {
    // Find the bar closest to the click x
    const pl = this.padL;
    const pw = this.plotW;
    if (mx < pl || mx > pl + pw) return;

    const numBars = this._barData.length;
    if (numBars === 0) return;

    let bestIdx = -1;
    let bestDist = Infinity;
    for (let i = 0; i < numBars; i++) {
      const bar = this._barData[i];
      if (!bar) continue;
      const center = bar.x + bar.w / 2;
      const dist = Math.abs(mx - center);
      if (dist < bestDist) {
        bestDist = dist;
        bestIdx = i;
      }
    }

    if (bestIdx < 0) return;

    // Find the local peak: look for the tallest bar within +/- 3 bars
    let peakIdx = bestIdx;
    const range = 3;
    for (let i = Math.max(0, bestIdx - range); i <= Math.min(numBars - 1, bestIdx + range); i++) {
      if (this._barData[i] && this._barData[i].dB > this._barData[peakIdx].dB) {
        peakIdx = i;
      }
    }

    this._selectedBar = peakIdx;
    const peak = this._barData[peakIdx];
    if (this.onSelectPeak && peak) {
      this.onSelectPeak({
        freq: peak.freq,
        dB: peak.dB,
        barIndex: peakIdx,
      });
    }
  }

  clearSelection() {
    this._selectedBar = null;
  }

  // ── Frequency helpers ──────────────────────────────────

  _freqToNote(freq) {
    if (freq <= 0) return null;
    const midi = 69 + 12 * Math.log2(freq / 440);
    const midiRound = Math.round(midi);
    const cents = Math.round((midi - midiRound) * 100);
    const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const octave = Math.floor(midiRound / 12) - 1;
    const noteName = noteNames[midiRound % 12];
    return {
      name: `${noteName}${octave}`,
      midi: midiRound,
      cents,
    };
  }

  _xToFreq(x) {
    const pl = this.padL;
    const pw = this.plotW;
    const minFreq = 20;
    const sampleRate = this.analyser.context.sampleRate;
    const maxFreq = sampleRate / 2;
    const ratio = (x - pl) / pw;
    if (ratio < 0 || ratio > 1) return null;
    return minFreq * Math.pow(maxFreq / minFreq, ratio);
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

  setHarmonicData(data) {
    this.harmonicData = data;
  }

  setWindowOverlay(type) {
    if (!type || type === 'none') {
      this.windowOverlay = null;
      this._overlayWindow = null;
      this._overlayCache = null;
      return;
    }
    if (type !== this.windowOverlay?.type) {
      this.windowOverlay = { type };
      this._overlayWindow = createWindow(type, this.analyser.fftSize);
      this._overlayCache = null; // invalidate cache
    }
  }

  render() {
    this.analyser.getByteFrequencyData(this.dataArray);

    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;
    const pl = this.padL, pr = this.padR, pt = this.padT, pb = this.padB;
    const pw = this.plotW, ph = this.plotH;

    // Background
    ctx.fillStyle = '#050709';
    ctx.fillRect(0, 0, w, h);

    const sampleRate = this.analyser.context.sampleRate;
    const maxFreq = sampleRate / 2;
    const minFreq = 20;

    // Horizontal grid lines (dBFS)
    ctx.strokeStyle = '#111620';
    ctx.lineWidth = 1;
    ctx.font = '9px SF Mono, JetBrains Mono, monospace';
    ctx.fillStyle = '#364050';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';

    const dbMarks = [0, -12, -24, -36, -48, -60];
    for (const db of dbMarks) {
      const yRatio = -db / 60; // 0 at top, -60 at bottom
      const y = pt + yRatio * ph;
      ctx.beginPath();
      ctx.moveTo(pl, y);
      ctx.lineTo(pl + pw, y);
      ctx.stroke();
      ctx.fillText(`${db}`, pl - 4, y);
    }

    // Vertical grid + frequency labels (log scale)
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    const freqMarks = [50, 100, 200, 500, 1000, 2000, 5000, 10000];
    for (const freq of freqMarks) {
      if (freq > maxFreq) continue;
      const x = pl + (Math.log(freq / minFreq) / Math.log(maxFreq / minFreq)) * pw;
      ctx.strokeStyle = '#111620';
      ctx.beginPath();
      ctx.moveTo(x, pt);
      ctx.lineTo(x, pt + ph);
      ctx.stroke();
      const label = freq >= 1000 ? `${freq / 1000}k` : `${freq}`;
      ctx.fillStyle = '#364050';
      ctx.fillText(label, x, pt + ph + 4);
    }

    // Axis labels
    ctx.fillStyle = '#5C6A7A';
    ctx.font = '9px SF Mono, JetBrains Mono, monospace';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText('dBFS', pl, pt - 2);
    ctx.textAlign = 'right';
    ctx.fillText('Hz (log)', pl + pw, pt + ph + 12);

    // Draw bars (AnalyserNode data — always Blackman window internally)
    const numBars = 80;
    const barWidth = pw / numBars;
    this._barData = [];

    for (let i = 0; i < numBars; i++) {
      const freqStart = minFreq * Math.pow(maxFreq / minFreq, i / numBars);
      const freqEnd = minFreq * Math.pow(maxFreq / minFreq, (i + 1) / numBars);

      const binStart = Math.floor((freqStart * this.analyser.fftSize) / sampleRate);
      const binEnd = Math.max(binStart + 1, Math.ceil((freqEnd * this.analyser.fftSize) / sampleRate));

      let sum = 0;
      let count = 0;
      for (let j = binStart; j < binEnd && j < this.bufferLength; j++) {
        sum += this.dataArray[j];
        count++;
      }
      const avg = count > 0 ? sum / count : 0;

      // Convert byte value (0-255) to approximate dBFS
      const dbApprox = avg > 0 ? (avg / 255) * 80 - 80 : -80;
      const yRatio = Math.max(0, Math.min(1, (dbApprox + 60) / 60));
      const barHeight = yRatio * ph;
      const x = pl + i * barWidth;
      const y = pt + ph - barHeight;

      // Store bar data for interaction
      const barCenterFreq = Math.sqrt(freqStart * freqEnd);
      this._barData.push({ x, y, w: barWidth, h: barHeight, freq: barCenterFreq, dB: dbApprox });

      // Color: magenta → cyan gradient across frequency range
      const ratio = i / numBars;
      const r = Math.round(233 * (1 - ratio) + 79 * ratio);
      const g = Math.round(30 * (1 - ratio) + 195 * ratio);
      const b = Math.round(99 * (1 - ratio) + 247 * ratio);

      // Highlight selected bar
      if (this._selectedBar === i) {
        ctx.fillStyle = `rgba(255, 255, 255, 0.95)`;
        ctx.fillRect(x, pt, barWidth - 1, ph);
      }

      ctx.fillStyle = `rgba(${r}, ${g}, ${b}, 0.85)`;
      ctx.fillRect(x, y, barWidth - 1, barHeight);
    }

    // Draw window function overlay (if enabled)
    if (this.windowOverlay && this._overlayWindow) {
      this._drawOverlay(ctx, pl, pt, pw, ph, minFreq, maxFreq, sampleRate);
    }

    // Draw harmonic labels (if available)
    if (this.harmonicData) {
      this._drawHarmonicLabels(ctx, pl, pt, pw, ph, minFreq, maxFreq);
    }

    // Draw hover crosshair
    if (this._hoverX !== null && this._hoverX >= pl && this._hoverX <= pl + pw) {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(this._hoverX, pt);
      ctx.lineTo(this._hoverX, pt + ph);
      ctx.stroke();
      ctx.setLineDash([]);

      // Notify hover callback
      if (this.onHover) {
        const freq = this._xToFreq(this._hoverX);
        if (freq) {
          const note = this._freqToNote(freq);
          this.onHover({ freq, note, x: this._hoverX, y: this._hoverY });
        }
      }
    }

    // Draw selected peak indicator
    if (this._selectedBar !== null && this._barData[this._selectedBar]) {
      const bar = this._barData[this._selectedBar];
      const cx = bar.x + bar.w / 2;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([2, 2]);
      ctx.beginPath();
      ctx.moveTo(cx, pt);
      ctx.lineTo(cx, pt + ph);
      ctx.stroke();
      ctx.setLineDash([]);

      // Small label at top
      ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.font = '8px SF Mono, monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      const freqStr = bar.freq >= 1000 ? `${(bar.freq / 1000).toFixed(2)}k` : `${bar.freq.toFixed(0)}`;
      ctx.fillText(freqStr, cx, pt - 1);
    }
  }

  _drawOverlay(ctx, pl, pt, pw, ph, minFreq, maxFreq, sampleRate) {
    // Get raw time-domain data and compute spectrum with the selected window
    const fftSize = this.analyser.fftSize;
    const timeData = new Float32Array(fftSize);
    this.analyser.getFloatTimeDomainData(timeData);

    if (!this._overlayWindow || this._overlayWindow.length !== fftSize) {
      this._overlayWindow = createWindow(this.windowOverlay.type, fftSize);
    }

    const spectrum = computeMagnitudeSpectrum(
      timeData,
      this._overlayWindow,
      sampleRate
    );
    const wSum = windowSum(this._overlayWindow);
    const { magnitudes, binCount } = spectrum;

    // Draw as a line overlay
    ctx.strokeStyle = this.windowOverlay.type === 'rectangular'
      ? 'rgba(255, 183, 77, 0.6)'
      : 'rgba(171, 71, 188, 0.6)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();

    const numPoints = 200;
    for (let i = 0; i < numPoints; i++) {
      const freqStart = minFreq * Math.pow(maxFreq / minFreq, i / numPoints);
      const freqEnd = minFreq * Math.pow(maxFreq / minFreq, (i + 1) / numPoints);
      const binStart = Math.floor((freqStart * fftSize) / sampleRate);
      const binEnd = Math.max(binStart + 1, Math.ceil((freqEnd * fftSize) / sampleRate));

      let maxMag = 0;
      for (let j = binStart; j < binEnd && j < binCount; j++) {
        if (magnitudes[j] > maxMag) maxMag = magnitudes[j];
      }

      const dbfs = magnitudeToDBFS(maxMag, fftSize, wSum);
      const yRatio = Math.max(0, Math.min(1, (dbfs + 60) / 60));
      const x = pl + (i / numPoints) * pw;
      const y = pt + ph - yRatio * ph;

      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Legend
    ctx.font = '8px SF Mono, monospace';
    ctx.fillStyle = this.windowOverlay.type === 'rectangular'
      ? 'rgba(255, 183, 77, 0.8)'
      : 'rgba(171, 71, 188, 0.8)';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    const winName = WINDOW_INFO[this.windowOverlay.type]?.name || this.windowOverlay.type;
    ctx.fillText(`Overlay: ${winName} window`, pl + 4, pt + 2);
  }

  _drawHarmonicLabels(ctx, pl, pt, pw, ph, minFreq, maxFreq) {
    const ha = this.harmonicData;
    if (!ha || !ha.fundamental) return;

    const sampleRate = this.analyser.context.sampleRate;
    const fftSize = this.analyser.fftSize;

    for (const h of ha.harmonics) {
      if (!h.confirmed && h.number !== 1) continue;

      const freq = h.freq;
      if (freq > maxFreq || freq < minFreq) continue;

      const x = pl + (Math.log(freq / minFreq) / Math.log(maxFreq / minFreq)) * pw;

      // Vertical line
      ctx.strokeStyle = h.number === 1
        ? 'rgba(255, 183, 77, 0.5)'
        : 'rgba(102, 187, 106, 0.35)';
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(x, pt);
      ctx.lineTo(x, pt + ph);
      ctx.stroke();
      ctx.setLineDash([]);

      // Label
      const label = `H${h.number}`;
      const labelY = pt + 2 + (h.number - 1) * 11;
      ctx.fillStyle = h.number === 1
        ? 'rgba(255, 183, 77, 0.9)'
        : 'rgba(102, 187, 106, 0.7)';
      ctx.font = '8px SF Mono, monospace';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillText(label, x + 2, labelY);

      // Frequency label (smaller)
      ctx.fillStyle = 'rgba(92, 106, 122, 0.8)';
      ctx.font = '7px SF Mono, monospace';
      const freqStr = freq >= 1000 ? `${(freq / 1000).toFixed(1)}k` : `${freq.toFixed(0)}`;
      ctx.fillText(freqStr, x + 2, labelY + 9);
    }
  }
}
