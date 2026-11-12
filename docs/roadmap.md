# MPC Sound Lab — Development Roadmap

## Phase 1: Platform Foundation ✅ (Current)
**Goal:** Platform structure, homepage, navigation, visual identity.

- [x] Project structure and file organization
- [x] Homepage with module overview
- [x] Navigation system connecting all modules
- [x] Dark scientific visual identity (CSS theme)
- [x] Responsive layout (desktop + mobile)

## Phase 2: Sound Visualizer MVP ✅ (Current)
**Goal:** Working real-time audio visualization.

- [x] Microphone input via getUserMedia
- [x] Real-time waveform (time-domain) visualization
- [x] Frequency spectrum (FFT) bar visualization
- [x] Spectrogram (waterfall) display
- [x] Amplitude and frequency readouts
- [x] Basic pitch detection (autocorrelation)
- [x] Basic beat detection (energy flux)
- [x] Start/stop controls

## Phase 3: Mathematical Music Generator (Planned)
**Goal:** Generate musical patterns from mathematical rules.

- [ ] BPM-based rhythm generation
- [ ] Fibonacci sequence rhythm patterns
- [ ] Modular arithmetic patterns
- [ ] Probability-based composition
- [ ] Frequency ratios and harmonic series
- [ ] Interactive piano roll editor
- [ ] Web Audio synthesizer playback
- [ ] MIDI file export

## Phase 4: Accessible Sound Experience (Planned)
**Goal:** Translate audio into visual patterns for Deaf/hard-of-hearing users.

- [ ] Sound-to-visual translation engine
- [ ] Sound category detection (speech, music, noise, beat, silence)
- [ ] Distinct visual patterns per sound category
- [ ] Customizable visual feedback (color, intensity, pattern)
- [ ] Visual sound event notifications
- [ ] Accessibility-focused interface design
- [ ] Documentation of limitations (not a safety-critical system)

## Phase 5: Polish & Publish (Planned)
**Goal:** Usability testing, accessibility improvements, deployment.

- [ ] Cross-browser testing (Chrome, Firefox, Safari, Edge)
- [ ] Mobile device testing
- [ ] Screen reader compatibility audit
- [ ] Performance optimization (60fps target)
- [ ] User documentation
- [ ] Deploy as public web app
- [ ] Collect feedback for iteration

## Technology Notes

- Phases 1-2 are implemented in pure vanilla JS + Web Audio API + Canvas.
- Phase 3 will add a MIDI export module (pure JS, no library).
- Phase 4 builds on the visualizer's AnalyserNode but adds a classification layer.
- Phase 5 may introduce a lightweight build step if performance optimization requires it.
- Python/librosa/NumPy/SciPy/Matplotlib are documented as reference implementations but not required for the live platform.
