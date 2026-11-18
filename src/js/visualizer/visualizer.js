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
import { i18n } from '../core/i18n.js';

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

    // ── Readout card interpretation elements ──
    this.pitchInterpret = document.getElementById('pitch-interpret');
    this.pitchBar = document.getElementById('pitch-bar');
    this.bpmInterpret = document.getElementById('bpm-interpret');
    this.rmsInterpret = document.getElementById('rms-interpret');
    this.rmsBar = document.getElementById('rms-bar');
    this.peakInterpret = document.getElementById('peak-interpret');
    this.centroidInterpret = document.getElementById('centroid-interpret');
    this.centroidBar = document.getElementById('centroid-bar');

    // ── Spectrum interaction elements ──
    this.spectrumTooltip = document.getElementById('spectrum-tooltip');
    this.peakInspector = document.getElementById('peak-inspector');
    this.peakBody = document.getElementById('peak-body');
    this.peakClose = document.getElementById('peak-close');

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

    // ── Re-apply dynamic text on language change ──
    window.addEventListener('langchange', () => {
      this._onLangChange();
    });

    // ── Initialize comparison view ──
    this.comparison.onUpdate(() => this._updateComparison());
    this._updateComparison();

    // ── Bind explore buttons (info icons) ──
    this._bindExploreButtons();

    // ── Bind new UX features ──
    this._bindLearnSection();
    this._bindReadoutToggles();
    this._bindExperimentCards();
    this._bindVizExploreButtons();
    this._bindVizLinks();
    this._bindPeakClose();

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
    // Update start button text using i18n
    if (this.startBtn) {
      this.startBtn.textContent = source === 'generator'
        ? i18n.t('viz.start.gen')
        : i18n.t('viz.start');
    }
  }

  _onLangChange() {
    // Update start button text based on current source
    if (this.startBtn) {
      this.startBtn.textContent = this.currentSource === 'generator'
        ? i18n.t('viz.start.gen')
        : i18n.t('viz.start');
    }
    // Update status text if not running
    if (this.statusText && !this.isRunning) {
      this.statusText.textContent = i18n.t('nav.status.idle');
    }
    // Update status text if running
    if (this.statusText && this.isRunning) {
      this.statusText.textContent = this.currentSource === 'generator'
        ? i18n.t('nav.status.gen')
        : i18n.t('nav.status.rec');
    }
    // Update readout toggle buttons
    document.querySelectorAll('.readout-card-toggle').forEach((btn) => {
      const targetId = btn.getAttribute('data-target');
      if (!targetId) return;
      const target = document.getElementById(targetId);
      const isHidden = target ? target.style.display === 'none' : true;
      btn.textContent = isHidden
        ? (i18n.getLang() === 'zh' ? '\u89e3\u91ca' : 'Explain')
        : (i18n.getLang() === 'zh' ? '\u6536\u8d77' : 'Hide');
    });
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
          ? i18n.t('nav.status.gen')
          : i18n.t('nav.status.rec');
      }

      this.isRunning = true;
      this._updateResolutionInfo();
      this._renderLoop();
    } catch (err) {
      if (this.startBtn) this.startBtn.disabled = false;
      if (this.errorMsg) {
        let msg = err.message;
        // More user-friendly error messages
        if (msg.includes('Permission denied') || msg.includes('NotAllowedError')) {
          msg = i18n.t('viz.error.mic') || 'Microphone access denied. Please allow microphone permission in your browser settings and try again.';
        } else if (msg.includes('NotFoundError') || msg.includes('DevicesNotFoundError')) {
          msg = i18n.t('viz.error.nodev') || 'No microphone found. Please connect a microphone and try again.';
        }
        this.errorMsg.textContent = msg;
        this.errorMsg.style.display = 'block';
      }
      console.error('Visualizer start error:', err);
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
    if (this.statusText) this.statusText.textContent = i18n.t('nav.status.idle');

    // Reset ambient amplitude
    document.documentElement.style.setProperty('--ambient-amplitude', '0');

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
    // Reset new elements
    if (this.pitchInterpret) this.pitchInterpret.textContent = '';
    if (this.pitchBar) this.pitchBar.style.width = '0%';
    if (this.bpmInterpret) this.bpmInterpret.textContent = '';
    if (this.rmsInterpret) this.rmsInterpret.textContent = '';
    if (this.rmsBar) this.rmsBar.style.width = '0%';
    if (this.peakInterpret) this.peakInterpret.textContent = '';
    if (this.centroidInterpret) this.centroidInterpret.textContent = '';
    if (this.centroidBar) this.centroidBar.style.width = '0%';
    if (this.peakInspector) this.peakInspector.style.display = 'none';
    if (this.spectrumTooltip) this.spectrumTooltip.style.display = 'none';
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

    // Wire spectrum interaction callbacks
    this._wireSpectrumInteraction();
  }

  _recreateRenderers() {
    const analyser = audioManager.analyser;
    if (!analyser) return;
    this._createRenderers(analyser);
  }

  // ── Spectrum interaction wiring ──────────────────────────

  _wireSpectrumInteraction() {
    if (!this.spectrumRenderer) return;

    // Hover → tooltip
    this.spectrumRenderer.onHover = (info) => {
      if (!info) {
        if (this.spectrumTooltip) this.spectrumTooltip.style.display = 'none';
        return;
      }
      if (this.spectrumTooltip) {
        const freqStr = info.freq >= 1000
          ? `${(info.freq / 1000).toFixed(2)} kHz`
          : `${info.freq.toFixed(0)} Hz`;
        let html = `<span class="tip-freq">${freqStr}</span>`;
        if (info.note) {
          html += ` <span class="tip-note">${info.note.name}`;
          if (info.note.cents !== 0) {
            html += ` ${info.note.cents > 0 ? '+' : ''}${info.note.cents}\u00a2`;
          }
          html += `</span>`;
        }
        this.spectrumTooltip.innerHTML = html;
        this.spectrumTooltip.style.display = 'block';
        this.spectrumTooltip.style.left = `${info.x}px`;
        this.spectrumTooltip.style.top = `${info.y}px`;
      }
    };

    // Click → peak inspector
    this.spectrumRenderer.onSelectPeak = (info) => {
      if (!info) {
        if (this.peakInspector) this.peakInspector.style.display = 'none';
        return;
      }
      this._showPeakInspector(info);
    };
  }

  _showPeakInspector(info) {
    if (!this.peakInspector || !this.peakBody) return;
    this.peakInspector.style.display = 'block';

    const freq = info.freq;
    const db = info.dB;
    const freqStr = freq >= 1000 ? `${(freq / 1000).toFixed(2)} kHz` : `${freq.toFixed(1)} Hz`;

    // Note name
    const midi = 69 + 12 * Math.log2(freq / 440);
    const midiRound = Math.round(midi);
    const cents = Math.round((midi - midiRound) * 100);
    const noteNames = ['C', 'C\u266f', 'D', 'D\u266f', 'E', 'F', 'F\u266f', 'G', 'G\u266f', 'A', 'A\u266f', 'B'];
    const octave = Math.floor(midiRound / 12) - 1;
    const noteName = `${noteNames[midiRound % 12]}${octave}`;
    const centsStr = cents === 0 ? '' : (cents > 0 ? ` +${cents}\u00a2` : ` ${cents}\u00a2`);

    // Check if this is a harmonic
    let harmonicInfo = '';
    if (this._harmonicData && this._harmonicData.fundamental) {
      const f0 = this._harmonicData.fundamental.freq;
      if (f0 > 0) {
        const ratio = freq / f0;
        const h = Math.round(ratio);
        if (h >= 1 && Math.abs(ratio - h) < 0.05) {
          harmonicInfo = h === 1 ? 'Fundamental (H1)' : `Harmonic H${h}`;
        }
      }
    }

    const lang = i18n.getLang();
    const labels = {
      en: { freq: 'Frequency', note: 'Note', level: 'Level', type: 'Type' },
      zh: { freq: '频率', note: '音名', level: '电平', type: '类型' },
    };
    const L = labels[lang] || labels.en;

    this.peakBody.innerHTML = `
      <div class="viz-peak-item">
        <span class="viz-peak-item-label">${L.freq}</span>
        <span class="viz-peak-item-val c-cyan">${freqStr}</span>
      </div>
      <div class="viz-peak-item">
        <span class="viz-peak-item-label">${L.note}</span>
        <span class="viz-peak-item-val c-amber">${noteName}${centsStr}</span>
      </div>
      <div class="viz-peak-item">
        <span class="viz-peak-item-label">${L.level}</span>
        <span class="viz-peak-item-val c-green">${db.toFixed(1)} dBFS</span>
      </div>
      <div class="viz-peak-item">
        <span class="viz-peak-item-label">${L.type}</span>
        <span class="viz-peak-item-val">${harmonicInfo || '\u2014'}</span>
      </div>
    `;
  }

  _bindPeakClose() {
    if (this.peakClose) {
      this.peakClose.addEventListener('click', () => {
        if (this.peakInspector) this.peakInspector.style.display = 'none';
        if (this.spectrumRenderer) this.spectrumRenderer.clearSelection();
      });
    }
  }

  // ── Readout card expand toggles ──────────────────────────

  _bindReadoutToggles() {
    document.querySelectorAll('.readout-card-toggle').forEach((btn) => {
      btn.addEventListener('click', () => {
        const targetId = btn.getAttribute('data-target');
        if (!targetId) return;
        const target = document.getElementById(targetId);
        if (!target) return;
        const isHidden = target.style.display === 'none';
        target.style.display = isHidden ? 'block' : 'none';
        btn.textContent = isHidden
          ? (i18n.getLang() === 'zh' ? '收起' : 'Hide')
          : (i18n.getLang() === 'zh' ? '解释' : 'Explain');
      });
    });
  }

  // ── Experiment auto-config ───────────────────────────────

  _bindExperimentCards() {
    document.querySelectorAll('[data-exp-config]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const config = btn.getAttribute('data-exp-config');
        this._autoConfigExperiment(config, btn);
      });
    });
  }

  _autoConfigExperiment(config, btn) {
    // Mark card as active
    document.querySelectorAll('.exp-card').forEach((c) => c.classList.remove('exp-active'));
    if (btn) {
      const card = btn.closest('.exp-card');
      if (card) card.classList.add('exp-active');
    }

    switch (config) {
      case 'fft-size':
        // Set FFT to 8192 for detailed analysis
        this._setSource('mic');
        this._setFFT('8192');
        break;

      case 'fourier':
        // Sine 440 Hz
        this._setSource('generator');
        this._setGenWaveform('sine');
        this._setGenFreq(440);
        this._setGenAmp(0.3);
        break;

      case 'leakage':
        // Sine 440 Hz, FFT 4096, rectangular overlay
        this._setSource('generator');
        this._setGenWaveform('sine');
        this._setGenFreq(440);
        this._setGenAmp(0.3);
        this._setFFT('4096');
        this._setWindow('rectangular');
        break;

      case 'harmonics':
        // Sawtooth 220 Hz + harmonics on
        this._setSource('generator');
        this._setGenWaveform('sawtooth');
        this._setGenFreq(220);
        this._setGenAmp(0.3);
        if (this.harmonicToggle) this.harmonicToggle.checked = true;
        this.harmonicAnalysisEnabled = true;
        break;

      case 'rms':
        // Microphone source
        this._setSource('mic');
        break;
    }

    // Auto-start if not running
    if (!this.isRunning) {
      this.start();
    }
  }

  _setSource(source) {
    this.currentSource = source;
    if (this.sourceSelect) this.sourceSelect.value = source;
    if (this.genPanel) this.genPanel.style.display = source === 'generator' ? 'block' : 'none';
    if (this.startBtn) {
      this.startBtn.textContent = source === 'generator'
        ? i18n.t('viz.start.gen')
        : i18n.t('viz.start');
    }
  }

  _setFFT(value) {
    if (this.fftSelect) this.fftSelect.value = value;
    if (this.fftLive) this.fftLive.value = value;
    this._onFFTChange(value);
  }

  _setGenWaveform(waveform) {
    if (this.genWaveform) this.genWaveform.value = waveform;
    if (signalGenerator.isActive) signalGenerator.setWaveform(waveform);
  }

  _setGenFreq(freq) {
    if (this.genFreq) this.genFreq.value = freq;
    if (this.genFreqVal) this.genFreqVal.textContent = `${freq} Hz`;
    if (signalGenerator.isActive) signalGenerator.setFrequency(freq);
  }

  _setGenAmp(amp) {
    if (this.genAmp) this.genAmp.value = amp;
    if (this.genAmpVal) this.genAmpVal.textContent = amp.toFixed(2);
    if (signalGenerator.isActive) signalGenerator.setAmplitude(amp);
  }

  _setWindow(type) {
    if (this.windowSelect) this.windowSelect.value = type;
    this.windowOverlayType = type;
    if (this.spectrumRenderer) this.spectrumRenderer.setWindowOverlay(type);
    this._updateResolutionInfo();
  }

  // ── Learn section navigation ─────────────────────────────

  _bindLearnSection() {
    document.querySelectorAll('.learn-topic-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const topic = btn.getAttribute('data-topic');
        this._switchLearnTopic(topic);
      });
    });
  }

  _switchLearnTopic(topic) {
    // Update button states
    document.querySelectorAll('.learn-topic-btn').forEach((b) => {
      b.classList.toggle('active', b.getAttribute('data-topic') === topic);
    });
    // Update panel visibility
    document.querySelectorAll('.learn-panel').forEach((p) => {
      p.classList.toggle('active', p.getAttribute('data-topic-panel') === topic);
    });
  }

  // ── Visualization section "Explore" buttons ──────────────

  _bindVizExploreButtons() {
    document.querySelectorAll('[data-learn]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const target = btn.getAttribute('data-learn');
        if (target === 'time-domain') {
          // Toggle inline waveform explanation
          const explain = document.getElementById('waveform-explain');
          if (explain) {
            explain.style.display = explain.style.display === 'none' ? 'block' : 'none';
          }
        } else {
          // Scroll to learn section and switch topic
          this._switchLearnTopic(target);
          const learnSection = document.getElementById('section-learn');
          if (learnSection) learnSection.scrollIntoView({ behavior: 'smooth' });
        }
      });
    });
  }

  // ── Cross-links in learn panels ──────────────────────────

  _bindVizLinks() {
    document.querySelectorAll('[data-viz-link]').forEach((el) => {
      el.addEventListener('click', () => {
        const target = el.getAttribute('data-viz-link');
        const sectionMap = {
          'waveform': 'section-waveform',
          'spectrum': 'section-spectrum',
          'spectrogram': 'section-spectrogram',
          'readouts': 'section-readouts',
        };
        const sectionId = sectionMap[target];
        if (sectionId) {
          const section = document.getElementById(sectionId);
          if (section) section.scrollIntoView({ behavior: 'smooth' });
        }
      });
    });
  }

  _renderLoop() {
    if (!this.isRunning) return;

    const now = performance.now();

    this.waveformRenderer.render();
    this.spectrumRenderer.render();
    this.spectrogramRenderer.render(now);

    // Sound-reactive ambient effect — update CSS variable on body
    // This is purely decorative; it does not affect measured data.
    if (now - (this._lastAmbientUpdate || 0) > 80) {
      this._lastAmbientUpdate = now;
      const timeData = this.waveformRenderer.dataArray;
      if (timeData) {
        let sumSq = 0;
        for (let i = 0; i < timeData.length; i++) {
          const v = (timeData[i] - 128) / 128;
          sumSq += v * v;
        }
        const rms = Math.sqrt(sumSq / timeData.length);
        const normalized = Math.min(1, rms * 3);
        document.documentElement.style.setProperty('--ambient-amplitude', normalized.toFixed(3));
      }
    }

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

    const lang = i18n.getLang();
    const freqData = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(freqData);

    const timeData = new Uint8Array(analyser.fftSize);
    analyser.getByteTimeDomainData(timeData);

    // RMS amplitude
    let sumSquares = 0;
    for (let i = 0; i < timeData.length; i++) {
      const v = (timeData[i] - 128) / 128;
      sumSquares += v * v;
    }
    const rms = Math.sqrt(sumSquares / timeData.length);
    const rmsDb = rms > 0 ? 20 * Math.log10(rms) : -Infinity;
    this._rms = rms;
    this._rmsDb = rmsDb;

    if (this.rmsVal) {
      this.rmsVal.textContent = rmsDb === -Infinity
        ? '\u2212\u221e dBFS'
        : `${rmsDb.toFixed(1)} dBFS`;
    }

    // RMS interpretation + bar
    if (this.rmsInterpret) {
      if (rmsDb === -Infinity || rmsDb < -60) {
        this.rmsInterpret.textContent = lang === 'zh' ? '\u9759\u97f3' : 'Silent';
      } else if (rmsDb < -35) {
        this.rmsInterpret.textContent = lang === 'zh' ? '\u8f7b\u58f0' : 'Quiet';
      } else if (rmsDb < -20) {
        this.rmsInterpret.textContent = lang === 'zh' ? '\u4e2d\u7b49\u97f3\u91cf' : 'Moderate';
      } else if (rmsDb < -6) {
        this.rmsInterpret.textContent = lang === 'zh' ? '\u8f83\u5927\u97f3\u91cf' : 'Loud';
      } else {
        this.rmsInterpret.textContent = lang === 'zh' ? '\u63a5\u8fd1\u524a\u6ce2' : 'Near clipping';
      }
    }
    if (this.rmsBar) {
      const pct = rmsDb === -Infinity ? 0 : Math.max(0, Math.min(100, ((rmsDb + 60) / 60) * 100));
      this.rmsBar.style.width = `${pct}%`;
    }

    // Peak frequency
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

    // Peak interpretation
    if (this.peakInterpret) {
      if (peakFreq > 0 && peakValue > 10) {
        if (peakFreq < 250) {
          this.peakInterpret.textContent = lang === 'zh' ? '\u4f4e\u9891' : 'Low frequency';
        } else if (peakFreq < 2000) {
          this.peakInterpret.textContent = lang === 'zh' ? '\u4e2d\u9891' : 'Mid frequency';
        } else if (peakFreq < 6000) {
          this.peakInterpret.textContent = lang === 'zh' ? '\u9ad8\u9891' : 'High frequency';
        } else {
          this.peakInterpret.textContent = lang === 'zh' ? '\u751a\u9ad8\u9891' : 'Very high';
        }
      } else {
        this.peakInterpret.textContent = '\u2014';
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

    // Centroid interpretation + bar
    if (this.centroidInterpret) {
      if (centroid > 0) {
        if (centroid < 500) {
          this.centroidInterpret.textContent = lang === 'zh' ? '\u6697\u8272/\u4f4e\u9891\u4e3a\u4e3b' : 'Dark / bass-heavy';
        } else if (centroid < 2000) {
          this.centroidInterpret.textContent = lang === 'zh' ? '\u5e73\u8861' : 'Balanced';
        } else {
          this.centroidInterpret.textContent = lang === 'zh' ? '\u660e\u4eae/\u9ad8\u9891\u4e3a\u4e3b' : 'Bright / treble-heavy';
        }
      } else {
        this.centroidInterpret.textContent = '\u2014';
      }
    }
    if (this.centroidBar) {
      const pct = centroid > 0 ? Math.max(0, Math.min(100, (centroid / 8000) * 100)) : 0;
      this.centroidBar.style.width = `${pct}%`;
    }

    // BPM
    this._bpm = this.beatDetector.bpm > 0 ? this.beatDetector.bpm : null;
    if (this.bpmVal && this.beatDetector.bpm > 0) {
      this.bpmVal.textContent = `${this.beatDetector.bpm}`;
    }

    // BPM interpretation
    if (this.bpmInterpret) {
      if (this.beatDetector.bpm > 0) {
        const bpm = this.beatDetector.bpm;
        if (bpm < 70) {
          this.bpmInterpret.textContent = lang === 'zh' ? '\u6162\u901f' : 'Slow';
        } else if (bpm < 120) {
          this.bpmInterpret.textContent = lang === 'zh' ? '\u4e2d\u901f' : 'Moderate';
        } else if (bpm < 160) {
          this.bpmInterpret.textContent = lang === 'zh' ? '\u5feb\u901f' : 'Fast';
        } else {
          this.bpmInterpret.textContent = lang === 'zh' ? '\u6781\u5feb' : 'Very fast';
        }
      } else {
        this.bpmInterpret.textContent = lang === 'zh' ? '\u7b49\u5f85\u8282\u62cd...' : 'Waiting for beats...';
      }
    }

    // Pitch confidence bar + interpretation
    if (this.pitchBar) {
      const conf = this.pitchDetector ? this.pitchDetector.confidence : 0;
      this.pitchBar.style.width = `${Math.round(conf * 100)}%`;
    }
    if (this.pitchInterpret) {
      const conf = this.pitchDetector ? this.pitchDetector.confidence : 0;
      if (this._pitchData && conf > 0.5) {
        this.pitchInterpret.textContent = lang === 'zh'
          ? `\u7f6e\u4fe1\u5ea6 ${Math.round(conf * 100)}%`
          : `${Math.round(conf * 100)}% confident`;
      } else {
        this.pitchInterpret.textContent = lang === 'zh' ? '\u672a\u68c0\u6d4b\u5230\u97f3\u9ad8' : 'No pitch detected';
      }
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
