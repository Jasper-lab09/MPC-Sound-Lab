# MPC Sound Lab

An interactive web-based scientific laboratory for exploring the intersection of mathematics, physics, music technology, and accessibility.

## Live Modules

### Sound Visualizer (Implemented)
Real-time audio analysis from your microphone:
- Waveform (time-domain oscilloscope)
- Frequency spectrum (FFT bar chart, logarithmic scale)
- Spectrogram (waterfall display)
- Pitch detection (autocorrelation with parabolic interpolation)
- Beat detection (energy flux method)
- Spectral centroid, RMS level, peak frequency readouts

### Mathematical Music Generator (Phase 3 — Planned)
Generate musical patterns from mathematical rules: Fibonacci sequences, Euclidean rhythms, harmonic series, modular arithmetic. Will include an interactive piano roll and MIDI export.

### Accessible Sound Experience (Phase 4 — Planned)
Translating audio into visual patterns for Deaf and hard-of-hearing users. Sound category classification, customizable visual feedback, and accessibility-first interface design.

## Technology Stack

- **Vanilla JavaScript** (ES6 modules) — no framework, no build step
- **Web Audio API** — native browser audio processing (AnalyserNode, AudioContext, getUserMedia)
- **Canvas 2D API** — all visualizations rendered natively
- **HTML5 + CSS3** — dark scientific interface

No npm install. No bundler. No dependencies.

## Getting Started

### Option 1: Open directly
Open `index.html` in a modern browser. (Microphone access requires HTTPS or localhost, so use Option 2 for the visualizer.)

### Option 2: Local server (recommended)
```bash
cd mpc-sound-lab
python3 -m http.server 8000
```
Then open http://localhost:8000 in your browser.

## Project Structure

```
mpc-sound-lab/
├── index.html              # Lab dashboard / homepage
├── visualizer.html         # Module A: Sound Visualizer
├── generator.html          # Module B: Mathematical Music Generator
├── accessibility.html      # Module C: Accessible Sound Experience
├── src/
│   ├── css/
│   │   ├── main.css        # Design tokens, layout, components
│   │   ├── visualizer.css  # Visualizer layout
│   │   ├── generator.css   # Generator styles
│   │   └── accessibility.css
│   └── js/
│       ├── core/
│       │   ├── app.js          # App initialization
│       │   ├── router.js       # Navigation controller
│       │   └── audio-context.js # Shared AudioContext manager
│       └── visualizer/
│           ├── visualizer.js          # Main controller
│           ├── waveform.js            # Time-domain renderer
│           ├── frequency-spectrum.js  # FFT bar chart renderer
│           ├── spectrogram.js         # Waterfall renderer
│           ├── pitch-detector.js      # Autocorrelation pitch detection
│           └── beat-detector.js       # Energy flux beat detection
└── docs/
    ├── architecture.md     # Architecture & tech stack
    ├── roadmap.md          # Development roadmap
    ├── mvp-spec.md         # Sound Visualizer MVP specification
    └── math-reference.md   # Mathematics & physics reference
```

## Design

Inspired by Ableton Live (panel-based layout, dark studio aesthetic), Desmos (clean labeled graph axes), and Linear (minimalist typography, restrained color palette).

Each module is organized into four sections:
1. **Interactive Tool** — the working tool or placeholder
2. **Mathematical Foundation** — equations and algorithms
3. **Physical Foundation** — the physics behind the phenomena
4. **Experiments and Findings** — guided experiments to try

## Browser Requirements

- Chrome, Firefox, Safari, or Edge (latest version)
- Microphone access (for Sound Visualizer)
- `getUserMedia` support (requires HTTPS or localhost)

## No Environment Variables or API Keys

This project runs entirely client-side. There are no API keys, environment variables, or backend services to configure.

## License

This project is for educational and research purposes.

## Development Roadmap

- Phase 1: Platform Foundation (complete)
- Phase 2: Sound Visualizer MVP (complete)
- Phase 3: Mathematical Music Generator (in progress)
- Phase 4: Accessible Sound Experience (planned)
- Phase 5: Polish & Publish (planned)
