/**
 * DSP Utilities — FFT engine, window functions, and spectral analysis
 *
 * This module provides a pure-JavaScript radix-2 FFT implementation and
 * a library of window functions so users can compare how different windows
 * affect spectral leakage and frequency resolution.
 *
 * The Web Audio AnalyserNode applies a Blackman window internally and
 * cannot be changed. To explore rectangular / Hann / Hamming windows,
 * we capture raw time-domain data and compute our own FFT.
 */

// ─── Window Functions ─────────────────────────────────────────────

/**
 * Generate a window function array of length N.
 * @param {string} type - 'rectangular' | 'hann' | 'hamming' | 'blackman'
 * @param {number} N - window length
 * @returns {Float32Array}
 */
export function createWindow(type, N) {
  const w = new Float32Array(N);
  switch (type) {
    case 'rectangular':
      for (let i = 0; i < N; i++) w[i] = 1.0;
      break;
    case 'hann':
      for (let i = 0; i < N; i++)
        w[i] = 0.5 * (1 - Math.cos((2 * Math.PI * i) / (N - 1)));
      break;
    case 'hamming':
      for (let i = 0; i < N; i++)
        w[i] = 0.54 - 0.46 * Math.cos((2 * Math.PI * i) / (N - 1));
      break;
    case 'blackman':
      for (let i = 0; i < N; i++)
        w[i] =
          0.42 -
          0.5 * Math.cos((2 * Math.PI * i) / (N - 1)) +
          0.08 * Math.cos((4 * Math.PI * i) / (N - 1));
      break;
    default:
      for (let i = 0; i < N; i++) w[i] = 1.0;
  }
  return w;
}

/**
 * Window metadata for display and analysis
 */
export const WINDOW_INFO = {
  rectangular: {
    name: 'Rectangular',
    mainLobeWidth: 2, // bins
    sidelobeLevel: -13, // dB
    description:
      'No windowing applied. Each frame is simply truncated at the boundaries, causing sharp discontinuities that produce significant spectral leakage. The main lobe is narrowest (best frequency resolution) but sidelobes are high (-13 dB), masking weaker nearby tones.',
  },
  hann: {
    name: 'Hann',
    mainLobeWidth: 4,
    sidelobeLevel: -31,
    description:
      'Raised cosine taper that smoothly fades to zero at both ends. Sidelobes drop to -31 dB, dramatically reducing leakage. Main lobe is wider (4 bins), so frequency resolution is lower. Good general-purpose window for spectral analysis.',
  },
  hamming: {
    name: 'Hamming',
    mainLobeWidth: 4,
    sidelobeLevel: -43,
    description:
      'Similar to Hann but with a non-zero edge (0.08). This raises the first sidelobe slightly in theory but pushes distant sidelobes lower. The Hamming window minimizes the maximum nearest sidelobe level (-43 dB). Main lobe width is the same as Hann.',
  },
  blackman: {
    name: 'Blackman',
    mainLobeWidth: 6,
    sidelobeLevel: -58,
    description:
      'Combines a second cosine term for even lower sidelobes (-58 dB). Main lobe is widest (6 bins), giving the poorest frequency resolution but excellent dynamic range. Used when detecting weak signals near strong ones. This is the default window applied by the Web Audio AnalyserNode.',
  },
};

// ─── Cooley-Tukey Radix-2 FFT ─────────────────────────────────────

/**
 * In-place complex FFT using the Cooley-Tukey radix-2 algorithm.
 * Operates on interleaved real/imag arrays.
 *
 * @param {Float32Array} re - real parts (modified in place)
 * @param {Float32Array} im - imaginary parts (modified in place)
 * @throws if length is not a power of 2
 */
export function fft(re, im) {
  const n = re.length;
  if (n <= 1) return;
  if ((n & (n - 1)) !== 0) {
    throw new Error(`FFT length must be a power of 2, got ${n}`);
  }

  // Bit-reversal permutation
  let j = 0;
  for (let i = 1; i < n; i++) {
    let bit = n >> 1;
    for (; j & bit; bit >>= 1) {
      j ^= bit;
    }
    j ^= bit;
    if (i < j) {
      const tr = re[i];
      re[i] = re[j];
      re[j] = tr;
      const ti = im[i];
      im[i] = im[j];
      im[j] = ti;
    }
  }

  // Butterfly operations
  for (let len = 2; len <= n; len <<= 1) {
    const halfLen = len >> 1;
    const angle = (-2 * Math.PI) / len;
    const wRe = Math.cos(angle);
    const wIm = Math.sin(angle);

    for (let i = 0; i < n; i += len) {
      let curWRe = 1;
      let curWIm = 0;
      for (let k = 0; k < halfLen; k++) {
        const idx1 = i + k;
        const idx2 = i + k + halfLen;
        const tRe = re[idx2] * curWRe - im[idx2] * curWIm;
        const tIm = re[idx2] * curWIm + im[idx2] * curWRe;
        re[idx2] = re[idx1] - tRe;
        im[idx2] = im[idx1] - tIm;
        re[idx1] += tRe;
        im[idx1] += tIm;
        const nextWRe = curWRe * wRe - curWIm * wIm;
        curWIm = curWRe * wIm + curWIm * wRe;
        curWRe = nextWRe;
      }
    }
  }
}

/**
 * Compute magnitude spectrum from real-valued time-domain signal.
 * Applies a window function, zero-pads if needed, and returns
 * magnitudes for bins 0..N/2 (positive frequencies only).
 *
 * @param {Float32Array} signal - time-domain samples, length must be power of 2
 * @param {Float32Array} window - window function, same length as signal
 * @param {number} sampleRate - sample rate in Hz
 * @returns {{ magnitudes: Float32Array, binCount: number, binSpacing: number, sampleRate: number }}
 */
export function computeMagnitudeSpectrum(signal, window, sampleRate) {
  const n = signal.length;
  const re = new Float32Array(n);
  const im = new Float32Array(n);

  // Apply window
  for (let i = 0; i < n; i++) {
    re[i] = signal[i] * window[i];
    im[i] = 0;
  }

  fft(re, im);

  const halfN = n >> 1;
  const magnitudes = new Float32Array(halfN + 1); // bins 0..N/2
  for (let i = 0; i <= halfN; i++) {
    magnitudes[i] = Math.sqrt(re[i] * re[i] + im[i] * im[i]);
  }

  return {
    magnitudes,
    binCount: halfN + 1,
    binSpacing: sampleRate / n,
    sampleRate,
    fftSize: n,
  };
}

/**
 * Convert magnitude to dBFS (decibels relative to full scale).
 * For a full-scale sine wave, the FFT peak reaches N/4 in magnitude
 * (before normalization). We normalize so that a full-scale sine
 * reads as 0 dBFS.
 *
 * @param {number} magnitude - raw FFT magnitude
 * @param {number} fftSize - FFT length
 * @param {number} windowSum - sum of window values (for normalization)
 * @returns {number} dBFS, or -Infinity for zero magnitude
 */
export function magnitudeToDBFS(magnitude, fftSize, windowSum) {
  if (magnitude <= 0) return -Infinity;
  // Normalize by window sum / 2 (factor of 2 for single-sided spectrum)
  const normalized = (magnitude * 2) / (windowSum || fftSize);
  if (normalized <= 0) return -Infinity;
  return 20 * Math.log10(normalized);
}

/**
 * Compute the coherent gain (sum) of a window for amplitude normalization.
 * @param {Float32Array} window
 * @returns {number}
 */
export function windowSum(window) {
  let s = 0;
  for (let i = 0; i < window.length; i++) s += window[i];
  return s;
}

/**
 * Find local maxima in a magnitude spectrum above a threshold.
 * A peak is a bin that is higher than both its immediate neighbors
 * and exceeds the minimum amplitude.
 *
 * @param {Float32Array} magnitudes - spectrum magnitudes
 * @param {number} minMagnitude - minimum magnitude to qualify
 * @param {number} minHeightAboveNeighbor - must exceed neighbors by this factor
 * @returns {Array<{bin: number, magnitude: number}>}
 */
export function findPeaks(magnitudes, minMagnitude = 0, minHeightAboveNeighbor = 1.1) {
  const peaks = [];
  const n = magnitudes.length;
  for (let i = 1; i < n - 1; i++) {
    if (
      magnitudes[i] > magnitudes[i - 1] &&
      magnitudes[i] > magnitudes[i + 1] &&
      magnitudes[i] >= minMagnitude &&
      magnitudes[i] >= magnitudes[i - 1] * minHeightAboveNeighbor &&
      magnitudes[i] >= magnitudes[i + 1] * minHeightAboveNeighbor
    ) {
      peaks.push({ bin: i, magnitude: magnitudes[i] });
    }
  }
  return peaks;
}

/**
 * Parabolic interpolation for sub-bin peak frequency estimation.
 * Given three points around a peak bin, estimate the true peak location.
 *
 * @param {number} yMinus - magnitude at bin-1
 * @param {number} yCenter - magnitude at peak bin
 * @param {number} yPlus - magnitude at bin+1
 * @returns {number} fractional offset from center bin (-0.5 to +0.5)
 */
export function parabolicPeakInterp(yMinus, yCenter, yPlus) {
  const denom = yMinus - 2 * yCenter + yPlus;
  if (denom === 0) return 0;
  return 0.5 * (yMinus - yPlus) / denom;
}

/**
 * Compute bin spacing (frequency resolution) for a given FFT size and sample rate.
 * This is the spacing between adjacent FFT bins — NOT the same as the
 * ability to resolve two close tones (which depends on window main-lobe width).
 *
 * @param {number} fftSize
 * @param {number} sampleRate
 * @returns {number} Hz per bin
 */
export function binSpacing(fftSize, sampleRate) {
  return sampleRate / fftSize;
}

/**
 * Estimate the minimum resolvable frequency separation for two tones
 * of equal amplitude, based on the window's main-lobe width.
 *
 * @param {string} windowType
 * @param {number} fftSize
 * @param {number} sampleRate
 * @returns {number} Hz
 */
export function minResolvableSeparation(windowType, fftSize, sampleRate) {
  const info = WINDOW_INFO[windowType];
  const bins = info ? info.mainLobeWidth / 2 : 1;
  return (bins * sampleRate) / fftSize;
}
