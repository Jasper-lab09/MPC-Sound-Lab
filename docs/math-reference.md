# Mathematics & Physics Reference

This document explains the mathematics and physics behind MPC Sound Lab's core features. These are the same algorithms used in the browser implementation, documented here for educational purposes.

## 1. Sound Waves — Physics Primer

Sound is a mechanical wave that propagates through a medium (air) as pressure variations. In digital audio, we represent these pressure variations as a sequence of numbers:

- **Sample rate (fs):** Number of measurements per second (typically 44100 or 48000 Hz)
- **Bit depth:** Precision of each measurement (16-bit, 24-bit, 32-bit float)
- **Amplitude:** Pressure level, mapped to [-1, +1]
- **Frequency (f):** Number of pressure cycles per second, measured in Hz
- **Wavelength (λ):** λ = v/f, where v ≈ 343 m/s (speed of sound in air at 20°C)

### Musical Pitch
Equal-tempered scale: each semitone is a factor of `2^(1/12)` above the previous.
- A4 = 440 Hz (reference)
- A5 = 880 Hz (one octave up)
- Note frequency: `f = 440 · 2^((n-69)/12)` where n is MIDI note number

## 2. Fast Fourier Transform (FFT)

### The DFT
The Discrete Fourier Transform converts N time-domain samples into N frequency bins:

```
X[k] = Σ_{n=0}^{N-1} x[n] · e^(-2πi·kn/N)
```

### The FFT
The FFT is an efficient O(N log N) algorithm to compute the DFT. The Web Audio `AnalyserNode` uses it internally.

### Interpreting FFT Output
- `getByteFrequencyData()` returns magnitudes in the range 0–255 (8-bit scaled)
- Bin k corresponds to frequency: `f_k = k · fs / N`
- For N=2048 and fs=44100: each bin = ~21.5 Hz wide
- Only bins 0 to N/2 are meaningful (Nyquist theorem) — the rest are mirror images

### Trade-offs
| FFT Size | Frequency Resolution | Time Resolution |
|---|---|---|
| 512 | ~86 Hz | High (fast updates) |
| 1024 | ~43 Hz | Medium |
| 2048 | ~21.5 Hz | Medium (default) |
| 4096 | ~10.8 Hz | Low (slower updates) |

This is the **time-frequency uncertainty principle**: you cannot simultaneously have perfect time and frequency resolution.

## 3. Autocorrelation for Pitch Detection

### Algorithm
```
r[τ] = (1/N) · Σ_{n=0}^{N-1-τ} x[n] · x[n+τ]
```

- `r[0]` is the signal energy (always maximum)
- For a periodic signal, `r[τ]` has peaks at multiples of the fundamental period
- The first significant peak after `r[0]` indicates the fundamental period T
- Pitch frequency: `f₀ = fs / T`

### Normalization
```
r_norm[τ] = r[τ] / r[0]
```

This makes the autocorrelation independent of overall loudness.

### Limitations
- Works best for monophonic (single-note) signals
- Octave errors are common (the algorithm may lock onto a harmonic)
- Noisy signals produce less clear autocorrelation peaks

## 4. Beat Detection — Energy Flux

### Instantaneous Energy
```
E(t) = Σ_{k=0}^{N/2-1} |X[k]|²
```

### Rolling Average
```
E_avg(t) = (1/W) · Σ_{i=0}^{W-1} E(t-i)
```

where W is the window size (typically 40–50 frames).

### Beat Decision
```
if E(t) > C · E_avg(t) → BEAT
```

C is a sensitivity constant (1.3–1.5). Too low → false positives; too high → missed beats.

### BPM Estimation
```
BPM = 60 / median(Δt_beats)
```

where `Δt_beats` are recent inter-beat intervals in seconds.

## 5. Fibonacci-Based Rhythm (Module B — Planned)

### Concept
Map Fibonacci sequence values to rhythmic patterns:

```
Fibonacci: 1, 1, 2, 3, 5, 8, 13, 21, 34, 55, ...

Step pattern (mod 16):
  Step 0:  F(0) mod 16 = 1
  Step 1:  F(1) mod 16 = 1
  Step 2:  F(2) mod 16 = 2
  Step 3:  F(3) mod 16 = 3
  ...
```

Hits occur on steps where `F(n) mod stepCount == 0`, or more musically, where the Fibonacci number mod the pattern length equals the step index. This creates naturally evolving, non-repetitive but structured patterns.

### Modular Arithmetic Patterns
Euclidean rhythms — distribute N hits as evenly as possible across M steps using the Euclidean algorithm (GCD). This produces traditional rhythms like:
- (3, 8) → tresillo: [x . . x . . x .]
- (5, 8) → [x . x . x . x .]

## 6. Harmonic Series & Frequency Ratios

### Just Intonation Ratios
| Interval | Ratio | Example |
|---|---|---|
| Unison | 1:1 | 440 Hz |
| Octave | 2:1 | 880 Hz |
| Perfect Fifth | 3:2 | 660 Hz |
| Perfect Fourth | 4:3 | 586.67 Hz |
| Major Third | 5:4 | 550 Hz |
| Minor Third | 6:5 | 528 Hz |

### Harmonic Series
For a fundamental frequency f₀, harmonics are:
```
f_n = n · f₀    for n = 1, 2, 3, ...
```

The harmonic series naturally produces the intervals that make up consonant chords, which is why they sound "pleasant" — the ear's cochlea physically separates frequencies along its length, and harmonics of a single note create a regular pattern on the basilar membrane.

## 7. Spectral Centroid

A measure of the "brightness" of a sound:

```
SC = (Σ f_k · |X[k]|) / (Σ |X[k]|)
```

This is the weighted mean of frequencies, where the weight is the magnitude at each frequency. High spectral centroid = bright/sharp sound; low = dark/muffled.

## 8. RMS Amplitude

Root Mean Square — a measure of average signal power:

```
RMS = sqrt( (1/N) · Σ x[n]² )
```

In dB: `dB = 20 · log10(RMS)` (relative to full scale)

This correlates with perceived loudness better than peak amplitude.

## Reference Implementations

The Python equivalents of these algorithms (for offline analysis) would use:

```python
import numpy as np
import librosa

# FFT
y, sr = librosa.load('audio.wav')
D = np.fft.fft(y)
magnitude = np.abs(D[:len(D)//2])
frequencies = np.fft.fftfreq(len(y), 1/sr)[:len(D)//2]

# Autocorrelation pitch detection
def autocorrelation_pitch(signal, sr):
    corr = np.correlate(signal, signal, mode='full')
    corr = corr[len(corr)//2:]  # Keep right half
    corr = corr / corr[0]       # Normalize
    # Find first peak after zero crossing
    return sr / np.argmax(corr[50:]) + 50

# Beat detection
onset_env = librosa.onset.onset_strength(y, sr=sr)
tempo = librosa.beat.tempo(onset_envelope=onset_env, sr=sr)

# Spectral centroid
sc = librosa.feature.spectral_centroid(y=y, sr=sr)
```

These are documented for reference. The live platform uses equivalent algorithms implemented in JavaScript via the Web Audio API.
