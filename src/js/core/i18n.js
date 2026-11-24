/**
 * i18n — Internationalization system for MPC Sound Lab
 * Supports English (en) and Chinese (zh).
 * Stores preference in localStorage. Automatically translates all elements
 * with [data-i18n] attributes on page load and language switch.
 */

const translations = {
  en: {
    // ── Navigation ──────────────────────────
    'nav.home': 'Home',
    'nav.lab': 'Lab',
    'nav.visualizer': 'Sound Visualizer',
    'nav.visualizer.desc': 'Real-time audio analysis',
    'nav.generator': 'Music Generator',
    'nav.generator.desc': 'Mathematical composition',
    'nav.accessibility': 'Accessibility',
    'nav.accessibility.desc': 'Sound-to-visual translation',
    'nav.experiments': 'Experiments',
    'nav.fieldNotes': 'Field Notes',
    'nav.research': 'Research',
    'nav.about': 'About',
    'nav.status.idle': 'Idle',
    'nav.status.rec': 'Recording',
    'nav.status.gen': 'Generating',
    'nav.lang': '中文',

    // ── Footer ──────────────────────────
    'footer.brand': 'MPC Sound Lab',
    'footer.brandDesc': 'An independent digital research studio exploring the intersection of mathematics, physics, sound, music technology, and accessibility.',
    'footer.nav': 'Navigation',
    'footer.lab': 'Lab Modules',
    'footer.experiments': 'Experiments',
    'footer.knowledge': 'Knowledge',
    'footer.about': 'About',
    'footer.rights': 'All rights reserved.',
    'footer.version': 'v2.0 — Editorial Redesign',

    // ── Homepage ──────────────────────────
    'home.eyebrow': 'Interactive Scientific Laboratory',
    'home.title': 'Where sound becomes data,<br>data becomes music,<br>and music becomes accessible.',
    'home.desc': 'MPC Sound Lab is a browser-based platform for exploring the intersection of physics, mathematics, and audio engineering. Analyze live sound, generate music from mathematical structures, and experience audio through visual translation — all in real time, right here in your browser.',
    'home.domain.math': 'Mathematics',
    'home.domain.physics': 'Physics',
    'home.domain.music': 'Music Technology',
    'home.domain.audio': 'Audio Engineering',
    'home.domain.access': 'Accessibility',
    'home.modules': 'Modules',
    'home.roadmap': 'Development Roadmap',

    // Module cards
    'home.mod.viz.name': 'Sound Visualizer',
    'home.mod.viz.desc': 'Real-time audio analysis from your microphone: waveform, FFT spectrum, spectrogram waterfall, pitch and beat detection.',
    'home.mod.viz.features': 'Waveform · FFT · Spectrogram · Pitch · Beat',
    'home.mod.viz.open': 'Open module →',
    'home.mod.gen.name': 'Mathematical Music Generator',
    'home.mod.gen.desc': 'Generate musical patterns from mathematical rules: Fibonacci sequences, Euclidean rhythms, harmonic series, and probability.',
    'home.mod.gen.features': 'Fibonacci · Euclidean · Harmonic · Piano Roll · MIDI',
    'home.mod.gen.open': 'Open module →',
    'home.mod.acc.name': 'Accessible Sound Experience',
    'home.mod.acc.desc': 'Translating audio into visual patterns for Deaf and hard-of-hearing users. Distinct visual feedback for different sound categories.',
    'home.mod.acc.features': 'Translation · Detection · Customizable · Notifications',
    'home.mod.acc.open': 'Open module →',

    // Roadmap
    'home.rm.p1': 'Foundation',
    'home.rm.p1.status': 'Complete',
    'home.rm.p2': 'Visualizer',
    'home.rm.p2.status': 'Complete',
    'home.rm.p3': 'Generator',
    'home.rm.p3.status': 'In Progress',
    'home.rm.p4': 'Accessibility',
    'home.rm.p4.status': 'Planned',
    'home.rm.p5': 'Polish',
    'home.rm.p5.status': 'Planned',

    // Homepage — new editorial keys
    'home.scroll': 'Scroll to explore',
    'home.concept': 'Concept',
    'home.concept.label': 'Premise',
    'home.concept.body': 'Sound is <strong>physical</strong> — pressure waves propagating through air at 343 m/s. It is also <strong>mathematical</strong> — decomposable into pure frequencies via the Fourier transform. And it is <em>accessible</em> — translatable into visual patterns that convey the same information through a different sense. <br/><br/> This studio explores all three dimensions simultaneously. Every tool is built from first principles: a custom FFT implementation, real-time Web Audio processing, and Canvas-based generative visualization — all running locally in your browser, no servers, no data collection.',
    'home.directions': 'Research Directions',
    'home.expArchive': 'Experiment Archive',
    'home.fieldNotes': 'Field Notes',
    'home.status.live': 'Live',
    'home.status.dev': 'Phase 3',
    'home.status.planned': 'Planned',
    'home.exp1': 'Fourier Series Visualization',
    'home.exp2': 'FFT Resolution Trade-off',
    'home.exp3': 'Spectral Leakage & Windows',
    'home.exp4': 'Harmonic Structures',
    'home.exp5': 'Wave Superposition',
    'home.exp6': 'Euclidean Rhythms',
    'home.exp7': 'Mathematical Music',
    'home.exp8': 'Sound-to-Visual Translation',
    'home.fn.math': 'Mathematics',
    'home.fn.math.desc': 'Fourier transforms, autocorrelation, harmonic series, Euclidean algorithms.',
    'home.fn.physics': 'Physics',
    'home.fn.physics.desc': 'Wave mechanics, cochlear mechanics, consonance, vocal tract acoustics.',
    'home.fn.acoustics': 'Acoustics',
    'home.fn.acoustics.desc': 'Room acoustics, reverberation, standing waves, sound propagation.',
    'home.fn.signal': 'Signal Processing',
    'home.fn.signal.desc': 'FFT, window functions, spectral leakage, digital filtering, DSP fundamentals.',
    'home.fn.music': 'Music Theory',
    'home.fn.music.desc': 'Just intonation, equal temperament, harmonic series, rhythm patterns.',
    'home.fn.access': 'Accessibility',
    'home.fn.access.desc': 'Cross-modal perception, visual translation, sound classification.',

    // ── Section labels (shared) ──────────────────────────
    'section.interactive': 'Interactive Tool',
    'section.math': 'Mathematical Foundation',
    'section.physics': 'Physical Foundation',
    'section.experiments': 'Experiments and Findings',

    // ── Visualizer page ──────────────────────────
    'viz.title': 'Sound Visualizer',
    'viz.desc': 'Real-time analysis of audio from your microphone or the built-in signal generator. Three complementary visualizations — waveform, FFT spectrum, and spectrogram — alongside pitch detection, beat detection, harmonic analysis, and a window function explorer. All processing happens locally in your browser.',
    'viz.gate.title': 'Select Source & Start',
    'viz.gate.desc': 'Choose an audio source, configure parameters, then click start. Microphone audio is processed locally — nothing is recorded or transmitted. The signal generator produces controlled test tones for analysis.',
    'viz.source': 'Source',
    'viz.source.mic': 'Microphone',
    'viz.source.gen': 'Signal Generator',
    'viz.waveform': 'Waveform',
    'viz.frequency': 'Frequency',
    'viz.amplitude': 'Amplitude',
    'viz.fftSize': 'FFT Size',
    'viz.smoothing': 'Smoothing',
    'viz.gain': 'Gain',
    'viz.window': 'Window',
    'viz.window.none': 'None (AnalyserNode Blackman)',
    'viz.window.rect': 'Rectangular (overlay)',
    'viz.window.hann': 'Hann (overlay)',
    'viz.window.hamming': 'Hamming (overlay)',
    'viz.harmonics': 'Harmonics',
    'viz.harmonics.desc': 'Label harmonic peaks',
    'viz.start': 'Start Visualization',
    'viz.start.gen': 'Start Generator',
    'viz.stop': 'Stop',
    'viz.live': 'LIVE',
    'viz.canvas.waveform': 'Waveform / Time Domain',
    'viz.canvas.spectrum': 'Frequency Spectrum / FFT',
    'viz.canvas.spectrogram': 'Spectrogram / Waterfall',
    'viz.analysis': 'Analysis Readouts',
    'viz.beat': 'BEAT',
    'viz.pitch': 'Detected Pitch',
    'viz.bpm': 'BPM',
    'viz.rms': 'RMS (dBFS)',
    'viz.peakFreq': 'Peak Freq',
    'viz.centroid': 'Centroid',
    'viz.binSpacing': 'Bin Spacing',
    'viz.minResolution': 'Min Resolution',
    'viz.comparison': 'Experiment Comparison',
    'viz.captureA': 'Capture A',
    'viz.captureB': 'Capture B',
    'viz.clear': 'Clear',
    'viz.error.mic': 'Microphone access denied. Please allow microphone permission in your browser settings and try again.',
    'viz.error.nodev': 'No microphone found. Please connect a microphone and try again.',

    // Visualizer — Math section
    'viz.math.fourier.title': 'Fourier Transform',
    'viz.math.fourier.p1': 'The <strong>Discrete Fourier Transform (DFT)</strong> decomposes a time-domain signal into its frequency components:',
    'viz.math.fourier.dftLabel': 'DFT Definition',
    'viz.math.fourier.binLabel': 'Bin Frequency',
    'viz.math.fourier.p2': 'The <strong>FFT</strong> computes this in O(N log N). Bin <em>k</em> corresponds to frequency:',
    'viz.math.fourier.p3': '<strong>Important:</strong> bin spacing (f<sub>s</sub>/N) is the distance between adjacent FFT output bins. It is <em>not</em> the same as frequency resolution — the ability to distinguish two simultaneous tones depends on the window\'s main-lobe width (see Window Function Explorer).',
    'viz.math.fourier.p4': 'Click any <span style="color: var(--cyan);">ℹ</span> icon beside a parameter for detailed equations and live calculations.',
    'viz.math.autocorr.title': 'Autocorrelation & Energy Flux',
    'viz.math.autocorr.p1': '<strong>Pitch detection</strong> uses normalized autocorrelation:',
    'viz.math.autocorr.p2': 'The first peak after zero-lag gives the fundamental period. Frequency = f<sub>s</sub> / τ.',
    'viz.math.autocorr.p3': '<strong>Beat detection</strong> computes instantaneous spectral energy:',
    'viz.math.autocorr.p4': 'BPM is derived from the median of recent inter-beat intervals.',
    'viz.math.autocorr.p5': '<strong>Harmonic analysis</strong> searches for peaks at integer multiples of the fundamental (f<sub>h</sub> = h·f<sub>0</sub>). Only peaks that align with the harmonic series and exceed 5% of the fundamental amplitude are labeled.',

    // Visualizer — Physics section
    'viz.physics.sound': '<strong>Sound</strong> is a mechanical wave — pressure variations propagating through air at approximately 343 m/s (at 20°C). The human ear perceives pressure oscillations in the range of 20 Hz to 20,000 Hz.',
    'viz.physics.waveLabel': 'Wave equation',
    'viz.physics.digitalLabel': 'Digital sampling',
    'viz.physics.waveDesc': 'where <em>p</em> is acoustic pressure and <em>c</em> is the speed of sound.',
    'viz.physics.digitalDesc': 'At 44.1 kHz sample rate, frequencies up to 22.05 kHz can be represented.',
    'viz.physics.centroidLabel': 'Spectral centroid',
    'viz.physics.rmsLabel': 'RMS & dBFS',
    'viz.physics.centroidDesc': 'Weighted mean frequency — measures timbral "brightness".',
    'viz.physics.rmsDesc': '<strong>dBFS</strong> is digital amplitude relative to full scale (0 = max). It is <em>not</em> calibrated to sound pressure level (dB SPL). Converting requires a calibrated reference microphone.',
    'viz.physics.windows': '<strong>Window functions</strong> taper the signal at the boundaries to reduce spectral leakage. There is a trade-off: lower sidelobes (less leakage) come at the cost of a wider main lobe (poorer frequency resolution). The AnalyserNode uses a Blackman window by default; the overlay feature lets you compare rectangular, Hann, and Hamming windows.',

    // Visualizer — Experiments
    'viz.exp1.title': 'FFT Size — Time-Frequency Trade-off',
    'viz.exp1.desc': 'Switch between FFT 512 and 8192 while speaking or humming. At 512, the waveform updates rapidly but frequency bars are coarse (86 Hz spacing at 44.1 kHz). At 8192, harmonics become visible but the display feels sluggish (5.4 Hz updates). Use the Capture A/B buttons to compare. This demonstrates the uncertainty principle: Δt · Δf ≥ 1/(4π).',
    'viz.exp1.result': 'Try: hum at FFT 8192, capture A → switch to 512, capture B → compare',
    'viz.exp2.title': 'Signal Generator — Fourier Series Visualization',
    'viz.exp2.desc': 'Switch source to Signal Generator. Set a 440 Hz sine wave — the spectrum shows one peak. Switch to square — odd harmonics appear (1320, 2200, 3080 Hz). Switch to sawtooth — all harmonics (880, 1320, 1760 Hz). This visually demonstrates the Fourier series decomposition of periodic waveforms.',
    'viz.exp2.result': 'Try: sine → square → sawtooth at same frequency, watch harmonics appear',
    'viz.exp3.title': 'Window Function — Spectral Leakage Comparison',
    'viz.exp3.desc': 'Generate a sine wave at a frequency that doesn\'t fall on a bin boundary. Enable the rectangular window overlay — you\'ll see energy spread into neighboring bins (leakage). Switch to Hann or Hamming overlay — the peak is cleaner but slightly broader. Compare bin spacing vs. actual resolution in the readout panel.',
    'viz.exp3.result': 'Try: 440 Hz sine, rectangular overlay → Hann overlay → compare leakage',
    'viz.exp4.title': 'Harmonic Analyzer — Harmonic Series Detection',
    'viz.exp4.desc': 'Generate a sawtooth wave at 220 Hz and enable the harmonic toggle. The analyzer labels harmonic peaks at 220, 440, 660, 880 Hz (integer multiples). Switch to square — only odd harmonics are confirmed. The reliability indicator shows confidence based on harmonic alignment.',
    'viz.exp4.result': 'Try: sawtooth 220 Hz → square 220 Hz → compare harmonic patterns',
    'viz.exp5.title': 'dBFS — Digital Amplitude vs Perceived Loudness',
    'viz.exp5.desc': 'Using the microphone, speak at different volumes. The RMS readout shows dBFS — digital amplitude relative to full scale, not calibrated SPL. A 6 dB increase roughly doubles amplitude but does not double perceived loudness (that requires ~10 dB). Adjust gain to see clipping at 0 dBFS.',
    'viz.exp5.result': 'Try: speak softly vs loudly → observe ~6-10 dB difference',

    // Visualizer — Section labels (new UX)
    'section.learn': 'Learn',
    'viz.section.setup': 'Audio Setup',
    'viz.section.waveform': 'Waveform',
    'viz.section.spectrum': 'Frequency Spectrum',
    'viz.section.spectrogram': 'Spectrogram',
    'viz.section.readouts': 'Live Analysis Readouts',

    // Visualizer — Explore / Explain buttons
    'viz.explore': 'Explore',
    'viz.explain': 'Explain',

    // Visualizer — Waveform inline explanation
    'viz.wf.explain.title': 'Understanding the Waveform',
    'viz.wf.explain.body': 'The waveform shows how air pressure varies over time. The <strong>horizontal axis</strong> is time (milliseconds), and the <strong>vertical axis</strong> is amplitude (from -1 to +1, representing the digital signal range).',
    'viz.wf.var.A': 'Amplitude — how loud the sound is',
    'viz.wf.var.f': 'Frequency — how fast it oscillates (pitch)',
    'viz.wf.var.phi': 'Phase — starting position of the wave',
    'viz.wf.var.t': 'Time in seconds',

    // Visualizer — Peak inspector
    'viz.peak.inspector': 'Peak Inspector',

    // Visualizer — Readout card equation labels and notes
    'viz.pitch.eqLabel': 'Autocorrelation',
    'viz.pitch.note': 'Pitch is detected via normalized autocorrelation. The first peak after zero-lag gives the fundamental period. The confidence bar shows detection reliability.',
    'viz.bpm.eqLabel': 'Energy Flux Beat Detection',
    'viz.bpm.note': 'Beats are detected when instantaneous spectral energy exceeds the rolling average by a factor of 1.4. BPM is derived from the median of recent inter-beat intervals.',
    'viz.rms.eqLabel': 'RMS & dBFS',
    'viz.rms.note': 'dBFS measures digital amplitude relative to full scale (0 = maximum). It is NOT calibrated to sound pressure level (dB SPL). A 6 dB increase roughly doubles amplitude.',
    'viz.peak.eqLabel': 'Peak Frequency',
    'viz.peak.note': 'The peak frequency is the FFT bin with the highest magnitude. It indicates the dominant frequency component. The value is quantized to bin spacing (f_s/N).',
    'viz.centroid.eqLabel': 'Spectral Centroid',
    'viz.centroid.note': 'The spectral centroid is the weighted average frequency of the spectrum. It measures timbral "brightness" — high values indicate treble-heavy sound, low values indicate bass-heavy sound.',

    // Visualizer — Resolution info card
    'viz.resolution.title': 'Resolution Info',
    'viz.resolution.desc': 'Bin spacing = f_s/N. Actual resolution depends on window main-lobe width.',

    // Visualizer — Experiment cards
    'viz.exp.start': 'Start Experiment',
    'viz.exp1.steps': '<strong>Steps:</strong> 1. Click Start Experiment to configure. 2. Hum a steady note. 3. Capture A at FFT 8192. 4. Switch to 512. 5. Capture B. 6. Compare.',
    'viz.exp2.steps': '<strong>Steps:</strong> 1. Click Start Experiment (sets sine 440 Hz). 2. Observe single peak. 3. Switch to square → odd harmonics appear. 4. Switch to sawtooth → all harmonics. 5. Compare with Capture A/B.',
    'viz.exp3.steps': '<strong>Steps:</strong> 1. Click Start Experiment (sets sine 440 Hz, FFT 4096). 2. Set rectangular window overlay → observe leakage. 3. Capture A. 4. Switch to Hann overlay. 5. Capture B. 6. Compare peak width.',
    'viz.exp4.steps': '<strong>Steps:</strong> 1. Click Start Experiment (sawtooth 220 Hz + harmonics on). 2. Observe labeled peaks. 3. Capture A. 4. Switch to square. 5. Only odd harmonics remain. 6. Capture B → compare.',
    'viz.exp5.steps': '<strong>Steps:</strong> 1. Click Start Experiment (mic source). 2. Speak softly → note RMS (~-30 dBFS). 3. Capture A. 4. Speak loudly → note RMS (~-15 dBFS). 5. Capture B. 6. Compare the ~15 dB difference.',

    // Visualizer — Learn section topics
    'viz.learn.sound': 'Sound Waves',
    'viz.learn.time': 'Time Domain',
    'viz.learn.freq': 'Frequency Domain',
    'viz.learn.fourier': 'Fourier Transform',
    'viz.learn.sampling': 'Sampling & Nyquist',
    'viz.learn.windows': 'Window Functions',
    'viz.learn.harmonics': 'Harmonics',
    'viz.learn.pitch': 'Pitch Detection',
    'viz.learn.beat': 'Beat Detection',
    'viz.learn.rms': 'RMS & dBFS',

    // Visualizer — Learn section content
    'viz.learn.time.body': 'The <strong>time domain</strong> shows how a signal changes over time. The waveform visualization displays amplitude (vertical) against time (horizontal). Every sound can be represented this way — but it doesn\'t directly tell you what frequencies are present.',
    'viz.learn.freq.body': 'The <strong>frequency domain</strong> decomposes a signal into its constituent frequencies. The FFT spectrum shows magnitude (vertical) against frequency (horizontal, log scale). Each bar represents the energy at a particular frequency band.',
    'viz.learn.freq.body2': 'Click on peaks in the spectrum chart above to inspect individual frequencies. The spectrogram shows how the frequency content changes over time.',
    'viz.learn.sampling.body': 'Digital audio samples a continuous sound wave at discrete time intervals. The <strong>sample rate</strong> f<sub>s</sub> determines the highest frequency that can be represented:',
    'viz.learn.sampling.body2': 'At 44.1 kHz (CD quality), frequencies up to 22.05 kHz can be accurately represented. Frequencies above the Nyquist limit cause <em>aliasing</em> — they appear as false lower frequencies in the spectrum. An anti-aliasing filter removes frequencies above f<sub>s</sub>/2 before sampling.',
    'viz.learn.harmonics.body': 'A sawtooth wave contains all harmonics with amplitudes decreasing as 1/n. A square wave contains only odd harmonics. A triangle wave contains odd harmonics with 1/n² amplitudes. The pattern of harmonics determines timbre — what makes a violin sound different from a flute.',
    'viz.learn.windows.rect': 'Rectangular',

    // Visualizer — Learn section cross-links
    'viz.learn.gotoWf': 'Go to Waveform',
    'viz.learn.gotoSpec': 'Go to Spectrum',
    'viz.learn.gotoRead': 'Go to Readouts',

    // ── Generator page ──────────────────────────
    'gen.title': 'Mathematical Music Generator',
    'gen.desc': 'Generate musical patterns from mathematical structures. Fibonacci sequences, Euclidean rhythms, modular arithmetic, and harmonic series become compositional tools — revealing the deep connection between mathematics and music.',
    'gen.placeholder.title': 'Tool Under Development',
    'gen.placeholder.desc': 'The interactive generator will be built in Phase 3. It will feature a piano roll editor, real-time Web Audio synthesis, and MIDI export — all driven by selectable mathematical algorithms.',
    'gen.placeholder.cta': 'Try the Visualizer →',
    'gen.math.fib.title': 'Fibonacci Rhythms',
    'gen.math.fib.p1': 'The Fibonacci sequence (1, 1, 2, 3, 5, 8, 13, 21, ...) can be mapped to rhythmic patterns by taking values modulo the pattern length:',
    'gen.math.fib.p2': 'This creates naturally evolving, non-repetitive but structured sequences. The golden ratio φ = (1+√5)/2 ≈ 1.618 emerges as the limit ratio F(n+1)/F(n), and patterns based on it avoid exact repetition while remaining coherent.',
    'gen.math.euclid.title': 'Euclidean Rhythms',
    'gen.math.euclid.p1': 'The Euclidean algorithm for GCD can distribute <em>n</em> hits as evenly as possible across <em>m</em> steps:',
    'gen.math.euclid.p2': 'This produces traditional world rhythms:',
    'gen.math.harmonic.title': 'Harmonic Series & Just Intonation',
    'gen.math.harmonic.p1': 'For a fundamental frequency f₀, harmonics are f<sub>n</sub> = n · f₀. The ratios between early harmonics produce the consonant intervals of just intonation:',
    'gen.math.harmonic.intervalLabel': 'Interval ratios',
    'gen.math.harmonic.temperamentLabel': 'Equal temperament',
    'gen.math.harmonic.temperamentDesc': 'where n is the MIDI note number. A4 = 440 Hz is the reference.',
    'gen.physics.consonance': '<strong>Consonance and the harmonic series.</strong> When a vibrating string or column of air produces a note, it does not vibrate at a single frequency. The physical modes of vibration produce a series of integer-multiple overtones. The ear\'s cochlea physically separates frequencies along its tapered basilar membrane, and harmonics that align with integer ratios create regular excitation patterns that the auditory system processes as "consonant."',
    'gen.physics.euclid': '<strong>Why Euclidean rhythms sound good.</strong> Even distribution of hits (the Euclidean pattern) maximizes the minimum gap between hits. This regularity maps onto the brain\'s beat-tracking circuitry, which predicts the timing of the next event. When predictions are confirmed, the reward circuit engages — the rhythm "feels right."',
    'gen.physics.webaudio': '<strong>Web Audio synthesis.</strong> The OscillatorNode generates a waveform at a specified frequency. By connecting it to a GainNode (envelope) and scheduling note on/off events, we can play mathematical patterns as audible music. The AudioContext clock (sample-accurate) ensures tight timing.',
    'gen.exp1.title': 'Planned: Fibonacci vs. Euclidean Pattern Comparison',
    'gen.exp1.desc': 'Generate a 16-step pattern using both Fibonacci mapping and Euclidean distribution. Compare the rhythmic feel — Fibonacci patterns evolve asymmetrically, while Euclidean patterns have mathematically optimal evenness.',
    'gen.exp1.result': 'Status: Awaiting implementation',
    'gen.exp2.title': 'Planned: Harmonic Series as Melody',
    'gen.exp2.desc': 'Map the first 8 harmonics of a low fundamental (e.g., 110 Hz) to a melody. Listen to how the naturally decreasing interval sizes (octave, fifth, fourth, major third...) create a scale that Western music eventually approximated with equal temperament.',
    'gen.exp2.result': 'Status: Awaiting implementation',
    'gen.exp3.title': 'Planned: Probability-Based Composition',
    'gen.exp3.desc': 'Assign probabilities to each step (e.g., 0.8 for downbeat, 0.3 for offbeat). Generate multiple patterns from the same distribution and listen to how they vary while maintaining a consistent "character."',
    'gen.exp3.result': 'Status: Awaiting implementation',

    // ── Accessibility page ──────────────────────────
    'acc.title': 'Accessible Sound Experience',
    'acc.desc': 'Translating audio information into visual patterns for Deaf and hard-of-hearing users. Different sound categories produce distinct, customizable visual feedback.',
    'acc.disclaimer': '<strong>Important:</strong> This module is an experimental exploration of sound-to-visual translation. It is <strong>not</strong> a replacement for hearing, does <strong>not</strong> provide reliable safety-critical alerts, and should not be relied upon in situations where missing a sound could cause harm. It is an educational and experiential tool, not a certified assistive device.',
    'acc.placeholder.title': 'Tool Under Development',
    'acc.placeholder.desc': 'The interactive accessibility tool will be built in Phase 4. It will classify incoming audio into categories (speech, music, noise, beat, silence) and render distinct visual patterns for each category in real time.',
    'acc.placeholder.cta': 'Try the Visualizer →',
    'acc.math.classification.title': 'Sound Classification Features',
    'acc.math.classification.p1': 'Classifying sound into categories requires extracting numerical features from the audio signal:',
    'acc.math.classification.scLabel': 'Spectral centroid (brightness)',
    'acc.math.classification.zcrLabel': 'Zero-crossing rate (noisiness)',
    'acc.math.classification.sfLabel': 'Spectral flux (onset detection)',
    'acc.math.classification.p2': 'These features form a vector that can be compared against category prototypes using distance metrics or machine learning classifiers.',
    'acc.math.mapping.title': 'Pattern Mapping',
    'acc.math.mapping.p1': 'Each sound category maps to a distinct visual pattern:',
    'acc.math.mapping.p2': 'The mapping function transforms the feature vector into visual parameters:',
    'acc.math.mapping.p3': 'where F is the feature vector, M is the mapping matrix, and B is the user customization bias.',
    'acc.physics.cross': '<strong>Cross-modal perception.</strong> The human brain processes sensory information in specialized cortical areas, but cross-modal connections exist. The visual cortex can learn to interpret patterns that correspond to auditory events — this is the principle behind visual alerts, closed captioning, and visual music.',
    'acc.physics.vocal': '<strong>Vocal tract acoustics.</strong> Speech sounds are distinguished by formant frequencies — resonant peaks determined by the shape of the vocal tract. Vowels have stable formant patterns; consonants produce transient bursts or noise. These acoustic differences are visible in a spectrogram, which means they can also be translated into visual patterns without requiring the listener to hear them.',
    'acc.physics.why': '<strong>Why visual translation works.</strong> Sound is fundamentally a time-varying signal. Vision excels at detecting spatial patterns and temporal changes. By mapping frequency to spatial position and amplitude to brightness/color, we create a visual representation that preserves the information-bearing dimensions of sound. This does not replicate hearing, but it can convey the presence, category, and temporal structure of acoustic events.',
    'acc.exp1.title': 'Planned: Speech vs. Music Classification',
    'acc.exp1.desc': 'Speak normally, then play music. The system should distinguish them by spectral flatness (speech has variable spectral entropy, music has harmonic structure) and ZCR patterns (speech varies rapidly, music is more consistent).',
    'acc.exp1.result': 'Status: Awaiting implementation',
    'acc.exp2.title': 'Planned: Sudden Sound Detection',
    'acc.exp2.desc': 'Test detection of sudden sounds (door slam, hand clap) using spectral flux. These events produce a rapid change in frequency content that should trigger an immediate, high-contrast visual notification.',
    'acc.exp2.result': 'Status: Awaiting implementation',
    'acc.exp3.title': 'Planned: Customizable Pattern Sensitivity',
    'acc.exp3.desc': 'Users adjust detection thresholds and visual feedback styles (color, intensity, pattern type) to match their visual sensitivity and preferences. This tests whether personalization improves the usability of visual sound feedback.',
    'acc.exp3.result': 'Status: Awaiting implementation',
    'acc.exp4.title': 'Planned: Limitation Study',
    'acc.exp4.desc': 'Document what the system can and cannot detect. Quiet sounds, distant sounds, and sounds with similar spectral profiles may be missed or misclassified. This honest assessment is essential for setting appropriate user expectations.',
    'acc.exp4.result': 'Status: Awaiting implementation',

    // ── Explore panel section labels ──────────────────────────
    'explore.math': 'Mathematics',
    'explore.physics': 'Physics',
    'explore.experiment': 'Experiment',
    'explore.current': 'Current Values',
  },

  zh: {
    // ── 导航 ──────────────────────────
    'nav.home': '首页',
    'nav.lab': '实验室',
    'nav.visualizer': '声音可视化',
    'nav.visualizer.desc': '实时音频分析',
    'nav.generator': '音乐生成器',
    'nav.generator.desc': '数学作曲',
    'nav.accessibility': '无障碍',
    'nav.accessibility.desc': '声音-视觉转化',
    'nav.experiments': '实验',
    'nav.fieldNotes': '田野笔记',
    'nav.research': '研究',
    'nav.about': '关于',
    'nav.status.idle': '待机',
    'nav.status.rec': '录音中',
    'nav.status.gen': '生成中',
    'nav.lang': 'EN',

    // ── 页脚 ──────────────────────────
    'footer.brand': 'MPC Sound Lab',
    'footer.brandDesc': '一个独立数字研究工作室，探索数学、物理、声音、音乐技术与无障碍的交汇。',
    'footer.nav': '导航',
    'footer.lab': '实验室模块',
    'footer.experiments': '实验',
    'footer.knowledge': '知识',
    'footer.about': '关于',
    'footer.rights': '保留所有权利。',
    'footer.version': 'v2.0 — 编辑重设计',

    // ── 首页 ──────────────────────────
    'home.eyebrow': '交互式科学实验室',
    'home.title': '让声音化为数据，<br>数据化为音乐，<br>音乐化为无障碍体验。',
    'home.desc': 'MPC Sound Lab 是一个基于浏览器的平台，探索物理、数学与音频工程的交汇。实时分析声音、从数学结构生成音乐、通过视觉转化体验音频——一切都在你的浏览器中完成。',
    'home.domain.math': '数学',
    'home.domain.physics': '物理',
    'home.domain.music': '音乐技术',
    'home.domain.audio': '音频工程',
    'home.domain.access': '无障碍',
    'home.modules': '模块',
    'home.roadmap': '开发路线图',

    // 模块卡片
    'home.mod.viz.name': '声音可视化器',
    'home.mod.viz.desc': '实时分析麦克风音频：波形、FFT 频谱、瀑布频谱图、音高与节拍检测。',
    'home.mod.viz.features': '波形 · FFT · 频谱图 · 音高 · 节拍',
    'home.mod.viz.open': '进入模块 →',
    'home.mod.gen.name': '数学音乐生成器',
    'home.mod.gen.desc': '从数学规则生成音乐模式：斐波那契数列、欧几里得节奏、谐波级数与概率。',
    'home.mod.gen.features': '斐波那契 · 欧几里得 · 谐波 · 钢琴卷帘 · MIDI',
    'home.mod.gen.open': '进入模块 →',
    'home.mod.acc.name': '无障碍声音体验',
    'home.mod.acc.desc': '将音频转化为视觉图案，服务于听障用户。不同声音类别产生独特的、可定制的视觉反馈。',
    'home.mod.acc.features': '转化 · 检测 · 可定制 · 通知',
    'home.mod.acc.open': '进入模块 →',

    // 路线图
    'home.rm.p1': '基础设施',
    'home.rm.p1.status': '已完成',
    'home.rm.p2': '可视化器',
    'home.rm.p2.status': '已完成',
    'home.rm.p3': '生成器',
    'home.rm.p3.status': '开发中',
    'home.rm.p4': '无障碍',
    'home.rm.p4.status': '计划中',
    'home.rm.p5': '优化',
    'home.rm.p5.status': '计划中',

    // 首页 — 新编辑设计键
    'home.scroll': '向下滚动探索',
    'home.concept': '概念',
    'home.concept.label': '前提',
    'home.concept.body': '声音是<strong>物理的</strong>——以 343 m/s 速度在空气中传播的压力波。它也是<strong>数学的</strong>——可通过傅里叶变换分解为纯频率。它还是<em>可及的</em>——可以转化为视觉图案，通过另一种感官传递相同的信息。<br/><br/>本工作室同时探索这三个维度。每个工具都从基本原理构建：自定义 FFT 实现、实时 Web Audio 处理和基于 Canvas 的生成式可视化——全部在浏览器中本地运行，无服务器，无数据收集。',
    'home.directions': '研究方向',
    'home.expArchive': '实验档案',
    'home.fieldNotes': '田野笔记',
    'home.status.live': '在线',
    'home.status.dev': '第三阶段',
    'home.status.planned': '计划中',
    'home.exp1': '傅里叶级数可视化',
    'home.exp2': 'FFT 分辨率权衡',
    'home.exp3': '频谱泄漏与窗函数',
    'home.exp4': '谐波结构',
    'home.exp5': '波叠加',
    'home.exp6': '欧几里得节奏',
    'home.exp7': '数学音乐',
    'home.exp8': '声音-视觉转化',
    'home.fn.math': '数学',
    'home.fn.math.desc': '傅里叶变换、自相关、谐波级数、欧几里得算法。',
    'home.fn.physics': '物理',
    'home.fn.physics.desc': '波动力学、耳蜗力学、协和性、声道声学。',
    'home.fn.acoustics': '声学',
    'home.fn.acoustics.desc': '室内声学、混响、驻波、声音传播。',
    'home.fn.signal': '信号处理',
    'home.fn.signal.desc': 'FFT、窗函数、频谱泄漏、数字滤波、DSP 基础。',
    'home.fn.music': '音乐理论',
    'home.fn.music.desc': '纯律、平均律、谐波级数、节奏模式。',
    'home.fn.access': '无障碍',
    'home.fn.access.desc': '跨模态感知、视觉转化、声音分类。',

    // ── 章节标签（共享）──────────────────────────
    'section.interactive': '交互工具',
    'section.math': '数学基础',
    'section.physics': '物理基础',
    'section.experiments': '实验与发现',

    // ── 可视化器页面 ──────────────────────────
    'viz.title': '声音可视化器',
    'viz.desc': '实时分析来自麦克风或内置信号发生器的音频。三种互补的可视化——波形、FFT 频谱和频谱图——以及音高检测、节拍检测、谐波分析和窗函数探索器。所有处理均在浏览器本地完成。',
    'viz.gate.title': '选择声源并开始',
    'viz.gate.desc': '选择音频源、配置参数，然后点击开始。麦克风音频在本地处理——不会被录音或传输。信号发生器产生受控测试音调用于分析。',
    'viz.source': '声源',
    'viz.source.mic': '麦克风',
    'viz.source.gen': '信号发生器',
    'viz.waveform': '波形',
    'viz.frequency': '频率',
    'viz.amplitude': '振幅',
    'viz.fftSize': 'FFT 大小',
    'viz.smoothing': '平滑',
    'viz.gain': '增益',
    'viz.window': '窗函数',
    'viz.window.none': '无（AnalyserNode Blackman）',
    'viz.window.rect': '矩形（叠加）',
    'viz.window.hann': '汉宁窗（叠加）',
    'viz.window.hamming': '汉明窗（叠加）',
    'viz.harmonics': '谐波',
    'viz.harmonics.desc': '标注谐波峰值',
    'viz.start': '开始可视化',
    'viz.start.gen': '启动发生器',
    'viz.stop': '停止',
    'viz.live': '实时',
    'viz.canvas.waveform': '波形 / 时域',
    'viz.canvas.spectrum': '频率谱 / FFT',
    'viz.canvas.spectrogram': '频谱图 / 瀑布',
    'viz.analysis': '分析读数',
    'viz.beat': '节拍',
    'viz.pitch': '检测音高',
    'viz.bpm': 'BPM',
    'viz.rms': 'RMS (dBFS)',
    'viz.peakFreq': '峰值频率',
    'viz.centroid': '谱重心',
    'viz.binSpacing': '频率间距',
    'viz.minResolution': '最小分辨率',
    'viz.comparison': '实验对比',
    'viz.captureA': '捕获 A',
    'viz.captureB': '捕获 B',
    'viz.clear': '清除',
    'viz.error.mic': '麦克风访问被拒绝。请在浏览器设置中允许麦克风权限，然后重试。',
    'viz.error.nodev': '未找到麦克风。请连接麦克风后重试。',

    // 可视化器 — 数学部分
    'viz.math.fourier.title': '傅里叶变换',
    'viz.math.fourier.p1': '<strong>离散傅里叶变换（DFT）</strong>将时域信号分解为其频率分量：',
    'viz.math.fourier.dftLabel': 'DFT 定义',
    'viz.math.fourier.binLabel': '频率 bins',
    'viz.math.fourier.p2': '<strong>FFT</strong> 以 O(N log N) 计算此变换。Bin <em>k</em> 对应频率：',
    'viz.math.fourier.p3': '<strong>重要提示：</strong>bin 间距（f<sub>s</sub>/N）是相邻 FFT 输出 bins 之间的距离。它<em>不等于</em>频率分辨率——区分两个同时存在的音调的能力取决于窗函数的主瓣宽度（参见窗函数探索器）。',
    'viz.math.fourier.p4': '点击任意参数旁的 <span style="color: var(--cyan);">ℹ</span> 图标查看详细公式和实时计算。',
    'viz.math.autocorr.title': '自相关与能量通量',
    'viz.math.autocorr.p1': '<strong>音高检测</strong>使用归一化自相关：',
    'viz.math.autocorr.p2': '零滞后后的第一个峰值给出基频周期。频率 = f<sub>s</sub> / τ。',
    'viz.math.autocorr.p3': '<strong>节拍检测</strong>计算瞬时频谱能量：',
    'viz.math.autocorr.p4': 'BPM 由最近拍间间隔的中位数得出。',
    'viz.math.autocorr.p5': '<strong>谐波分析</strong>在基频的整数倍处搜索峰值（f<sub>h</sub> = h·f<sub>0</sub>）。只有与谐波序列对齐且超过基频振幅 5% 的峰值才会被标注。',

    // 可视化器 — 物理部分
    'viz.physics.sound': '<strong>声音</strong>是一种机械波——压力变化以约 343 m/s（20°C 时）在空气中传播。人耳感知 20 Hz 至 20,000 Hz 范围内的压力振荡。',
    'viz.physics.waveLabel': '波动方程',
    'viz.physics.digitalLabel': '数字采样',
    'viz.physics.waveDesc': '其中 <em>p</em> 为声压，<em>c</em> 为声速。',
    'viz.physics.digitalDesc': '在 44.1 kHz 采样率下，可表示高达 22.05 kHz 的频率。',
    'viz.physics.centroidLabel': '谱重心',
    'viz.physics.rmsLabel': 'RMS 与 dBFS',
    'viz.physics.centroidDesc': '加权平均频率——衡量音色"明亮度"。',
    'viz.physics.rmsDesc': '<strong>dBFS</strong> 是相对于满量程的数字振幅（0 = 最大值）。它<em>不是</em>校准的声压级（dB SPL）。转换需要校准过的参考麦克风。',
    'viz.physics.windows': '<strong>窗函数</strong>在边界处逐渐减弱信号以减少频谱泄漏。存在权衡：更低的旁瓣（更少泄漏）意味着更宽的主瓣（更差的频率分辨率）。AnalyserNode 默认使用 Blackman 窗；叠加功能可比较矩形窗、汉宁窗和汉明窗。',

    // 可视化器 — 实验
    'viz.exp1.title': 'FFT 大小 — 时频权衡',
    'viz.exp1.desc': '在说话或哼唱时在 FFT 512 和 8192 之间切换。512 时波形更新快但频率条粗糙（44.1 kHz 下 86 Hz 间距）。8192 时谐波可见但显示感觉迟钝（5.4 Hz 更新）。使用 A/B 捕获按钮比较。这展示了不确定性原理：Δt · Δf ≥ 1/(4π)。',
    'viz.exp1.result': '尝试：FFT 8192 时哼唱，捕获 A → 切换到 512，捕获 B → 比较',
    'viz.exp2.title': '信号发生器 — 傅里叶级数可视化',
    'viz.exp2.desc': '将声源切换到信号发生器。设置 440 Hz 正弦波——频谱显示一个峰。切换到方波——出现奇次谐波（1320, 2200, 3080 Hz）。切换到锯齿波——所有谐波（880, 1320, 1760 Hz）。这直观展示了周期波形的傅里叶级数分解。',
    'viz.exp2.result': '尝试：正弦 → 方波 → 锯齿波，同一频率，观察谐波出现',
    'viz.exp3.title': '窗函数 — 频谱泄漏比较',
    'viz.exp3.desc': '生成一个频率不落在 bin 边界上的正弦波。启用矩形窗叠加——你会看到能量扩散到相邻 bins（泄漏）。切换到汉宁或汉明叠加——峰值更干净但稍宽。在读数面板比较 bin 间距与实际分辨率。',
    'viz.exp3.result': '尝试：440 Hz 正弦，矩形叠加 → 汉宁叠加 → 比较泄漏',
    'viz.exp4.title': '谐波分析器 — 谐波序列检测',
    'viz.exp4.desc': '生成 220 Hz 锯齿波并启用谐波开关。分析器标注 220, 440, 660, 880 Hz 处的谐波峰值（整数倍）。切换到方波——仅确认奇次谐波。可靠性指标显示基于谐波对齐的置信度。',
    'viz.exp4.result': '尝试：锯齿波 220 Hz → 方波 220 Hz → 比较谐波模式',
    'viz.exp5.title': 'dBFS — 数字振幅与感知响度',
    'viz.exp5.desc': '使用麦克风以不同音量说话。RMS 读数显示 dBFS——相对于满量程的数字振幅，而非校准的 SPL。增加 6 dB 大约使振幅翻倍，但不会使感知响度翻倍（需要约 10 dB）。调整增益以查看 0 dBFS 处的削波。',
    'viz.exp5.result': '尝试：轻声 vs 大声说话 → 观察约 6-10 dB 差异',

    // 可视化器 — 章节标签（新 UX）
    'section.learn': '学习',
    'viz.section.setup': '音频设置',
    'viz.section.waveform': '波形',
    'viz.section.spectrum': '频率谱',
    'viz.section.spectrogram': '频谱图',
    'viz.section.readouts': '实时分析读数',

    // 可视化器 — 探索/解释按钮
    'viz.explore': '探索',
    'viz.explain': '解释',

    // 可视化器 — 波形内嵌解释
    'viz.wf.explain.title': '理解波形',
    'viz.wf.explain.body': '波形展示声压随时间的变化。<strong>水平轴</strong>是时间（毫秒），<strong>垂直轴</strong>是振幅（从 -1 到 +1，代表数字信号范围）。',
    'viz.wf.var.A': '振幅 — 声音有多响',
    'viz.wf.var.f': '频率 — 振荡有多快（音高）',
    'viz.wf.var.phi': '相位 — 波的起始位置',
    'viz.wf.var.t': '时间（秒）',

    // 可视化器 — 峰值检查器
    'viz.peak.inspector': '峰值检查器',

    // 可视化器 — 读数卡片方程标签和说明
    'viz.pitch.eqLabel': '自相关',
    'viz.pitch.note': '音高通过归一化自相关检测。零滞后后的第一个峰值给出基频周期。置信度条显示检测可靠性。',
    'viz.bpm.eqLabel': '能量通量节拍检测',
    'viz.bpm.note': '当瞬时频谱能量超过滚动平均值的 1.4 倍时检测到节拍。BPM 由最近拍间间隔的中位数得出。',
    'viz.rms.eqLabel': 'RMS 与 dBFS',
    'viz.rms.note': 'dBFS 衡量相对于满量程的数字振幅（0 = 最大值）。它不是校准的声压级（dB SPL）。6 dB 增加约使振幅翻倍。',
    'viz.peak.eqLabel': '峰值频率',
    'viz.peak.note': '峰值频率是 FFT 中幅度最高的 bin。它表示当前主导频率分量。值被量化为 bin 间距（f_s/N）。',
    'viz.centroid.eqLabel': '谱重心',
    'viz.centroid.note': '谱重心是频谱的加权平均频率。它衡量音色"明亮度"——高值表示高频为主，低值表示低频为主。',

    // 可视化器 — 分辨率信息卡
    'viz.resolution.title': '分辨率信息',
    'viz.resolution.desc': 'Bin 间距 = f_s/N。实际分辨率取决于窗函数主瓣宽度。',

    // 可视化器 — 实验卡片
    'viz.exp.start': '开始实验',
    'viz.exp1.steps': '<strong>步骤：</strong> 1. 点击开始实验配置。 2. 哼一个稳定的音。 3. FFT 8192 时捕获 A。 4. 切换到 512。 5. 捕获 B。 6. 对比。',
    'viz.exp2.steps': '<strong>步骤：</strong> 1. 点击开始实验（设置正弦 440 Hz）。 2. 观察单峰。 3. 切换到方波 → 出现奇次谐波。 4. 切换到锯齿波 → 所有谐波。 5. 用 A/B 捕获对比。',
    'viz.exp3.steps': '<strong>步骤：</strong> 1. 点击开始实验（正弦 440 Hz，FFT 4096）。 2. 设置矩形窗叠加 → 观察泄漏。 3. 捕获 A。 4. 切换到汉宁叠加。 5. 捕获 B。 6. 对比峰宽。',
    'viz.exp4.steps': '<strong>步骤：</strong> 1. 点击开始实验（锯齿 220 Hz + 谐波开）。 2. 观察标注峰。 3. 捕获 A。 4. 切换到方波。 5. 仅剩奇次谐波。 6. 捕获 B → 对比。',
    'viz.exp5.steps': '<strong>步骤：</strong> 1. 点击开始实验（麦克风源）。 2. 轻声说话 → 注意 RMS（~-30 dBFS）。 3. 捕获 A。 4. 大声说话 → 注意 RMS（~-15 dBFS）。 5. 捕获 B。 6. 对比约 15 dB 差异。',

    // 可视化器 — 学习部分主题
    'viz.learn.sound': '声波',
    'viz.learn.time': '时域',
    'viz.learn.freq': '频域',
    'viz.learn.fourier': '傅里叶变换',
    'viz.learn.sampling': '采样与奈奎斯特',
    'viz.learn.windows': '窗函数',
    'viz.learn.harmonics': '谐波',
    'viz.learn.pitch': '音高检测',
    'viz.learn.beat': '节拍检测',
    'viz.learn.rms': 'RMS 与 dBFS',

    // 可视化器 — 学习部分内容
    'viz.learn.time.body': '<strong>时域</strong>展示信号随时间的变化。波形可视化显示振幅（垂直）对时间（水平）。每种声音都可以这样表示——但它不能直接告诉你存在哪些频率。',
    'viz.learn.freq.body': '<strong>频域</strong>将信号分解为其构成频率。FFT 频谱显示幅度（垂直）对频率（水平，对数刻度）。每个条代表特定频率带的能量。',
    'viz.learn.freq.body2': '点击上方频谱图中的峰值可检查各个频率。频谱图展示频率内容随时间的变化。',
    'viz.learn.sampling.body': '数字音频以离散时间间隔采样连续声波。<strong>采样率</strong> f<sub>s</sub> 决定了可表示的最高频率：',
    'viz.learn.sampling.body2': '在 44.1 kHz（CD 质量）下，可准确表示高达 22.05 kHz 的频率。超过奈奎斯特极限的频率会导致<em>混叠</em>——它们在频谱中显示为虚假的较低频率。抗混叠滤波器在采样前去除高于 f<sub>s</sub>/2 的频率。',
    'viz.learn.harmonics.body': '锯齿波包含所有谐波，振幅以 1/n 递减。方波仅包含奇次谐波。三角波包含奇次谐波，振幅为 1/n²。谐波的模式决定了音色——这就是小提琴和长笛听起来不同的原因。',
    'viz.learn.windows.rect': '矩形窗',

    // 可视化器 — 学习部分交叉链接
    'viz.learn.gotoWf': '前往波形',
    'viz.learn.gotoSpec': '前往频谱',
    'viz.learn.gotoRead': '前往读数',

    // ── 生成器页面 ──────────────────────────
    'gen.title': '数学音乐生成器',
    'gen.desc': '从数学结构生成音乐模式。斐波那契数列、欧几里得节奏、模运算和谐波级数成为作曲工具——揭示数学与音乐之间的深层联系。',
    'gen.placeholder.title': '工具开发中',
    'gen.placeholder.desc': '交互式生成器将在第三阶段构建。它将包含钢琴卷帘编辑器、实时 Web Audio 合成和 MIDI 导出——全部由可选的数学算法驱动。',
    'gen.placeholder.cta': '试试可视化器 →',
    'gen.math.fib.title': '斐波那契节奏',
    'gen.math.fib.p1': '斐波那契数列（1, 1, 2, 3, 5, 8, 13, 21, ...）可通过取值对模式长度取模来映射到节奏模式：',
    'gen.math.fib.p2': '这创造了自然演化、非重复但有结构的序列。黄金比例 φ = (1+√5)/2 ≈ 1.618 作为极限比率 F(n+1)/F(n) 出现，基于它的模式避免精确重复同时保持连贯性。',
    'gen.math.euclid.title': '欧几里得节奏',
    'gen.math.euclid.p1': '用于 GCD 的欧几里得算法可以将 <em>n</em> 个击打尽可能均匀地分布在 <em>m</em> 个步骤上：',
    'gen.math.euclid.p2': '这产生了传统的世界节奏：',
    'gen.math.harmonic.title': '谐波级数与纯律',
    'gen.math.harmonic.p1': '对于基频 f₀，谐波为 f<sub>n</sub> = n · f₀。早期谐波之间的比率产生纯律的协和音程：',
    'gen.math.harmonic.intervalLabel': '音程比率',
    'gen.math.harmonic.temperamentLabel': '十二平均律',
    'gen.math.harmonic.temperamentDesc': '其中 n 为 MIDI 音符号。A4 = 440 Hz 为参考。',
    'gen.physics.consonance': '<strong>协和与谐波级数。</strong>当振动的弦或空气柱产生一个音符时，它并非以单一频率振动。物理振动模式产生一系列整数倍泛音。耳蜗沿其锥形基底膜物理分离频率，与整数比率对齐的谐波产生规则激励模式，听觉系统将其处理为"协和"。',
    'gen.physics.euclid': '<strong>为什么欧几里得节奏好听。</strong>击打的均匀分布（欧几里得模式）最大化击打之间的最小间隔。这种规律性映射到大脑的节拍跟踪回路，预测下一个事件的时间。当预测被确认时，奖励回路激活——节奏"感觉对了"。',
    'gen.physics.webaudio': '<strong>Web Audio 合成。</strong>OscillatorNode 以指定频率生成波形。通过连接到 GainNode（包络）并调度音符开/关事件，我们可以将数学模式演奏为可听音乐。AudioContext 时钟（采样精确）确保紧凑的时序。',
    'gen.exp1.title': '计划：斐波那契 vs 欧几里得模式比较',
    'gen.exp1.desc': '使用斐波那契映射和欧几里得分布生成 16 步模式。比较节奏感——斐波那契模式不对称演化，而欧几里得模式具有数学上最优的均匀性。',
    'gen.exp1.result': '状态：等待实现',
    'gen.exp2.title': '计划：谐波级数作为旋律',
    'gen.exp2.desc': '将低基频（如 110 Hz）的前 8 个谐波映射为旋律。聆听自然递减的音程大小（八度、五度、四度、大三度...）如何创造一个西方音乐最终用十二平均律近似的音阶。',
    'gen.exp2.result': '状态：等待实现',
    'gen.exp3.title': '计划：基于概率的作曲',
    'gen.exp3.desc': '为每个步骤分配概率（如强拍 0.8，弱拍 0.3）。从同一分布生成多个模式，聆听它们如何在保持一致"特征"的同时产生变化。',
    'gen.exp3.result': '状态：等待实现',

    // ── 无障碍页面 ──────────────────────────
    'acc.title': '无障碍声音体验',
    'acc.desc': '将音频信息转化为视觉图案，服务于听障用户。不同声音类别产生独特的、可定制的视觉反馈。',
    'acc.disclaimer': '<strong>重要提示：</strong>本模块是对声音-视觉转化的实验性探索。它<strong>不是</strong>听觉的替代品，<strong>不</strong>提供可靠的安全关键警报，不应在错过声音可能导致伤害的情况下依赖。它是一个教育和体验工具，而非认证辅助设备。',
    'acc.placeholder.title': '工具开发中',
    'acc.placeholder.desc': '交互式无障碍工具将在第四阶段构建。它将把输入音频分类为不同类别（语音、音乐、噪声、节拍、静音）并实时为每个类别渲染独特的视觉模式。',
    'acc.placeholder.cta': '试试可视化器 →',
    'acc.math.classification.title': '声音分类特征',
    'acc.math.classification.p1': '将声音分类需要从音频信号中提取数值特征：',
    'acc.math.classification.scLabel': '谱重心（明亮度）',
    'acc.math.classification.zcrLabel': '过零率（噪声度）',
    'acc.math.classification.sfLabel': '谱通量（起始检测）',
    'acc.math.classification.p2': '这些特征形成一个向量，可使用距离度量或机器学习分类器与类别原型进行比较。',
    'acc.math.mapping.title': '模式映射',
    'acc.math.mapping.p1': '每个声音类别映射到独特的视觉模式：',
    'acc.math.mapping.p2': '映射函数将特征向量转化为视觉参数：',
    'acc.math.mapping.p3': '其中 F 为特征向量，M 为映射矩阵，B 为用户自定义偏置。',
    'acc.physics.cross': '<strong>跨模态感知。</strong>人脑在专门化的皮层区域处理感官信息，但存在跨模态连接。视觉皮层可以学会解释与听觉事件对应的模式——这是视觉警报、隐藏式字幕和视觉音乐背后的原理。',
    'acc.physics.vocal': '<strong>声道声学。</strong>语音由共振峰频率区分——由声道形状决定的共振峰。元音具有稳定的共振峰模式；辅音产生瞬态爆发或噪声。这些声学差异在频谱图中可见，这意味着它们也可以在不需要听者听到的情况下转化为视觉模式。',
    'acc.physics.why': '<strong>为什么视觉转化有效。</strong>声音本质上是一个时变信号。视觉擅长检测空间模式和时间变化。通过将频率映射到空间位置、振幅映射到亮度/颜色，我们创建了保留声音信息承载维度的视觉表示。这不复制听觉，但可以传达声学事件的存在、类别和时间结构。',
    'acc.exp1.title': '计划：语音 vs 音乐分类',
    'acc.exp1.desc': '正常说话，然后播放音乐。系统应通过谱平坦度（语音具有可变频谱熵，音乐具有谐波结构）和过零率模式（语音快速变化，音乐更一致）来区分它们。',
    'acc.exp1.result': '状态：等待实现',
    'acc.exp2.title': '计划：突发声音检测',
    'acc.exp2.desc': '使用谱通量测试突发声音（关门、拍手）的检测。这些事件产生频率内容的快速变化，应触发即时、高对比度的视觉通知。',
    'acc.exp2.result': '状态：等待实现',
    'acc.exp3.title': '计划：可定制模式灵敏度',
    'acc.exp3.desc': '用户调整检测阈值和视觉反馈样式（颜色、强度、模式类型）以匹配其视觉灵敏度和偏好。这测试个性化是否提高视觉声音反馈的可用性。',
    'acc.exp3.result': '状态：等待实现',
    'acc.exp4.title': '计划：局限性研究',
    'acc.exp4.desc': '记录系统能检测和不能检测的内容。安静的声音、远处的声音以及具有相似频谱特征的声音可能被遗漏或错误分类。这种诚实评估对于设定适当的用户期望至关重要。',
    'acc.exp4.result': '状态：等待实现',

    // ── 探索面板标签 ──────────────────────────
    'explore.math': '数学',
    'explore.physics': '物理',
    'explore.experiment': '实验',
    'explore.current': '当前值',
  },
};

class I18n {
  constructor() {
    this.lang = localStorage.getItem('mpc-lang') || 'en';
  }

  t(key) {
    return (translations[this.lang] && translations[this.lang][key]) || (translations.en[key]) || key;
  }

  getLang() {
    return this.lang;
  }

  setLang(lang) {
    this.lang = lang;
    localStorage.setItem('mpc-lang', lang);
    this.applyTranslations();
    document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';
    // Dispatch event so dynamic components (explore panel) can re-render
    window.dispatchEvent(new CustomEvent('langchange', { detail: { lang } }));
  }

  toggle() {
    this.setLang(this.lang === 'en' ? 'zh' : 'en');
  }

  applyTranslations() {
    // Translate all elements with [data-i18n] — set textContent
    // For <option> elements, use innerText to preserve the value attribute
    document.querySelectorAll('[data-i18n]').forEach((el) => {
      const key = el.getAttribute('data-i18n');
      const val = this.t(key);
      if (el.tagName === 'OPTION') {
        el.innerText = val;
      } else {
        el.textContent = val;
      }
    });

    // Translate all elements with [data-i18n-html] — set innerHTML
    document.querySelectorAll('[data-i18n-html]').forEach((el) => {
      const key = el.getAttribute('data-i18n-html');
      const val = this.t(key);
      el.innerHTML = val;
    });

    // Translate [data-i18n-attr] — set attributes like placeholder, title
    document.querySelectorAll('[data-i18n-attr]').forEach((el) => {
      const pairs = el.getAttribute('data-i18n-attr').split(';');
      for (const pair of pairs) {
        const [attr, key] = pair.split('|').map(s => s.trim());
        if (attr && key) {
          el.setAttribute(attr, this.t(key));
        }
      }
    });

    // Update active language button state
    document.querySelectorAll('.lang-btn').forEach((btn) => {
      btn.textContent = this.t('nav.lang');
    });
  }

  init() {
    document.documentElement.lang = this.lang === 'zh' ? 'zh-CN' : 'en';
    this.applyTranslations();
  }
}

export const i18n = new I18n();
