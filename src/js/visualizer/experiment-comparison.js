/**
 * Experiment Comparison — Capture and compare two analysis states
 *
 * Allows users to capture a snapshot of current analysis parameters
 * and visual data, then capture a second snapshot with different
 * settings, and compare the two side by side.
 *
 * Each snapshot stores:
 * - Source type (mic / generator)
 * - Generator settings (waveform, frequency, amplitude)
 * - FFT size
 * - Window type
 * - Smoothing
 * - Gain
 * - RMS (dBFS)
 * - Peak frequency (Hz)
 * - Spectral centroid (Hz)
 * - Fundamental pitch (Hz)
 * - BPM
 * - A rendered thumbnail of the spectrum canvas
 * - Timestamp
 */
export class ExperimentComparison {
  constructor() {
    this.snapshotA = null;
    this.snapshotB = null;
    this._onUpdate = null;
  }

  /**
   * Set a callback to be called when snapshots change.
   */
  onUpdate(fn) {
    this._onUpdate = fn;
  }

  /**
   * Capture a snapshot of the current state.
   * @param {Object} state - Current analysis state
   * @param {HTMLCanvasElement} spectrumCanvas - for thumbnail
   * @param {'A'|'B'} slot - which slot to capture into
   */
  capture(state, spectrumCanvas, slot = 'A') {
    const snapshot = {
      slot,
      timestamp: new Date().toLocaleTimeString(),
      source: state.source || 'mic',
      waveform: state.waveform || null,
      frequency: state.frequency || null,
      amplitude: state.amplitude || null,
      fftSize: state.fftSize || 2048,
      windowType: state.windowType || 'blackman',
      smoothing: state.smoothing ?? 0.8,
      gain: state.gain || 1.0,
      rms: state.rms || null,
      rmsDb: state.rmsDb || null,
      peakFreq: state.peakFreq || null,
      centroid: state.centroid || null,
      pitch: state.pitch || null,
      bpm: state.bpm || null,
      harmonicCount: state.harmonicCount || null,
      fundamentalFreq: state.fundamentalFreq || null,
    };

    // Capture spectrum thumbnail
    if (spectrumCanvas) {
      try {
        snapshot.thumbnail = spectrumCanvas.toDataURL('image/png');
      } catch (e) {
        snapshot.thumbnail = null;
      }
    }

    if (slot === 'A') {
      this.snapshotA = snapshot;
    } else {
      this.snapshotB = snapshot;
    }

    if (this._onUpdate) this._onUpdate();
  }

  clear(slot) {
    if (slot === 'A') this.snapshotA = null;
    else this.snapshotB = null;
    if (this._onUpdate) this._onUpdate();
  }

  clearAll() {
    this.snapshotA = null;
    this.snapshotB = null;
    if (this._onUpdate) this._onUpdate();
  }

  hasBoth() {
    return this.snapshotA && this.snapshotB;
  }

  /**
   * Compute the differences between the two snapshots.
   * @returns {Object|null}
   */
  getDifferences() {
    if (!this.snapshotA || !this.snapshotB) return null;
    const a = this.snapshotA;
    const b = this.snapshotB;
    const diffs = [];

    // FFT size
    if (a.fftSize !== b.fftSize) {
      diffs.push({
        label: 'FFT Size',
        a: a.fftSize,
        b: b.fftSize,
        delta: b.fftSize - a.fftSize,
        note: `Bin spacing: ${(44100 / a.fftSize).toFixed(1)} Hz → ${(44100 / b.fftSize).toFixed(1)} Hz`,
      });
    }

    // Window type
    if (a.windowType !== b.windowType) {
      diffs.push({
        label: 'Window',
        a: a.windowType,
        b: b.windowType,
        delta: null,
        note: 'Affects spectral leakage and main-lobe width',
      });
    }

    // Waveform
    if (a.waveform !== b.waveform) {
      diffs.push({
        label: 'Waveform',
        a: a.waveform || '—',
        b: b.waveform || '—',
        delta: null,
        note: 'Different harmonic content',
      });
    }

    // Frequency
    if (a.frequency !== b.frequency) {
      diffs.push({
        label: 'Frequency',
        a: a.frequency ? `${a.frequency} Hz` : '—',
        b: b.frequency ? `${b.frequency} Hz` : '—',
        delta: (b.frequency || 0) - (a.frequency || 0),
        note: null,
      });
    }

    // RMS
    if (a.rmsDb !== null && b.rmsDb !== null) {
      diffs.push({
        label: 'RMS Level',
        a: `${a.rmsDb.toFixed(1)} dBFS`,
        b: `${b.rmsDb.toFixed(1)} dBFS`,
        delta: (b.rmsDb - a.rmsDb).toFixed(1),
        note: null,
      });
    }

    // Peak frequency
    if (a.peakFreq !== null && b.peakFreq !== null) {
      diffs.push({
        label: 'Peak Frequency',
        a: `${a.peakFreq.toFixed(1)} Hz`,
        b: `${b.peakFreq.toFixed(1)} Hz`,
        delta: (b.peakFreq - a.peakFreq).toFixed(1),
        note: null,
      });
    }

    // Spectral centroid
    if (a.centroid !== null && b.centroid !== null) {
      diffs.push({
        label: 'Spectral Centroid',
        a: `${a.centroid.toFixed(0)} Hz`,
        b: `${b.centroid.toFixed(0)} Hz`,
        delta: (b.centroid - a.centroid).toFixed(0),
        note: b.centroid > a.centroid ? 'Brighter' : 'Darker',
      });
    }

    // Pitch
    if (a.pitch && b.pitch && a.pitch.freq !== b.pitch.freq) {
      diffs.push({
        label: 'Pitch',
        a: `${a.pitch.freq.toFixed(1)} Hz (${a.pitch.name})`,
        b: `${b.pitch.freq.toFixed(1)} Hz (${b.pitch.name})`,
        delta: (b.pitch.freq - a.pitch.freq).toFixed(1),
        note: null,
      });
    }

    // Harmonic count
    if (a.harmonicCount !== null && b.harmonicCount !== null) {
      diffs.push({
        label: 'Confirmed Harmonics',
        a: a.harmonicCount,
        b: b.harmonicCount,
        delta: b.harmonicCount - a.harmonicCount,
        note: null,
      });
    }

    return { diffs, snapshotA: a, snapshotB: b };
  }

  /**
   * Render the comparison view into a container element.
   * @param {HTMLElement} container
   */
  render(container) {
    if (!this.hasBoth()) {
      container.innerHTML = `
        <div class="cmp-empty">
          <p>Capture two snapshots to compare. For example:</p>
          <ul>
            <li>FFT size 512 vs 4096</li>
            <li>Rectangular vs Hann window</li>
            <li>Sine wave vs Square wave</li>
          </ul>
          <p>Adjust parameters between captures to see the differences.</p>
        </div>
      `;
      return;
    }

    const result = this.getDifferences();
    if (!result) return;

    const { diffs, snapshotA: a, snapshotB: b } = result;

    let html = '<div class="cmp-view">';

    // Thumbnails
    html += '<div class="cmp-thumbs">';
    html += this._renderThumb(a);
    html += this._renderThumb(b);
    html += '</div>';

    // Differences table
    if (diffs.length > 0) {
      html += '<div class="cmp-diffs">';
      html += '<div class="cmp-diffs-head">Measured Differences</div>';
      html += '<table class="cmp-table">';
      html += '<thead><tr><th>Parameter</th><th>Snapshot A</th><th>Snapshot B</th><th>Δ</th></tr></thead>';
      html += '<tbody>';
      for (const d of diffs) {
        const deltaStr = d.delta !== null
          ? (typeof d.delta === 'number'
            ? (d.delta > 0 ? '+' : '') + d.delta
            : d.delta)
          : '—';
        html += `<tr>`;
        html += `<td class="cmp-param">${d.label}</td>`;
        html += `<td>${d.a}</td>`;
        html += `<td>${d.b}</td>`;
        html += `<td class="cmp-delta">${deltaStr}</td>`;
        html += `</tr>`;
        if (d.note) {
          html += `<tr class="cmp-note-row"><td colspan="4">${d.note}</td></tr>`;
        }
      }
      html += '</tbody></table>';
      html += '</div>';
    } else {
      html += '<div class="cmp-diffs"><p>No parameter differences detected between snapshots.</p></div>';
    }

    html += '</div>';
    container.innerHTML = html;
  }

  _renderThumb(snap) {
    let html = `<div class="cmp-thumb">`;
    html += `<div class="cmp-thumb-head">`;
    html += `<span class="cmp-thumb-slot cmp-slot-${snap.slot.toLowerCase()}">Snapshot ${snap.slot}</span>`;
    html += `<span class="cmp-thumb-time">${snap.timestamp}</span>`;
    html += `</div>`;
    if (snap.thumbnail) {
      html += `<img class="cmp-thumb-img" src="${snap.thumbnail}" alt="Spectrum ${snap.slot}" />`;
    } else {
      html += `<div class="cmp-thumb-placeholder">No thumbnail</div>`;
    }
    html += `<div class="cmp-thumb-meta">`;
    html += `<div>FFT: ${snap.fftSize}</div>`;
    html += `<div>Window: ${snap.windowType}</div>`;
    if (snap.waveform) html += `<div>Wave: ${snap.waveform}</div>`;
    if (snap.frequency) html += `<div>Freq: ${snap.frequency} Hz</div>`;
    html += `</div>`;
    html += `</div>`;
    return html;
  }
}
