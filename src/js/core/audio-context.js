/**
 * AudioContext Manager — Shared audio context for all modules
 * Ensures a single AudioContext is used across the platform.
 * Supports both microphone input and signal generator sources.
 */
export class AudioManager {
  constructor() {
    this._context = null;
    this._analyser = null;
    this._stream = null;
    this._source = null;
    this._gainNode = null;
    this._isActive = false;
    this._sourceType = 'mic'; // 'mic' | 'generator'
    this._windowType = 'blackman'; // AnalyserNode always uses Blackman internally
    this._customFFTEnabled = false; // Whether to use custom FFT for window exploration
  }

  /**
   * Get or create the shared AudioContext
   */
  get context() {
    if (!this._context) {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      this._context = new Ctx();
    }
    return this._context;
  }

  /**
   * Start microphone capture
   * Returns a promise that resolves to the analyser node
   */
  async startMicrophone(gain = 1.0) {
    if (this._isActive) {
      return this._analyser;
    }

    try {
      this._stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
        },
      });

      this._source = this.context.createMediaStreamSource(this._stream);

      this._gainNode = this.context.createGain();
      this._gainNode.gain.value = gain;

      this._analyser = this.context.createAnalyser();
      this._analyser.fftSize = 2048;
      this._analyser.smoothingTimeConstant = 0.8;

      // Connect: source → gain → analyser (no destination — no monitoring audio)
      this._source.connect(this._gainNode);
      this._gainNode.connect(this._analyser);

      this._isActive = true;
      this._sourceType = 'mic';

      // Resume context if suspended (browser autoplay policy)
      if (this.context.state === 'suspended') {
        await this.context.resume();
      }

      return this._analyser;
    } catch (err) {
      throw new Error(`Microphone access failed: ${err.message}`);
    }
  }

  /**
   * Set up the analyser for an external source (e.g., signal generator).
   * The caller is responsible for connecting their source to this analyser.
   * @param {AnalyserNode} analyser
   */
  setExternalAnalyser(analyser) {
    this._analyser = analyser;
    this._isActive = true;
    this._sourceType = 'generator';
  }

  /**
   * Stop microphone capture and release resources
   */
  stopMicrophone() {
    if (this._stream) {
      this._stream.getTracks().forEach((track) => track.stop());
      this._stream = null;
    }
    if (this._source) {
      this._source.disconnect();
      this._source = null;
    }
    if (this._gainNode) {
      this._gainNode.disconnect();
      this._gainNode = null;
    }
    this._analyser = null;
    this._isActive = false;
    this._sourceType = 'mic';
  }

  /**
   * Stop everything — mic or external source
   */
  stop() {
    this.stopMicrophone();
  }

  get analyser() {
    return this._analyser;
  }

  get isActive() {
    return this._isActive;
  }

  get sourceType() {
    return this._sourceType;
  }

  setGain(value) {
    if (this._gainNode) {
      this._gainNode.gain.value = value;
    }
  }

  setFFTSize(size) {
    if (this._analyser) {
      this._analyser.fftSize = size;
    }
  }

  setSmoothing(value) {
    if (this._analyser) {
      this._analyser.smoothingTimeConstant = value;
    }
  }

  get sampleRate() {
    return this.context.sampleRate;
  }

  get fftSize() {
    return this._analyser ? this._analyser.fftSize : 2048;
  }

  get smoothing() {
    return this._analyser ? this._analyser.smoothingTimeConstant : 0.8;
  }
}

// Singleton instance
export const audioManager = new AudioManager();
