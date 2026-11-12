/**
 * Visualizer Controller — Main orchestrator for the upgraded Sound Visualizer
 *
 * Integrates:
 * - Microphone input and signal generator (source switching)
 * - Waveform, FFT spectrum, spectrogram rendering
 * - Pitch detection (autocorrelation)
 * - Beat detection (energy flux)
 * - Harmonic analyzer
 * - Window function explorer (custom FFT overlay)
 * - Experiment comparison (snapshot capture)
 * - Explore panel (interactive math/physics explanations)
 * - dBFS-corrected readouts
 */
import { audioManager } from '../core/audio-context.js';
import { WaveformRenderer } from './waveform.js';
import { FrequencySpectrumRenderer } from './frequency-spectrum.js';
import { SpectrogramRenderer } from './spectrogram.js';
import { PitchDetector } from './pitch-detector.js';
import { BeatDetector } from './beat-detector.js';
import { signalGenerator } from './signal-generator.js';
import { HarmonicAnalyzer } from './harmonic-analyzer.js';
import { ExperimentComparison } from './experiment-comparison.js';
import { getExplorePanel, DEFINITIONS } from './explore-panel.js';
import { WINDOW_INFO, binSpacing, minResolvableSeparation } from './dsp-utils.js';

export class VisualizerController {
  constructor() {
    this.waveformRenderer = null;
    this.spectrumRenderer = null;
    this.spectrogramRenderer = null;
    this.pitchDetector = null;
    this.beatDetector = null;
    this.harmonicAnalyzer = new HarmonicAnalyzer();
    this.comparison = new ExperimentComparison();

    this.isRunning = false;
    this.animationId = null;
    this.currentSource = 'mic'; // 'mic' | 'generator'
    this.windowOverlayType = 'none'; // 'none' | 'rectangular' | 'hann' | 'hamming'
    this.harmonicAnalysisEnabled = false;

    this.lastReadoutUpdate = 0;
    this.lastPitchUpdate = 0;
    this.lastHarmonicUpdate = 0;
    this.lastExploreUpdate = 0;

    this._currentState = {};
  }

  init() {
    // ── Gate panel controls ──
    this.startBtn = document.getElementById('viz-start');
    this.sourceSelect = document.getElementById('viz-source');
    this.fftSelect = document.getElementById('viz-fft');
    this.smoothingSlider = document.getElementById('viz-smoothing');
    this.smoothingVal = document.getElementById('viz-smoothing-val');
    this.gainSlider = document.getElementById('viz-gain');
    this.gainVal = document.getElementById('viz-gain-val');

    // ── Signal generator controls ──
    this.genPanel = document.getElementById('gen-panel');
    this.genWaveform = document.getElementById('gen-waveform');
    this.genFreq = document.getElementById('gen-freq');
    this.genFreqVal = document.getElementById('gen-freq-val');
    this.genAmp = document.getElementById('gen-amp');
    this.genAmpVal = document.getElementById('gen-amp-val');

    // ── Live toolbar controls ──
    this.stopBtn = document.getElementById('viz-stop');
    this.fftLive = document.getElementById('viz-fft-live');
    this.smoothingLive = document.getElementById('viz-smoothing-live');
    this.smoothingValLive = document.getElementById('viz-smoothing-val-live');
    this.gainLive = document.getElementById('viz-gain-live');
    this.gainValLive = document.getElementById('viz-gain-val-live');

    // ── Window function explorer ──
    this.windowSelect = document.getElementById('viz-window');

    // ── Harmonic analyzer toggle ──
    this.harmonicToggle = document.getElementById('viz-harmonic-toggle');

    // ── Experiment comparison ──
    this.captureABtn = document.getElementById('cmp-capture-a');
    this.captureBBtn = document.getElementById('cmp-capture-b');
    this.clearCmpBtn = document.getElementById('cmp-clear');
    this.cmpView = document.getElementById('cmp-view');

    // ── Readouts ──
    this.pitchNote = document.getElementById('pitch-note');
    this.pitchFreq = document.getElementById('pitch-freq');
    this.pitchCents = document.getElementById('pitch-cents');
    this.pitchConf = document.getElementById('pitch-conf');
    this.beatDot = document.getElementById('beat-dot');
    this.bpmVal = document.getElementById('val-bpm');
    this.rmsVal = document.getElementById('val-rms');
    this.peakFreqVal = document.getElementById('val-peak');
    this.centroidVal = document.getElementById('val-centroid');
    this.binSpacingVal = document.getElementById('val-bin-spacing');
    this.minResolutionVal = document.getElementById('val-resolution');

    // ── Panels ──
    this.gatePanel = document.getElementById('gate-panel');
    this.livePanel = document.getElementById('live-panel');
    this.errorMsg = document.getElementById('error-msg');
    this.statusDot = document.getElementById('status-dot');
    this.statusText = document.getElementById('status-text');

    // ── Explore panel ──
    this.explorePanel = getExplorePanel();

    // ── Bind events ──
    this._bindEvents();

    // ── Initialize comparison view ──
    this.comparison.onUpdate(() => this._updateComparison());
    this._updateComparison();

    // ── Bind explore buttons ──
    this._bindExploreButtons();

    // ── Window resize ──
    window.addEventListener('resize', () => {
      if (this.waveformRenderer) this.waveformRenderer.resize();
      if (this.spectrumRenderer) this.spectrumRenderer.resize();
      if (this.spectrogramRenderer) this.spectrogramRenderer.resize();
    });
  }

  _bindEvents() {
    // Source selection
    if (this.sourceSelect) {
      this.sourceSelect.addEventListener('change', (e) => this._onSourceChange(e.target.value));
    }

    // Start button
    if (this.startBtn) {
      this.startBtn.addEventListener('click', () => this.start());
    }

    // Gate controls
    if (this.fftSelect) {
      this.fftSelect.addEventListener('change', (e) => this._onFFTChange(e.target.value));
    }
    if (this.smoothingSlider) {
      this.smoothingSlider.addEventListener('input', (e) =>
        this._onSmoothingChange(parseFloat(e.target.value), this.smoothingVal)
      );
    }
    if (this.gainSlider) {
      this.gainSlider.addEventListener('input', (e) =>
        this._onGainChange(parseFloat(e.target.value), this.gainVal)
      );
    }

    // Signal generator controls
    if (this.genWaveform) {
      this.genWaveform.addEventListener('change', (e) => {
        if (signalGenerator.isActive) {
          signalGenerator.setWaveform(e.target.value);
        }
        this._updateCurrentState();
      });
    }
    if (this.genFreq) {
      this.genFreq.addEventListener('input', (e) => {
        const f = parseFloat(e.target.value);
        if (this.genFreqVal) this.genFreqVal.textContent = `${f.toFixed(0)} Hz`;
        if (signalGenerator.isActive) signalGenerator.setFrequency(f);
        this._updateCurrentState();
      });
    }
    if (this.genAmp) {
      this.genAmp.addEventListener('input', (e) => {
        const a = parseFloat(e.target.value);
        if (this.genAmpVal) this.genAmpVal.textContent = a.toFixed(2);
        if (signalGenerator.isActive) signalGenerator.setAmplitude(a);
        this._updateCurrentState();
      });
    }

    // Live toolbar
    if (this.stopBtn) {
      this.stopBtn.addEventListener('click', () => this.stop());
    }
    if (this.fftLive) {
      this.fftLive.addEventListener('change', (e) => {
        if (this.fftSelect) this.fftSelect.value = e.target.value;
        this._onFFTChange(e.target.value);
      });
    }
    if (this.smoothingLive) {
      this.smoothingLive.addEventListener('input', (e) => {
        if (this.smoothingSlider) this.smoothingSlider.value = e.target.value;
        this._onSmoothingChange(parseFloat(e.target.value), this.smoothingValLive);
        if (this.smoothingVal) this.smoothingVal.textContent = parseFloat(e.target.value).toFixed(2);
      });
    }
    if (this.gainLive) {
      this.gainLive.addEventListener('input', (e) => {
        if (this.gainSlider) this.gainSlider.value = e.target.value;
        this._onGainChange(parseFloat(e.target.value), this.gainValLive);
        if (this.gainVal) this.gainVal.textContent = parseFloat(e.target.value).toFixed(1) + 'x';
      });
    }

    // Window function explorer
    if (this.windowSelect) {
      this.windowSelect.addEventListener('change', (e) => {
        this.windowOverlayType = e.target.value;
        if (this.spectrumRenderer) {
          this.spectrumRenderer.setWindowOverlay(e.target.value);
        }
        this._updateCurrentState();
        this._updateResolutionInfo();
      });
    }

    // Harmonic analyzer toggle
    if (this.harmonicToggle) {
      this.harmonicToggle.addEventListener('change', (e) => {
        this.harmonicAnalysisEnabled = e.target.checked;
        if (!this.harmonicAnalysisEnabled && this.spectrumRenderer) {
          this.spectrumRenderer.setHarmonicData(null);
        }
      });
    }

    // Experiment comparison
    if (this.captureABtn) {
      this.captureABtn.addEventListener('click', () => this._captureSnapshot('A'));
    }
    if (this.captureBBtn) {
      this.captureBBtn.addEventListener('click', () => this._captureSnapshot('B'));
    }
    if (this.clearCmpBtn) {
      this.clearCmpBtn.addEventListener('click', () => {
        this.comparison.clearAll();
      });
    }
  }

  _bindExploreButtons() {
    document.querySelectorAll('[data-explore]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const key = btn.getAttribute('data-explore');
        this._updateCurrentState();
        this.explorePanel.open(key, this._currentState);
      });
    });
  }

  _onSourceChange(source) {
    this.currentSource = source;
    if (this.genPanel) {
      this.genPanel.style.display = source === 'generator' ? 'block' : 'none';
    }
    // Update start button text
    if (this.startBtn) {
      this.startBtn.textContent = source === 'generator'
        ? 'Start Generator'
        : 'Start Visualization';
    }
  }

  _onFFTChange(value) {
    const size = parseInt(value);
    audioManager.setFFTSize(size);
    this.harmonicAnalyzer.setFFTSize(size);
    if (this.fftSelect) this.fftSelect.value = value;
    if (this.fftLive) this.fftLive.value = value;
    if (this.isRunning) {
      this._recreateRenderers();
    }
    this._updateCurrentState();
    this._updateResolutionInfo();
  }

  _onSmoothingChange(val, displayEl) {
    audioManager.setSmoothing(val);
    if (displayEl) displayEl.textContent = val.toFixed(2);
    this._updateCurrentState();
  }

  _onGainChange(val, displayEl) {
    audioManager.setGain(val);
    if (displayEl) displayEl.textContent = val.toFixed(1) + 'x';
    this._updateCurrentState();
  }

  _updateResolutionInfo() {
    const fs = audioManager.sampleRate || 44100;
    const N = audioManager.fftSize || 2048;
    const wt = this.windowOverlayType !== 'none' ? this.windowOverlayType : 'blackman';
    const spacing = binSpacing(N, fs);
    const separation = minResolvableSeparation(wt, N, fs);

    if (this.binSpacingVal) {
      this.binSpacingVal.textContent = `${spacing.toFixed(1)} Hz`;
    }
    if (this.minResolutionVal) {
      this.minResolutionVal.textContent = `${separation.toFixed(1)} Hz`;
    }
  }

  async start() {
    if (this.startBtn) this.startBtn.disabled = true;
    if (this.errorMsg) this.errorMsg.style.display = 'none';

    try {
      let analyser;

      if (this.currentSource === 'generator') {
        // Start signal generator
        const waveform = this.genWaveform ? this.genWaveform.value : 'sine';
        const freq = this.genFreq ? parseFloat(this.genFreq.value) : 440;
        const amp = this.genAmp ? parseFloat(this.genAmp.value) : 0.3;
        analyser = signalGenerator.start(waveform, freq, amp);
        audioManager.setExternalAnalyser(analyser);
      } else {
        // Start microphone
        const gain = this.gainSlider ? parseFloat(this.gainSlider.value) : 1.0;
        analyser = await audioManager.startMicrophone(gain);
      }

      const fftSize = this.fftSelect ? parseInt(this.fftSelect.value) : 2048;
      audioManager.setFFTSize(fftSize);
      const smoothing = this.smoothingSlider ? parseFloat(this.smoothingSlider.value) : 0.8;
      audioManager.setSmoothing(smoothing);

      if (this.gatePanel) this.gatePanel.style.display = 'none';
      if (this.livePanel) this.livePanel.style.display = 'block';

      this._createRenderers(analyser);

      if (this.statusDot) {
        this.statusDot.classList.add('dot-rec');
      }
      if (this.statusText) {
        this.statusText.textContent = this.currentSource === 'generator'
          ? 'Generating'
          : 'Recording';
      }

      this.isRunning = true;
      this._updateResolutionInfo();
      this._renderLoop();
    } catch (err) {
      if (this.startBtn) this.startBtn.disabled = false;
      if (this.errorMsg) {
        this.errorMsg.textContent = err.message;
        this.errorMsg.style.display = 'block';
      }
    }
  }

  stop() {
    if (this.currentSource === 'generator') {
      signalGenerator.stop();
    }
    audioManager.stop();

    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }

    this.isRunning = false;
    if (this.statusDot) this.statusDot.classList.remove('dot-rec');
    if (this.statusText) this.statusText.textContent = 'Idle';

    if (this.livePanel) this.livePanel.style.display = 'none';
    if (this.gatePanel) this.gatePanel.style.display = 'block';
    if (this.startBtn) this.startBtn.disabled = false;

    // Reset readouts
    this._resetReadouts();
  }

  _resetReadouts() {
    if (this.pitchNote) this.pitchNote.textContent = '\u2014';
    if (this.pitchFreq) this.pitchFreq.textContent = '';
    if (this.pitchCents) this.pitchCents.textContent = '';
    if (this.pitchConf) this.pitchConf.textContent = '';
    if (this.bpmVal) this.bpmVal.textContent = '\u2014';
    if (this.rmsVal) this.rmsVal.textContent = '\u2014';
    if (this.peakFreqVal) this.peakFreqVal.textContent = '\u2014';
    if (this.centroidVal) this.centroidVal.textContent = '\u2014';
    if (this.beatDot) this.beatDot.classList.remove('flash');
  }

  _createRenderers(analyser) {
    const wfCanvas = document.getElementById('canvas-waveform');
    const specCanvas = document.getElementById('canvas-spectrum');
    const sgCanvas = document.getElementById('canvas-spectrogram');

    this.waveformRenderer = new WaveformRenderer(wfCanvas, analyser);
    this.spectrumRenderer = new FrequencySpectrumRenderer(specCanvas, analyser);
    this.spectrogramRenderer = new SpectrogramRenderer(sgCanvas, analyser);
    this.pitchDetector = new PitchDetector(analyser);
    this.beatDetector = new BeatDetector(analyser);

    // Apply current overlay settings
    if (this.windowOverlayType !== 'none') {
      this.spectrumRenderer.setWindowOverlay(this.windowOverlayType);
    }
  }

  _recreateRenderers() {
    const analyser = audioManager.analyser;
    if (!analyser) return;
    this._createRenderers(analyser);
  }

  _renderLoop() {
    if (!this.isRunning) return;

    const now = performance.now();

    this.waveformRenderer.render();
    this.spectrumRenderer.render();
    this.spectrogramRenderer.render(now);

    // Beat detection
    const beat = this.beatDetector.detect();
    if (beat && this.beatDot) {
      this.beatDot.classList.add('flash');
      setTimeout(() => this.beatDot.classList.remove('flash'), 100);
    }

    // Pitch detection (~10 Hz)
    if (now - this.lastPitchUpdate > 100) {
      this.lastPitchUpdate = now;
      const pitch = this.pitchDetector.detect();
      if (pitch) {
        if (this.pitchNote) this.pitchNote.textContent = pitch.name;
        if (this.pitchFreq) this.pitchFreq.textContent = `${pitch.freq.toFixed(1)} Hz`;
        const c = pitch.cents;
        if (this.pitchCents) {
          this.pitchCents.textContent = c > 0 ? `+${c}\u00a2` : `${c}\u00a2`;
        }
        if (this.pitchConf) {
          this.pitchConf.textContent = `${Math.round(this.pitchDetector.confidence * 100)}%`;
        }
        this._pitchData = pitch;
      } else if (this.pitchDetector.confidence < 0.5) {
        if (this.pitchNote) this.pitchNote.textContent = '\u2014';
        if (this.pitchFreq) this.pitchFreq.textContent = '';
        if (this.pitchCents) this.pitchCents.textContent = '';
        if (this.pitchConf) this.pitchConf.textContent = '';
        this._pitchData = null;
      }
    }

    // Numeric readouts (~10 Hz)
    if (now - this.lastReadoutUpdate > 100) {
      this.lastReadoutUpdate = now;
      this._updateReadouts();
    }

    // Harmonic analysis (~2 Hz — it's computationally expensive)
    if (this.harmonicAnalysisEnabled && now - this.lastHarmonicUpdate > 500) {
      this.lastHarmonicUpdate = now;
      const ha = this.harmonicAnalyzer.analyze(audioManager.analyser);
      if (this.spectrumRenderer) {
        this.spectrumRenderer.setHarmonicData(ha);
      }
      this._harmonicData = ha;
    }

    // Update explore panel live values (~2 Hz)
    if (this.explorePanel.isOpen() && now - this.lastExploreUpdate > 500) {
      this.lastExploreUpdate = now;
      this._updateCurrentState();
      this.explorePanel.updateContext(this._currentState);
    }

    this.animationId = requestAnimationFrame(() => this._renderLoop());
  }

  _updateReadouts() {
    const analyser = audioManager.analyser;
    if (!analyser) return;

    const freqData = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(freqData);

    const timeData = new Uint8Array(analyser.fftSize);
    analyser.getByteTimeDomainData(timeData);

    // RMS amplitude (digital, 0-1 range)
    let sumSquares = 0;
    for (let i = 0; i < timeData.length; i++) {
      const v = (timeData[i] - 128) / 128;
      sumSquares += v * v;
    }
    const rms = Math.sqrt(sumSquares / timeData.length);
    const rmsDb = rms > 0 ? 20 * Math.log10(rms) : -Infinity;

    // Store for state
    this._rms = rms;
    this._rmsDb = rmsDb;

    if (this.rmsVal) {
      this.rmsVal.textContent = rmsDb === -Infinity
        ? '−∞ dBFS'
        : `${rmsDb.toFixed(1)} dBFS`;
    }

    // Peak frequency (using byte data — approximate)
    let peakBin = 0;
    let peakValue = 0;
    for (let i = 0; i < freqData.length; i++) {
      if (freqData[i] > peakValue) {
        peakValue = freqData[i];
        peakBin = i;
      }
    }
    const peakFreq = (peakBin * audioManager.sampleRate) / analyser.fftSize;
    this._peakFreq = peakFreq > 0 && peakValue > 10 ? peakFreq : null;
    if (this.peakFreqVal) {
      if (peakFreq > 0 && peakValue > 10) {
        this.peakFreqVal.textContent = peakFreq >= 1000
          ? `${(peakFreq / 1000).toFixed(2)} kHz`
          : `${peakFreq.toFixed(0)} Hz`;
      } else {
        this.peakFreqVal.textContent = '\u2014';
      }
    }

    // Spectral centroid
    let weightedSum = 0;
    let totalMag = 0;
    for (let i = 0; i < freqData.length; i++) {
      const freq = (i * audioManager.sampleRate) / analyser.fftSize;
      const mag = freqData[i];
      weightedSum += freq * mag;
      totalMag += mag;
    }
    const centroid = totalMag > 0 ? weightedSum / totalMag : 0;
    this._centroid = centroid > 0 ? centroid : null;
    if (this.centroidVal) {
      if (centroid > 0) {
        this.centroidVal.textContent = centroid >= 1000
          ? `${(centroid / 1000).toFixed(2)} kHz`
          : `${centroid.toFixed(0)} Hz`;
      } else {
        this.centroidVal.textContent = '\u2014';
      }
    }

    // BPM
    this._bpm = this.beatDetector.bpm > 0 ? this.beatDetector.bpm : null;
    if (this.bpmVal && this.beatDetector.bpm > 0) {
      this.bpmVal.textContent = `${this.beatDetector.bpm}`;
    }
  }

  _updateCurrentState() {
    this._currentState = {
      sampleRate: audioManager.sampleRate,
      fftSize: audioManager.fftSize,
      smoothing: audioManager.smoothing,
      gain: this.gainSlider ? parseFloat(this.gainSlider.value) : 1.0,
      source: this.currentSource,
      windowType: this.windowOverlayType !== 'none' ? this.windowOverlayType : 'blackman',
      rms: this._rms || 0,
      rmsDb: this._rmsDb || null,
      peakFreq: this._peakFreq || null,
      centroid: this._centroid || null,
      pitch: this._pitchData || null,
      pitchConfidence: this.pitchDetector ? this.pitchDetector.confidence : 0,
      bpm: this._bpm || null,
      generator: signalGenerator.isActive ? {
        waveform: signalGenerator.waveform,
        frequency: signalGenerator.frequency,
        amplitude: signalGenerator.amplitude,
      } : null,
      harmonics: this._harmonicData || null,
      harmonicCount: this._harmonicData ? this._harmonicData.confirmedCount : null,
      fundamentalFreq: this._harmonicData ? this._harmonicData.fundamental.freq : null,
    };
  }

  _captureSnapshot(slot) {
    this._updateCurrentState();
    const canvas = document.getElementById('canvas-spectrum');
    this.comparison.capture(this._currentState, canvas, slot);
  }

  _updateComparison() {
    if (this.cmpView) {
      this.comparison.render(this.cmpView);
    }
  }
}
