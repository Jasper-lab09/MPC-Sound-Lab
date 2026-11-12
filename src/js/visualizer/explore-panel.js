/**
 * Explore Panel — Interactive explanations for parameters and metrics
 *
 * When the user clicks an "info" button beside a parameter or metric,
 * a side panel slides in with three sections: Mathematics, Physics,
 * and Experiment. Equations are shown, every variable is explained,
 * and where possible, live calculations use the actual current values.
 */

import { WINDOW_INFO } from './dsp-utils.js';

// ─── Definition registry ──────────────────────────────────────────

const DEFINITIONS = {
  // ── Parameters ──────────────────────────────────

  'fft-size': {
    title: 'FFT Size',
    math: [
      {
        label: 'DFT Definition',
        eq: 'X[k] = Σ x[n] · e^(−2πi·k·n/N),  k = 0…N−1',
        vars: [
          ['X[k]', 'Complex frequency component at bin k'],
          ['x[n]', 'Time-domain sample at index n'],
          ['N', 'FFT size (window length in samples)'],
          ['k', 'Frequency bin index (0 to N/2)'],
        ],
      },
      {
        label: 'Bin Frequency',
        eq: 'f_k = k · f_s / N',
        vars: [
          ['f_k', 'Frequency at bin k (Hz)'],
          ['f_s', 'Sample rate (Hz), typically 44100 or 48000'],
          ['N', 'FFT size'],
          ['k', 'Bin index'],
        ],
      },
    ],
    physics: [
      'The FFT size N determines both time and frequency resolution through a fundamental trade-off. A larger N gives finer frequency bins (better frequency resolution) but uses more time samples, so the temporal snapshot is longer (poorer time resolution). This is the uncertainty principle of signal processing, analogous to Heisenberg\'s: Δt · Δf ≥ 1/(4π).',
      'Bin spacing = f_s / N. At f_s = 44100 Hz and N = 2048, bins are 21.5 Hz apart. At N = 4096, they are 10.8 Hz apart. But bin spacing is NOT the same as the ability to distinguish two simultaneously-present tones — that depends on the window\'s main-lobe width (see Window Function).',
    ],
    experiment: [
      'Switch between FFT 512 and 4096 while humming a steady note. At 512, the spectrum updates rapidly (~86 Hz) but frequency bars are coarse (86 Hz spacing). At 4096, harmonics appear as distinct bars but the display feels sluggish (~11 Hz updates).',
      'The waveform also changes: at 512, you see ~11.6 ms of signal; at 4096, you see ~93 ms.',
    ],
    liveValues: (ctx) => {
      const fs = ctx.sampleRate || 44100;
      const N = ctx.fftSize || 2048;
      const spacing = fs / N;
      const duration = (N / fs * 1000).toFixed(1);
      return [
        ['Sample rate (f_s)', `${fs.toLocaleString()} Hz`],
        ['FFT size (N)', `${N} samples`],
        ['Bin spacing', `${spacing.toFixed(1)} Hz`],
        ['Time window', `${duration} ms`],
        ['Max frequency', `${(fs / 2).toLocaleString()} Hz`],
        ['Bin count', `${N / 2 + 1}`],
      ];
    },
  },

  'smoothing': {
    title: 'Smoothing Time Constant',
    math: [
      {
        label: 'Exponential Smoothing',
        eq: 'Y[k](t) = α · X[k](t) + (1−α) · Y[k](t−1)',
        vars: [
          ['Y[k](t)', 'Smoothed magnitude at bin k, frame t'],
          ['X[k](t)', 'Raw magnitude at bin k, frame t'],
          ['α', '1 − smoothingTimeConstant (0.01 to 1.0)'],
        ],
      },
    ],
    physics: [
      'The AnalyserNode applies exponential moving average smoothing to successive FFT frames. A high value (0.9) makes the spectrum appear stable and easy to read, but it lags behind rapid changes. A value of 0 shows every frame with no temporal averaging — responsive but visually noisy.',
      'This is equivalent to a one-pole low-pass filter in the time domain of the spectral frames. The time constant τ ≈ smoothingTimeConstant / frameRate.',
    ],
    experiment: [
      'Set smoothing to 0 and whistle. The spectrum bars jitter wildly each frame. Set it to 0.95 and the bars glide smoothly. For music analysis, 0.8 is typical. For detecting transient events (like beats), lower values help.',
    ],
    liveValues: (ctx) => {
      const s = ctx.smoothing ?? 0.8;
      const alpha = 1 - s;
      return [
        ['Smoothing constant', s.toFixed(2)],
        ['α (new data weight)', alpha.toFixed(2)],
        ['Effective averaging', `${Math.round(s * 100)}% historical`],
      ];
    },
  },

  'gain': {
    title: 'Input Gain',
    math: [
      {
        label: 'Linear Gain',
        eq: 'y[n] = G · x[n]',
        vars: [
          ['y[n]', 'Output sample'],
          ['x[n]', 'Input sample'],
          ['G', 'Gain multiplier (0.1 to 5.0)'],
        ],
      },
      {
        label: 'Gain in dB',
        eq: 'G_dB = 20 · log₁₀(G)',
        vars: [
          ['G_dB', 'Gain in decibels'],
          ['G', 'Linear gain'],
        ],
      },
    ],
    physics: [
      'Gain amplifies (or attenuates) the signal before analysis. This affects the digital amplitude but does NOT change the frequency content. Be careful: if the signal clips (exceeds ±1.0 after gain), the waveform is distorted and harmonic content appears that was not in the original signal.',
      'Gain is linear in amplitude, but perceived loudness is roughly logarithmic. Doubling gain (+6 dB) does not sound twice as loud — that requires about +10 dB.',
    ],
    experiment: [
      'Set gain to 5x and speak loudly — the waveform will clip (flatten at the top and bottom). In the spectrum, clipping introduces odd harmonics. This demonstrates why careful gain staging matters in audio engineering.',
    ],
    liveValues: (ctx) => {
      const g = ctx.gain ?? 1.0;
      const dB = 20 * Math.log10(g);
      return [
        ['Linear gain', `${g.toFixed(1)}×`],
        ['Gain in dB', `${dB >= 0 ? '+' : ''}${dB.toFixed(1)} dB`],
        ['Max output', `±${Math.min(1, g).toFixed(2)}`],
      ];
    },
  },

  // ── Metrics ──────────────────────────────────

  'rms': {
    title: 'RMS Amplitude (dBFS)',
    math: [
      {
        label: 'RMS',
        eq: 'RMS = √( (1/N) · Σ x[n]² )',
        vars: [
          ['RMS', 'Root-mean-square amplitude'],
          ['x[n]', 'Time-domain sample (−1 to +1)'],
          ['N', 'Number of samples'],
        ],
      },
      {
        label: 'dBFS',
        eq: 'dBFS = 20 · log₁₀(RMS)',
        vars: [
          ['dBFS', 'Decibels relative to full scale (0 = max)'],
          ['RMS', 'Root-mean-square amplitude'],
        ],
      },
    ],
    physics: [
      'RMS measures the average power of the signal — it correlates better with perceived loudness than peak amplitude. A full-scale sine wave has RMS = 1/√2 ≈ 0.707, which is 0 dBFS (by convention, this is the maximum before clipping).',
      'IMPORTANT: dBFS is a digital-only scale. It tells you the amplitude relative to the maximum digital value (±1.0). It does NOT tell you the sound pressure level (dB SPL) at your ears, which depends on microphone sensitivity, preamp gain, speaker volume, and distance. Converting dBFS to dB SPL requires calibration with a known reference.',
    ],
    experiment: [
      'Speak normally, then loudly. The RMS increases by about 6–10 dB. Whisper and it drops below −40 dBFS. This is why RMS is used in loudness normalization (e.g., EBU R128 broadcast standard).',
    ],
    liveValues: (ctx) => {
      const rms = ctx.rms ?? 0;
      const dbfs = rms > 0 ? 20 * Math.log10(rms) : -Infinity;
      return [
        ['RMS (linear)', rms > 0 ? rms.toFixed(4) : '—'],
        ['RMS (dBFS)', dbfs === -Infinity ? '−∞ dBFS' : `${dbfs.toFixed(1)} dBFS`],
        ['Full-scale sine', '0 dBFS (= 0.707 RMS)'],
        ['Note', 'Not calibrated to dB SPL'],
      ];
    },
  },

  'peak-freq': {
    title: 'Peak Frequency',
    math: [
      {
        label: 'Bin Frequency',
        eq: 'f_peak = k_peak · f_s / N',
        vars: [
          ['f_peak', 'Peak frequency (Hz)'],
          ['k_peak', 'Bin index of the strongest magnitude'],
          ['f_s', 'Sample rate (Hz)'],
          ['N', 'FFT size'],
        ],
      },
    ],
    physics: [
      'The peak frequency is the bin with the highest magnitude in the FFT spectrum. It tells you which frequency component is currently dominant in the signal. For a pure sine wave, this corresponds exactly to the wave\'s frequency.',
      'Note that the reported frequency is quantized to bin spacing (f_s / N). The actual frequency may be between two bins. Parabolic interpolation on the peak can improve precision to a fraction of a bin.',
    ],
    experiment: [
      'Whistle a steady tone. The peak frequency should match the pitch you hear. Now slide the whistle up and down — the peak tracks your pitch. Compare this with the pitch detector readout, which uses autocorrelation (a different algorithm).',
    ],
    liveValues: (ctx) => {
      const pf = ctx.peakFreq ?? 0;
      const fs = ctx.sampleRate || 44100;
      const N = ctx.fftSize || 2048;
      return [
        ['Peak frequency', pf > 0 ? `${pf.toFixed(1)} Hz` : '—'],
        ['Bin spacing', `${(fs / N).toFixed(1)} Hz`],
        ['Peak bin', pf > 0 ? Math.round(pf / (fs / N)) : '—'],
        ['Nyquist', `${(fs / 2).toLocaleString()} Hz`],
      ];
    },
  },

  'centroid': {
    title: 'Spectral Centroid',
    math: [
      {
        label: 'Centroid Definition',
        eq: 'SC = Σ(f_k · |X[k]|) / Σ|X[k]|',
        vars: [
          ['SC', 'Spectral centroid (Hz)'],
          ['f_k', 'Frequency at bin k (Hz)'],
          ['|X[k]|', 'Magnitude at bin k'],
        ],
      },
    ],
    physics: [
      'The spectral centroid is the "center of mass" of the spectrum — the weighted average frequency where the weights are the magnitudes. It is widely used in music information retrieval as a measure of timbre "brightness".',
      'A bright sound (cymbal crash, whisper) has a high centroid because energy is concentrated at high frequencies. A dark sound (bass note, hum) has a low centroid. This correlates strongly with human perception of timbre.',
    ],
    experiment: [
      'Hum a low note — centroid is low (200-500 Hz). Then whistle a high note — centroid jumps to 2000+ Hz. Then whisper — centroid goes even higher because the spectral energy is spread across high frequencies.',
    ],
    liveValues: (ctx) => {
      const sc = ctx.centroid ?? 0;
      return [
        ['Centroid', sc > 0 ? `${sc.toFixed(0)} Hz` : '—'],
        ['Interpretation', sc < 500 ? 'Dark / bass-heavy' : sc < 2000 ? 'Balanced' : 'Bright / treble-heavy'],
      ];
    },
  },

  'pitch': {
    title: 'Pitch Detection (Autocorrelation)',
    math: [
      {
        label: 'Normalized Autocorrelation',
        eq: 'r[τ] = (1/N) · Σ x[n] · x[n+τ] / r[0]',
        vars: [
          ['r[τ]', 'Normalized autocorrelation at lag τ'],
          ['x[n]', 'Time-domain sample'],
          ['τ', 'Lag (samples) = period of pitch'],
          ['r[0]', 'Autocorrelation at zero lag (= energy)'],
          ['N', 'Buffer length'],
        ],
      },
      {
        label: 'Frequency from Lag',
        eq: 'f₀ = f_s / τ_peak',
        vars: [
          ['f₀', 'Fundamental frequency (Hz)'],
          ['f_s', 'Sample rate (Hz)'],
          ['τ_peak', 'Lag of first significant autocorrelation peak'],
        ],
      },
      {
        label: 'Note Mapping (MIDI)',
        eq: 'MIDI = 69 + 12 · log₂(f / 440)',
        vars: [
          ['MIDI', 'MIDI note number'],
          ['f', 'Frequency (Hz)'],
          ['440', 'Reference: A4 = 440 Hz'],
        ],
      },
    ],
    physics: [
      'Autocorrelation measures how similar a signal is to a delayed copy of itself. For a periodic signal (like a vowel or a musical note), the autocorrelation peaks at lags equal to the period and its multiples. The first significant peak after the zero-lag peak gives the fundamental period.',
      'Parabolic interpolation on the autocorrelation peak provides sub-sample precision, improving frequency estimation beyond the sample-rate resolution.',
      'The algorithm works best for monophonic, harmonic signals (voice, instruments). It may give incorrect results for polyphonic input (chords) or inharmonic sounds (percussion). The confidence value indicates how reliable the detection is.',
    ],
    experiment: [
      'Sing a clear sustained vowel (like "ah") — the pitch should lock stably. Try singing "oo" vs "ee" at the same pitch — the pitch stays the same but the timbre (centroid) changes. This demonstrates that pitch and timbre are independent perceptual dimensions.',
      'Accuracy has NOT been verified with calibrated instruments. The cents deviation display is an estimate based on the autocorrelation lag and may be off by several cents, especially at the edges of the detection range.',
    ],
    liveValues: (ctx) => {
      const p = ctx.pitch;
      if (!p || !p.freq) {
        return [
          ['Status', 'No pitch detected'],
          ['Range', '80 – 1000 Hz'],
          ['Algorithm', 'Normalized autocorrelation + parabolic interp.'],
          ['Accuracy', 'Not formally tested'],
        ];
      }
      return [
        ['Detected freq', `${p.freq.toFixed(1)} Hz`],
        ['Note', p.name || '—'],
        ['Cents deviation', `${p.cents > 0 ? '+' : ''}${p.cents}¢`],
        ['Confidence', `${Math.round((ctx.pitchConfidence || 0) * 100)}%`],
        ['Accuracy', 'Not formally tested'],
      ];
    },
  },

  'beat': {
    title: 'Beat Detection (Energy Flux)',
    math: [
      {
        label: 'Instantaneous Energy',
        eq: 'E(t) = (1/K) · Σ |X[k]|²',
        vars: [
          ['E(t)', 'Instantaneous spectral energy at frame t'],
          ['X[k]', 'FFT magnitude at bin k'],
          ['K', 'Number of frequency bins'],
        ],
      },
      {
        label: 'Beat Condition',
        eq: 'beat ⟺ E(t) > C · Ē_avg',
        vars: [
          ['C', 'Sensitivity threshold (typically 1.4)'],
          ['Ē_avg', 'Rolling average energy over ~1 second'],
        ],
      },
      {
        label: 'BPM Estimation',
        eq: 'BPM = 60000 / median(Δt_beats)',
        vars: [
          ['BPM', 'Beats per minute'],
          ['Δt_beats', 'Inter-beat intervals (ms)'],
        ],
      },
    ],
    physics: [
      'Beat detection works by comparing the instantaneous energy of the current frame against a rolling average. When energy spikes above the average by a factor C, a beat is registered. This works well for rhythmic input with clear energy peaks (claps, drum hits) but less well for continuous sounds.',
      'BPM is estimated from the median of recent inter-beat intervals, which is more robust than the mean against outliers (missed beats or false triggers).',
      'This is a simplified algorithm. Professional beat detection (e.g., used in DJ software) typically combines energy-based onset detection with tempo tracking via autocorrelation of the onset envelope.',
    ],
    experiment: [
      'Clap a steady rhythm at about 120 BPM. After 4-5 claps, the BPM readout should converge near 120. Try varying the tempo — the readout adapts. The sensitivity threshold C can be adjusted: lower values detect more subtle beats but may produce false positives.',
    ],
    liveValues: (ctx) => {
      return [
        ['BPM', ctx.bpm ? `${ctx.bpm}` : '—'],
        ['Threshold (C)', '1.4×'],
        ['History window', '~1 second'],
        ['Min beat interval', '250 ms (max 240 BPM)'],
      ];
    },
  },

  // ── Signal Generator ──────────────────────────────────

  'signal-generator': {
    title: 'Signal Generator',
    math: [
      {
        label: 'Sine Wave',
        eq: 'x(t) = A · sin(2π·f·t)',
        vars: [
          ['A', 'Amplitude (0 to 1)'],
          ['f', 'Frequency (Hz)'],
          ['t', 'Time (seconds)'],
        ],
      },
      {
        label: 'Fourier Series (Square)',
        eq: 'x(t) = (4A/π) · Σ sin(2π·(2k−1)·f·t) / (2k−1)',
        vars: [
          ['k', 'Harmonic index (1, 2, 3, …)'],
          ['f', 'Fundamental frequency'],
          ['A', 'Amplitude'],
        ],
      },
    ],
    physics: [
      'A sine wave contains exactly one frequency component — it is the "purest" possible signal. In the FFT spectrum, it appears as a single peak.',
      'A square wave contains only odd harmonics (f, 3f, 5f, …) with amplitudes decreasing as 1/n. A sawtooth wave contains all harmonics (f, 2f, 3f, …) with 1/n amplitudes. A triangle wave contains odd harmonics with 1/n² amplitudes.',
      'White noise contains all frequencies at equal average power — the spectrum appears flat (with random variation per bin).',
      'By comparing the waveform (time domain) with the spectrum (frequency domain), you can see how complex waveforms are built from simpler sinusoidal components. This is the essence of Fourier analysis.',
    ],
    experiment: [
      'Generate a 440 Hz sine wave — the spectrum shows one peak at 440 Hz. Switch to square — odd harmonics appear at 1320, 2200, 3080 Hz. Switch to sawtooth — harmonics at 880, 1320, 1760 Hz (every multiple, not just odd). This visually demonstrates the Fourier series decomposition.',
    ],
    liveValues: (ctx) => {
      const g = ctx.generator;
      if (!g) return [['Status', 'Generator idle']];
      return [
        ['Waveform', g.waveform],
        ['Frequency', `${g.frequency} Hz`],
        ['Amplitude', g.amplitude.toFixed(2)],
        ['Amplitude (dB)', `${(20 * Math.log10(g.amplitude)).toFixed(1)} dB`],
      ];
    },
  },

  // ── Harmonic Analyzer ──────────────────────────────────

  'harmonic-analyzer': {
    title: 'Harmonic Analyzer',
    math: [
      {
        label: 'Harmonic Series',
        eq: 'f_h = h · f₀,  h = 1, 2, 3, …',
        vars: [
          ['f_h', 'Frequency of harmonic h'],
          ['f₀', 'Fundamental frequency (h=1)'],
          ['h', 'Harmonic number (positive integer)'],
        ],
      },
      {
        label: 'Relative Amplitude',
        eq: 'A_rel(h) = |X[f_h]| / |X[f₀]|',
        vars: [
          ['A_rel(h)', 'Relative amplitude of harmonic h'],
          ['|X[f]|', 'Spectrum magnitude at frequency f'],
        ],
      },
    ],
    physics: [
      'When a vibrating body (string, air column, vocal cord) produces sound, it typically vibrates at its fundamental frequency f₀ and simultaneously at integer multiples (harmonics). The pattern of harmonic amplitudes determines the timbre — what makes a violin sound different from a flute playing the same note.',
      'For a plucked string: harmonics decrease roughly as 1/h. For a bowed string: the spectrum is richer. For the human voice: vowels are defined by formants (resonant peaks that boost certain harmonics).',
      'The harmonic relationship f_h = h·f₀ holds for "harmonic" sounds. Inharmonic sounds (bells, drums) have non-integer frequency relationships and are analyzed differently.',
    ],
    experiment: [
      'Generate a sawtooth wave at 220 Hz and examine the harmonic analyzer. You should see harmonics at 220, 440, 660, 880 Hz (integer multiples) with decreasing amplitude. Switch to a square wave — only odd harmonics (220, 660, 1100, 1540) are present.',
      'The reliability indicator shows confidence: it is high when the fundamental is strong and multiple harmonics align with integer multiples of f₀. Peaks that do NOT align with the harmonic series are NOT labeled as harmonics.',
    ],
    liveValues: (ctx) => {
      const ha = ctx.harmonics;
      if (!ha) return [['Status', 'No harmonic analysis']];
      const rows = [
        ['Fundamental', `${ha.fundamental.freq.toFixed(1)} Hz`],
        ['Fundamental', `${ha.fundamental.dbfs.toFixed(1)} dBFS`],
        ['Confirmed harmonics', `${ha.confirmedCount}`],
        ['Reliability', `${Math.round(ha.reliability * 100)}%`],
      ];
      ha.harmonics.slice(0, 5).forEach((h) => {
        rows.push([
          `H${h.number}`,
          `${h.freq.toFixed(1)} Hz (${(h.relativeAmplitude * 100).toFixed(0)}%)${h.confirmed ? '' : ' ?'}`,
        ]);
      });
      return rows;
    },
  },

  // ── Window Function ──────────────────────────────────

  'window-function': {
    title: 'Window Function Explorer',
    math: [
      {
        label: 'Windowed DFT',
        eq: 'X_w[k] = Σ (x[n] · w[n]) · e^(−2πi·k·n/N)',
        vars: [
          ['w[n]', 'Window function value at sample n'],
          ['x[n]', 'Input signal'],
          ['N', 'FFT size'],
        ],
      },
      {
        label: 'Bin Spacing vs Resolution',
        eq: 'Δf_bin = f_s / N ≠ Δf_resolve',
        vars: [
          ['Δf_bin', 'Spacing between adjacent FFT bins'],
          ['Δf_resolve', 'Minimum separable frequency between two tones'],
        ],
      },
    ],
    physics: [
      'When we take a finite segment of a signal for FFT analysis, the abrupt truncation at the start and end creates spectral leakage — energy from one frequency spreads into adjacent bins. Window functions taper the signal smoothly to zero at the edges, reducing leakage.',
      'There is a trade-off: windows that reduce sidelobes (leakage) also widen the main lobe (frequency resolution). The rectangular window has the narrowest main lobe (2 bins) but the highest sidelobes (−13 dB). The Blackman window has the widest main lobe (6 bins) but the lowest sidelobes (−58 dB).',
      'KEY DISTINCTION: Bin spacing (f_s / N) is the distance between FFT output bins. Frequency resolution is the ability to distinguish two simultaneously-present tones — this depends on the window\'s main-lobe width. Two tones closer than the main-lobe width will appear as a single broadened peak, regardless of bin spacing.',
    ],
    experiment: [
      'Generate a sine wave at a frequency that falls exactly on a bin (e.g., 1000 Hz with N=4096, f_s=44100 — bin spacing is 10.77 Hz, so 1000 Hz falls near bin 93). With a rectangular window, you may see leakage into neighboring bins. Switch to Hann or Blackman — the peak becomes cleaner but slightly broader.',
      'Then generate two sine waves close in frequency (e.g., 1000 and 1050 Hz). With a rectangular window, you might see two distinct peaks. With a Blackman window, they may merge into one broad peak — demonstrating the resolution trade-off.',
    ],
    liveValues: (ctx) => {
      const wt = ctx.windowType || 'hann';
      const N = ctx.fftSize || 2048;
      const fs = ctx.sampleRate || 44100;
      const info = WINDOW_INFO[wt] || WINDOW_INFO.hann;
      return [
        ['Window', info.name],
        ['Main lobe width', `${info.mainLobeWidth} bins`],
        ['Sidelobe level', `${info.sidelobeLevel} dB`],
        ['Bin spacing', `${(fs / N).toFixed(1)} Hz`],
        ['Min separation', `${((info.mainLobeWidth / 2) * fs / N).toFixed(1)} Hz`],
      ];
    },
  },
};

// ─── Panel Manager ────────────────────────────────────────────────

export class ExplorePanel {
  constructor() {
    this.panel = null;
    this.overlay = null;
    this._isOpen = false;
    this._currentDef = null;
    this._currentContext = {};
    this._build();
  }

  _build() {
    // Overlay
    this.overlay = document.createElement('div');
    this.overlay.className = 'explore-overlay';
    this.overlay.addEventListener('click', () => this.close());

    // Panel
    this.panel = document.createElement('aside');
    this.panel.className = 'explore-panel';

    this.panel.innerHTML = `
      <div class="explore-head">
        <span class="explore-title" id="explore-title"></span>
        <button class="explore-close" id="explore-close" aria-label="Close">&times;</button>
      </div>
      <div class="explore-body" id="explore-body"></div>
    `;

    document.body.appendChild(this.overlay);
    document.body.appendChild(this.panel);

    document.getElementById('explore-close').addEventListener('click', () => this.close());

    // Close on Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this._isOpen) this.close();
    });
  }

  open(defKey, context = {}) {
    const def = DEFINITIONS[defKey];
    if (!def) {
      console.warn(`ExplorePanel: unknown definition "${defKey}"`);
      return;
    }

    this._currentDef = def;
    this._currentContext = context;

    document.getElementById('explore-title').textContent = def.title;
    this._renderBody(def, context);

    this.overlay.classList.add('open');
    this.panel.classList.add('open');
    this._isOpen = true;
  }

  close() {
    this.overlay.classList.remove('open');
    this.panel.classList.remove('open');
    this._isOpen = false;
  }

  isOpen() {
    return this._isOpen;
  }

  /**
   * Update live values without reopening the panel.
   */
  updateContext(context) {
    if (!this._isOpen || !this._currentDef) return;
    this._currentContext = { ...this._currentContext, ...context };
    this._renderBody(this._currentDef, this._currentContext);
  }

  _renderBody(def, ctx) {
    const body = document.getElementById('explore-body');
    let html = '';

    // Mathematics section
    html += '<div class="explore-section">';
    html += '<div class="explore-section-label">Mathematics</div>';
    for (const block of def.math) {
      html += `<div class="eq-label">${block.label}</div>`;
      html += `<div class="eq">${this._formatEq(block.eq)}</div>`;
      html += '<div class="explore-vars">';
      for (const [sym, desc] of block.vars) {
        html += `<div class="explore-var"><span class="explore-var-sym">${sym}</span><span class="explore-var-desc">${desc}</span></div>`;
      }
      html += '</div>';
    }
    html += '</div>';

    // Physics section
    html += '<div class="explore-section">';
    html += '<div class="explore-section-label">Physics</div>';
    for (const p of def.physics) {
      html += `<p class="explore-text">${p}</p>`;
    }
    html += '</div>';

    // Experiment section
    html += '<div class="explore-section">';
    html += '<div class="explore-section-label">Experiment</div>';
    for (const e of def.experiment) {
      html += `<p class="explore-text">${e}</p>`;
    }
    html += '</div>';

    // Live values
    if (def.liveValues) {
      const values = def.liveValues(ctx);
      if (values && values.length > 0) {
        html += '<div class="explore-live">';
        html += '<div class="explore-live-label">Current Values</div>';
        html += '<div class="explore-live-grid">';
        for (const [k, v] of values) {
          html += `<div class="explore-live-row"><span class="explore-live-key">${k}</span><span class="explore-live-val">${v}</span></div>`;
        }
        html += '</div>';
        html += '</div>';
      }
    }

    body.innerHTML = html;
  }

  _formatEq(eq) {
    // Basic formatting: keep as-is, the CSS handles monospace styling
    return eq;
  }
}

// Singleton
let _instance = null;
export function getExplorePanel() {
  if (!_instance) {
    _instance = new ExplorePanel();
  }
  return _instance;
}
