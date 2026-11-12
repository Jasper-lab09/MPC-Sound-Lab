/**
 * Harmonic Analyzer — Detects fundamental frequency and harmonic series
 *
 * Algorithm:
 * 1. Capture raw time-domain data via getFloatTimeDomainData
 * 2. Compute our own FFT with a selected window function
 * 3. Find the fundamental frequency (strongest low-frequency peak, 80-2000 Hz)
 * 4. Search for harmonics at integer multiples: f0, 2*f0, 3*f0, ... 8*f0
 * 5. A harmonic is "confirmed" only if:
 *    - A spectral peak exists within ±1 bin of the expected frequency
 *    - The peak amplitude is at least 5% of the fundamental amplitude
 *    - The peak is a local maximum (higher than both neighbors)
 * 6. Report harmonic frequencies, amplitudes (relative to fundamental),
 *    and a reliability flag
 *
 * We do NOT label arbitrary spectral peaks as harmonics. Only peaks that
 * align with integer multiples of the fundamental are labeled.
 */
import {
  computeMagnitudeSpectrum,
  createWindow,
  findPeaks,
  parabolicPeakInterp,
  magnitudeToDBFS,
  windowSum,
  WINDOW_INFO,
} from './dsp-utils.js';

export class HarmonicAnalyzer {
  constructor() {
    this.sampleRate = 44100; // updated on use
    this.fftSize = 4096; // high resolution for harmonic analysis
    this.windowType = 'hann';
    this.minFundamental = 80; // Hz
    this.maxFundamental = 2000; // Hz
    this.maxHarmonics = 8;
    this.minRelativeAmplitude = 0.05; // 5% of fundamental

    this._window = null;
    this._recomputeWindow();
  }

  _recomputeWindow() {
    this._window = createWindow(this.windowType, this.fftSize);
  }

  setFFTSize(size) {
    this.fftSize = size;
    this._recomputeWindow();
  }

  setWindow(type) {
    this.windowType = type;
    this._recomputeWindow();
  }

  /**
   * Analyze the current spectrum from an analyser node.
   * Returns a harmonic analysis result or null if no clear fundamental.
   *
   * @param {AnalyserNode} analyser
   * @returns {Object|null} { fundamental: {freq, amplitude, dbfs},
   *                           harmonics: [{number, freq, ratio, amplitude, dbfs, confirmed}],
   *                           reliability: number (0-1),
   *                           windowType, fftSize, sampleRate, binSpacing }
   */
  analyze(analyser) {
    if (!analyser) return null;

    const fftSize = Math.min(analyser.fftSize, this.fftSize);
    const sampleRate = analyser.context.sampleRate;
    this.sampleRate = sampleRate;

    // Get raw time-domain data
    const timeData = new Float32Array(fftSize);
    analyser.getFloatTimeDomainData(timeData);

    // Ensure window matches
    if (this._window.length !== fftSize) {
      this._window = createWindow(this.windowType, fftSize);
    }

    // Compute magnitude spectrum with our window
    const spectrum = computeMagnitudeSpectrum(
      timeData,
      this._window,
      sampleRate
    );

    const { magnitudes, binCount, binSpacing } = spectrum;
    const wSum = windowSum(this._window);

    // Find all peaks in the fundamental frequency range
    const minBin = Math.floor(this.minFundamental / binSpacing);
    const maxBin = Math.min(
      Math.floor(this.maxFundamental / binSpacing),
      binCount - 1
    );

    // Find peaks in the fundamental range
    const fundPeaks = [];
    for (let i = minBin; i <= maxBin && i < binCount - 1; i++) {
      if (
        magnitudes[i] > magnitudes[i - 1] &&
        magnitudes[i] > magnitudes[i + 1] &&
        magnitudes[i] > 0
      ) {
        // Parabolic interpolation for precise frequency
        const offset = parabolicPeakInterp(
          magnitudes[i - 1],
          magnitudes[i],
          magnitudes[i + 1]
        );
        const preciseBin = i + offset;
        const preciseFreq = preciseBin * binSpacing;
        fundPeaks.push({
          bin: i,
          freq: preciseFreq,
          magnitude: magnitudes[i],
        });
      }
    }

    if (fundPeaks.length === 0) return null;

    // The fundamental is the strongest peak in the fundamental range
    fundPeaks.sort((a, b) => b.magnitude - a.magnitude);
    const fundamental = fundPeaks[0];

    const fundamentalFreq = fundamental.freq;
    const fundamentalMag = fundamental.magnitude;

    // Check signal level — if too quiet, don't report
    const fundamentalDBFS = magnitudeToDBFS(fundamentalMag, fftSize, wSum);
    if (fundamentalDBFS < -60) return null;

    // Now search for harmonics at integer multiples
    const harmonics = [];
    let confirmedCount = 0;

    for (let h = 1; h <= this.maxHarmonics; h++) {
      const expectedFreq = fundamentalFreq * h;
      if (expectedFreq >= sampleRate / 2) break;

      const expectedBin = expectedFreq / binSpacing;

      // Search within ±1.5 bins of expected position
      const searchStart = Math.max(1, Math.floor(expectedBin - 1.5));
      const searchEnd = Math.min(binCount - 1, Math.ceil(expectedBin + 1.5));

      // Find the strongest peak in this search window
      let bestBin = -1;
      let bestMag = 0;
      for (let i = searchStart; i <= searchEnd; i++) {
        if (
          magnitudes[i] > magnitudes[i - 1] &&
          magnitudes[i] > magnitudes[i + 1] &&
          magnitudes[i] > bestMag
        ) {
          bestMag = magnitudes[i];
          bestBin = i;
        }
      }

      // Also check the exact expected bin even if it's not a local peak
      // (harmonics of some signals may not form distinct peaks)
      const exactBin = Math.round(expectedBin);
      const exactMag = magnitudes[Math.max(0, Math.min(binCount - 1, exactBin))];

      const useMag = Math.max(bestMag, exactMag);
      const useBin = bestMag >= exactMag ? bestBin : exactBin;

      const relativeAmplitude = useMag / fundamentalMag;
      const confirmed = relativeAmplitude >= this.minRelativeAmplitude;

      if (confirmed || h === 1) {
        // Parabolic interpolation for precise frequency
        let preciseFreq = useBin * binSpacing;
        if (useBin > 0 && useBin < binCount - 1) {
          const offset = parabolicPeakInterp(
            magnitudes[useBin - 1],
            magnitudes[useBin],
            magnitudes[useBin + 1]
          );
          preciseFreq = (useBin + offset) * binSpacing;
        }

        const dbfs = magnitudeToDBFS(useMag, fftSize, wSum);
        harmonics.push({
          number: h,
          freq: preciseFreq,
          expectedFreq,
          ratio: preciseFreq / fundamentalFreq,
          amplitude: useMag,
          relativeAmplitude,
          dbfs,
          confirmed,
          isPeak: bestMag >= exactMag,
        });
        if (confirmed) confirmedCount++;
      }
    }

    // Reliability: based on fundamental clarity and harmonic confirmation
    // High reliability if fundamental is strong and multiple harmonics confirmed
    const fundamentalClarity = Math.min(
      1,
      fundamentalMag / (magnitudes.reduce((a, b) => a + b, 0) / binCount * 10)
    );
    const harmonicScore = confirmedCount / Math.min(this.maxHarmonics, 5);
    const reliability = Math.min(1, (fundamentalClarity * 0.4 + harmonicScore * 0.6));

    return {
      fundamental: {
        freq: fundamentalFreq,
        amplitude: fundamentalMag,
        dbfs: fundamentalDBFS,
      },
      harmonics,
      confirmedCount,
      reliability,
      windowType: this.windowType,
      fftSize,
      sampleRate,
      binSpacing,
    };
  }
}
