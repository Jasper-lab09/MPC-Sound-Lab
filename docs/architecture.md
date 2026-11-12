# MPC Sound Lab — Architecture & Technology Stack

## 1. Technology Stack

```
Frontend:  Vanilla JavaScript (ES6+ modules) + HTML5 + CSS3
Audio:     Web Audio API (AnalyserNode, AudioContext, getUserMedia, OscillatorNode)
DSP:       Pure JS radix-2 FFT, window functions, harmonic analysis
Canvas:    Canvas 2D API for all visualizations
Build:     No build step — native ES modules served directly
```

### Why This Stack

1. **Zero dependencies, zero build step.** The entire platform runs by opening `index.html` or serving the folder with any static server. No npm, no bundler, no framework overhead.

2. **Web Audio API is the right tool.** Native, hardware-accelerated audio processing with `AnalyserNode` for FFT, `AudioContext` for graph management, `getUserMedia` for microphone access, and `OscillatorNode` for signal generation — all in the browser with sub-millisecond latency.

3. **Canvas 2D is sufficient.** For waveform plots, frequency bars, and spectrograms, Canvas 2D at 60fps is more than enough. WebGL would add complexity without visible benefit at this scale.

4. **Custom FFT engine.** The Web Audio AnalyserNode applies a Blackman window internally and cannot be changed. To explore rectangular/Hann/Hamming windows, we implemented a pure-JavaScript radix-2 Cooley-Tukey FFT that processes raw time-domain data independently.

4. **Vanilla JS keeps it modular.** ES6 modules give us clean separation without a bundler. Each module is self-contained.

5. **Python tools (librosa, NumPy, SciPy, Matplotlib)** are documented as reference implementations — they explain the mathematics and can be used for offline analysis, but the live platform is fully browser-based.

## 2. Project Architecture

```
mpc-sound-lab/
├── index.html                 # Lab dashboard / homepage
├── visualizer.html            # Module A: Sound Visualizer (four sections)
├── generator.html             # Module B: Mathematical Music Generator (four sections)
├── accessibility.html         # Module C: Accessible Sound Experience (four sections)
├── src/
│   ├── css/
│   │   ├── main.css           # Design tokens, layout, panels, controls
│   │   ├── visualizer.css     # Visualizer-specific layout
│   │   ├── generator.css      # Generator placeholder styles
│   │   └── accessibility.css  # Accessibility module styles
│   ├── js/
│   │   ├── core/
│   │   │   ├── app.js         # App initialization
│   │   │   ├── router.js      # Nav active state controller
│   │   │   └── audio-context.js  # Shared AudioContext manager
│   │   ├── visualizer/
│   │   │   ├── visualizer.js      # Main visualizer controller
│   │   │   ├── waveform.js        # Time-domain waveform (Desmos-style axes)
│   │   │   ├── frequency-spectrum.js  # FFT bar chart (log freq axis)
│   │   │   ├── spectrogram.js     # Waterfall spectrogram (axis labels)
│   │   │   ├── pitch-detector.js  # Autocorrelation pitch detection
│   │   │   └── beat-detector.js   # Energy-based beat detection
│   │   ├── generator/         # (planned Phase 3)
│   │   └── accessibility/     # (planned Phase 4)
│   └── assets/
└── docs/
    ├── architecture.md        # This file
    ├── roadmap.md             # Development roadmap
    ├── mvp-spec.md            # Sound Visualizer MVP spec
    └── math-reference.md      # Mathematics & physics documentation
```

## 3. Four-Section Module Architecture

Every module page follows the same four-section structure, creating a consistent laboratory experience:

### Section 01: Interactive Tool
The live, working tool itself. For the Sound Visualizer, this is the real-time canvas rendering with controls. For planned modules, a clearly labeled placeholder with a link to the working tool.

### Section 02: Mathematical Foundation
The equations and algorithms that power the tool. Presented in monospace equation blocks with labels, like a textbook or Desmos function definition panel.

### Section 03: Physical Foundation
The physics behind the phenomena being analyzed. Sound waves, wave equations, cochlear mechanics, consonance theory — the "why" behind what the tool shows.

### Section 04: Experiments and Findings
Guided experiments users can try with the tool, plus documented findings. Each experiment has a number, title, description, and a "Try:" call to action.

## 4. Design System

Inspired by **Ableton Live** (dark panel surfaces, toolbar strips), **Desmos** (clean labeled axes on graph areas, functional clarity), and **Linear** (minimalist typography, restrained color, refined spacing).

### Design Tokens
- **Surfaces:** 5-level dark hierarchy (`--bg-0` through `--bg-4`)
- **Text:** 4-level hierarchy (`--text-1` through `--text-4`)
- **Signal colors:** Cyan (primary), magenta (secondary), amber (pitch), green (status), red (recording)
- **Typography:** System sans for UI, monospace for data/equations
- **Radius:** 6px (panels), 3px (controls)

### Component Vocabulary
- `topbar` — minimal navigation bar (Linear-style)
- `panel` — raised surface with optional header
- `viz-toolbar` — Ableton-style control strip
- `canvas-wrap` — Desmos-style graph area with axis labels
- `readout-grid` — data readout cells
- `eq` — monospace equation block
- `experiment` — numbered experiment card
