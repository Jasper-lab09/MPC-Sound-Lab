/**
 * Pitch Detector — Autocorrelation-based fundamental frequency detection
 *
 * Algorithm:
 * 1. Get time-domain audio data
 * 2. Compute normalized autocorrelation
 * 3. Find first significant peak after zero-lag peak
 * 4. Convert lag to frequency: f = sampleRate / lag
 * 5. Map frequency to musical note
 */
export class PitchDetector {
  constructor(analyser) {
    this.analyser = analyser;
    this.bufferLength = analyser.fftSize;
    this.timeData = new Float32Array(this.bufferLength);
    this.sampleRate = analyser.context.sampleRate;

    this.minFreq = 80;
    this.maxFreq = 1000;
    this.minLag = Math.floor(this.sampleRate / this.maxFreq);
    this.maxLag = Math.floor(this.sampleRate / this.minFreq);

    this.lastPitch = null;
    this.confidence = 0;
  }

  /**
   * Note name from frequency
   */
  _freqToNote(freq) {
    if (freq < this.minFreq) return null;
    const noteNum = 12 * Math.log2(freq / 440) + 69;
    const rounded = Math.round(noteNum);
    const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const name = noteNames[rounded % 12];
    const octave = Math.floor(rounded / 12) - 1;
    const cents = Math.round((noteNum - rounded) * 100);
    return { name: `${name}${octave}`, freq, cents };
  }

  /**
   * Detect pitch using autocorrelation
   * Returns { note, freq, cents, confidence } or null
   */
  detect() {
    this.analyser.getFloatTimeDomainData(this.timeData);

    const buffer = this.timeData;
    const N = buffer.length;

    // Compute RMS to check if there's enough signal
    let rms = 0;
    for (let i = 0; i < N; i++) {
      rms += buffer[i] * buffer[i];
    }
    rms = Math.sqrt(rms / N);

    if (rms < 0.01) {
      // Signal too quiet
      this.confidence = 0;
      return null;
    }

    // Compute autocorrelation
    const autocorrelation = new Float32Array(this.maxLag + 1);

    for (let lag = 0; lag <= this.maxLag; lag++) {
      let sum = 0;
      for (let i = 0; i < N - lag; i++) {
        sum += buffer[i] * buffer[i + lag];
      }
      autocorrelation[lag] = sum;
    }

    // Normalize by r[0]
    const r0 = autocorrelation[0];
    if (r0 === 0) {
      this.confidence = 0;
      return null;
    }

    for (let i = 0; i <= this.maxLag; i++) {
      autocorrelation[i] /= r0;
    }

    // Find the first peak after the first zero crossing
    // Start searching from minLag to avoid detecting the zero-lag peak
    let bestLag = -1;
    let bestValue = 0;

    // Find first dip after lag 0
    let firstDip = -1;
    for (let i = 1; i <= this.maxLag; i++) {
      if (autocorrelation[i] < autocorrelation[i - 1]) {
        firstDip = i;
        break;
      }
    }

    if (firstDip === -1) {
      this.confidence = 0;
      return null;
    }

    // Find the peak after the first dip, within the valid frequency range
    for (let i = Math.max(firstDip, this.minLag); i <= this.maxLag; i++) {
      if (
        autocorrelation[i] > autocorrelation[i - 1] &&
        autocorrelation[i] > autocorrelation[i + 1] &&
        autocorrelation[i] > bestValue
      ) {
        bestValue = autocorrelation[i];
        bestLag = i;
      }
    }

    if (bestLag === -1 || bestValue < 0.5) {
      this.confidence = bestValue;
      return null;
    }

    // Parabolic interpolation for more precise lag
    let preciseLag = bestLag;
    if (bestLag > 0 && bestLag < this.maxLag) {
      const x1 = bestLag - 1;
      const x2 = bestLag;
      const x3 = bestLag + 1;
      const y1 = autocorrelation[x1];
      const y2 = autocorrelation[x2];
      const y3 = autocorrelation[x3];
      const denom = (y1 - 2 * y2 + y3);
      if (denom !== 0) {
        const delta = (0.5 * (y1 - y3)) / denom;
        preciseLag = bestLag + delta;
      }
    }

    const freq = this.sampleRate / preciseLag;
    this.confidence = bestValue;

    if (freq < this.minFreq || freq > this.maxFreq) {
      return null;
    }

    const note = this._freqToNote(freq);
    return note;
  }
}
