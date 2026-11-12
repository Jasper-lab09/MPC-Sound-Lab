# Sound Visualizer — MVP Specification

## Overview

The Sound Visualizer is a real-time audio analysis tool that captures microphone input and renders three complementary visualizations simultaneously, along with quantitative readouts for pitch and beat detection.

## Inputs

- **Microphone** via `navigator.mediaDevices.getUserMedia({ audio: true })`
- User must explicitly grant microphone permission (browser dialog)
- No audio is recorded or stored — all processing is real-time in memory

## Visualizations

### 1. Waveform (Time Domain)
- **Data source:** `AnalyserNode.getByteTimeDomainData()`
- **Render:** Oscilloscope-style line trace on Canvas 2D
- **Update rate:** 60 fps (requestAnimationFrame)
- **Color:** Cyan (#00e5ff)
- **Details:** X-axis = time (samples), Y-axis = amplitude (-1 to +1). Center line at zero amplitude.

### 2. Frequency Spectrum (FFT)
- **Data source:** `AnalyserNode.getByteFrequencyData()`
- **FFT size:** 2048 (configurable to 4096 for higher resolution)
- **Render:** Vertical bar chart, logarithmic frequency scale
- **Update rate:** 60 fps
- **Color:** Gradient from magenta (low freq) to cyan (high freq)
- **Details:** X-axis = frequency (Hz, logarithmic), Y-axis = magnitude (dB). Frequency labels at octaves.

### 3. Spectrogram (Waterfall)
- **Data source:** `AnalyserNode.getByteFrequencyData()` (same FFT, rendered differently)
- **Render:** Scrolling waterfall — newest FFT frame on right, scrolling left
- **Update rate:** ~30 fps (every other animation frame to reduce CPU)
- **Color:** Heatmap — dark blue (low energy) → green → yellow → red (high energy)
- **Details:** X-axis = time (scrolling), Y-axis = frequency (Hz). Shows how frequency content evolves over time.

## Analysis Readouts

### Pitch Detection
- **Algorithm:** Autocorrelation (normalized)
- **Method:** For each time-domain sample buffer, compute autocorrelation lag values. Find the first peak after the zero-lag peak. The lag with maximum correlation corresponds to the fundamental period. Convert to frequency: `f = sampleRate / lag`.
- **Display:** Note name + octave + Hz (e.g., "A4 — 440 Hz")
- **Range:** 80 Hz – 1000 Hz (covers human voice and most instruments)
- **Update rate:** ~10 Hz (every 100ms)

### Beat Detection
- **Algorithm:** Energy flux detection
- **Method:** Compute instantaneous energy (sum of squared frequency bin values). Compare to a rolling average of recent energy levels. If instantaneous energy exceeds the average by a threshold factor, register a beat.
- **Display:** Pulsing indicator + BPM estimate (beats per minute, computed from inter-beat intervals)
- **Update rate:** Continuous (event-driven)

### Amplitude & Frequency Stats
- **RMS amplitude:** sqrt(mean(timeDomainData²)) — overall loudness
- **Peak frequency:** Frequency bin with maximum magnitude
- **Spectral centroid:** Weighted mean of frequencies — describes the "brightness" of sound
- **Display:** Numeric readouts panel, updated at ~10 Hz

## Controls

| Control | Function |
|---|---|
| Start / Stop | Activate or deactivate microphone capture and visualization |
| FFT Size selector | 512, 1024, 2048, 4096 — trades frequency resolution for time resolution |
| Smoothing slider | Adjusts `AnalyserNode.smoothingTimeConstant` (0–0.99) |
| Gain slider | Input gain before analysis (does not affect output — no monitoring audio) |

## Technical Parameters

| Parameter | Default | Range |
|---|---|---|
| FFT Size | 2048 | 512–4096 (powers of 2) |
| Smoothing | 0.8 | 0–0.99 |
| Sample Rate | Browser default (typically 44100 or 48000) | — |
| Canvas refresh | 60 fps | — |
| Spectrogram scroll speed | 2px/frame | — |

## Mathematics Reference

### FFT (Fast Fourier Transform)
The Web Audio API's `AnalyserNode` performs an FFT internally on the audio stream. The FFT decomposes a time-domain signal into its frequency components:

```
X[k] = Σ x[n] · e^(-2πi·k·n/N)   for k = 0, 1, ..., N-1
```

where `x[n]` is the time-domain sample, `N` is the FFT size, and `X[k]` is the complex frequency representation. The magnitude is `|X[k]| = sqrt(Re² + Im²)`.

The frequency corresponding to bin `k` is: `f_k = k · sampleRate / N`

### Autocorrelation for Pitch Detection
```
r[τ] = (1/N) · Σ x[n] · x[n + τ]
```

Normalize `r[τ]` by `r[0]`. Find the first local maximum after the first zero crossing of the normalized autocorrelation. The lag `τ` at this maximum gives the period; frequency = `sampleRate / τ`.

### Energy-based Beat Detection
```
E_instant = Σ |X[k]|²    (sum over frequency bins)

E_avg = rolling average of E_instant over last ~50 frames

if E_instant > threshold · E_avg → BEAT
```

The threshold is typically 1.3–1.5. BPM is computed from the median of recent inter-beat intervals.
