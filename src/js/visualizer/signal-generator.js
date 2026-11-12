/**
 * Signal Generator — Generates controlled test signals for analysis
 *
 * Supports: sine, square, triangle, sawtooth waves and white noise.
 * Uses Web Audio OscillatorNode (for periodic waves) and ScriptProcessorNode
 * (for noise) or BufferSourceNode (for pre-generated noise).
 *
 * The generated signal is routed through the analyser so it appears in
 * the waveform, spectrum, and spectrogram visualizations.
 */
import { audioManager } from '../core/audio-context.js';

export class SignalGenerator {
  constructor() {
    this._oscillator = null;
    this._noiseSource = null;
    this._noiseBuffer = null;
    this._gainNode = null;
    this._analyser = null;
    this._isActive = false;

    this._waveform = 'sine';
    this._frequency = 440;
    this._amplitude = 0.3;
  }

  /**
   * Create a periodic wave for the given waveform type.
   * OscillatorNode supports 'sine', 'square', 'triangle', 'sawtooth' natively.
   */
  _createOscillator(type, freq) {
    const ctx = audioManager.context;
    const osc = ctx.createOscillator();
    osc.type = type;
    osc.frequency.value = freq;
    return osc;
  }

  /**
   * Create a white noise source using a pre-generated buffer.
   * This avoids the deprecated ScriptProcessorNode and is more efficient.
   */
  _createNoiseSource() {
    const ctx = audioManager.context;
    const bufferSize = ctx.sampleRate * 2; // 2 seconds of noise, looped
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1; // uniform white noise [-1, 1]
    }
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    return source;
  }

  /**
   * Start generating a signal and connect it to the analyser.
   * @returns {AnalyserNode} the analyser node
   */
  start(waveform = 'sine', frequency = 440, amplitude = 0.3) {
    if (this._isActive) this.stop();

    this._waveform = waveform;
    this._frequency = frequency;
    this._amplitude = amplitude;

    const ctx = audioManager.context;

    // Ensure context is resumed
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    // Create gain node for amplitude control
    this._gainNode = ctx.createGain();
    this._gainNode.gain.value = amplitude;

    // Create analyser (separate from mic analyser, or reuse)
    this._analyser = ctx.createAnalyser();
    this._analyser.fftSize = 2048;
    this._analyser.smoothingTimeConstant = 0.8;

    if (waveform === 'noise') {
      this._noiseSource = this._createNoiseSource();
      this._noiseSource.connect(this._gainNode);
    } else {
      this._oscillator = this._createOscillator(waveform, frequency);
      this._oscillator.connect(this._gainNode);
    }

    // Connect: source → gain → analyser → destination (so user hears it too)
    this._gainNode.connect(this._analyser);
    this._gainNode.connect(ctx.destination);

    if (this._oscillator) this._oscillator.start();
    if (this._noiseSource) this._noiseSource.start();

    this._isActive = true;
    return this._analyser;
  }

  /**
   * Stop signal generation and disconnect all nodes.
   */
  stop() {
    if (this._oscillator) {
      try {
        this._oscillator.stop();
      } catch (e) {
        // already stopped
      }
      this._oscillator.disconnect();
      this._oscillator = null;
    }
    if (this._noiseSource) {
      try {
        this._noiseSource.stop();
      } catch (e) {
        // already stopped
      }
      this._noiseSource.disconnect();
      this._noiseSource = null;
    }
    if (this._gainNode) {
      this._gainNode.disconnect();
      this._gainNode = null;
    }
    this._analyser = null;
    this._isActive = false;
  }

  /**
   * Update frequency of the running oscillator.
   */
  setFrequency(freq) {
    this._frequency = freq;
    if (this._oscillator) {
      this._oscillator.frequency.setValueAtTime(
        freq,
        audioManager.context.currentTime
      );
    }
  }

  /**
   * Update amplitude (gain) of the running signal.
   */
  setAmplitude(amp) {
    this._amplitude = amp;
    if (this._gainNode) {
      this._gainNode.gain.setValueAtTime(
        amp,
        audioManager.context.currentTime
      );
    }
  }

  /**
   * Change waveform type. Requires restarting the source.
   */
  setWaveform(type) {
    if (!this._isActive) {
      this._waveform = type;
      return;
    }
    const freq = this._frequency;
    const amp = this._amplitude;
    this.stop();
    this.start(type, freq, amp);
  }

  get analyser() {
    return this._analyser;
  }

  get isActive() {
    return this._isActive;
  }

  get waveform() {
    return this._waveform;
  }

  get frequency() {
    return this._frequency;
  }

  get amplitude() {
    return this._amplitude;
  }
}

// Singleton
export const signalGenerator = new SignalGenerator();
