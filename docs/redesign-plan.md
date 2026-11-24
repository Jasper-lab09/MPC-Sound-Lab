# MPC Sound Lab — Complete Creative Redesign Plan

## 1. Repository Inspection Summary

### Current State
- **4 HTML pages**: index.html (364 lines), visualizer.html (707 lines), generator.html (177 lines), accessibility.html (179 lines)
- **4 CSS files**: main.css (978 lines), visualizer.css (594 lines), generator.css, accessibility.css
- **13 JS files**: core (app.js, i18n.js, animated-bg.js, audio-context.js, router.js), visualizer (visualizer.js, waveform.js, frequency-spectrum.js, spectrogram.js, pitch-detector.js, beat-detector.js, dsp-utils.js, explore-panel.js, experiment-comparison.js, harmonic-analyzer.js, signal-generator.js)
- **Tech**: Vanilla JS ES6 modules, Web Audio API, Canvas 2D, zero dependencies, zero build step
- **Deployment**: GitHub Pages at `https://jasper-lab09.github.io/MPC-Sound-Lab/`
- **i18n**: Full zh/en bilingual system with 280+ translation keys

### Functionality That MUST Be Preserved
1. **Visualizer**: FFT waveform/spectrum/spectrogram, pitch detection (autocorrelation), beat detection (energy flux), harmonic analyzer, signal generator (sine/square/triangle/sawtooth/noise), window function explorer (rectangular/Hann/Hamming overlay), peak inspector (click spectrum peaks), readout cards (5 live analysis cards with expandable math), experiment comparison (A/B capture), learn section (10 topics), all experiment auto-config cards
2. **i18n**: Full bilingual toggle working across all pages
3. **Generator/Accessibility**: Accurate status display (placeholders, no fake functionality)
4. **GitHub Pages compatibility**: Static files only, no server-side processing
5. **Existing URLs**: index.html, visualizer.html, generator.html, accessibility.html must remain accessible

---

## 2. Proposed Sitemap

```
MPC SOUND LAB
├── Home                          index.html         (redesigned)
├── LAB (dropdown)
│   ├── Sound Visualizer          visualizer.html    (redesigned, preserved functionality)
│   ├── Mathematical Music Gen.   generator.html     (redesigned, accurate status)
│   └── Accessible Sound Exp.     accessibility.html (redesigned, accurate status)
├── EXPERIMENTS                   experiments.html   (NEW — archive index)
│   ├── EXP-01 Fourier Decomposition        experiments/fourier.html
│   ├── EXP-02 FFT Resolution               experiments/fft-resolution.html
│   ├── EXP-03 Spectral Leakage             experiments/spectral-leakage.html
│   ├── EXP-04 Harmonic Structures          experiments/harmonics.html
│   ├── EXP-05 Wave Superposition           experiments/superposition.html
│   ├── EXP-06 Euclidean Rhythms            experiments/euclidean.html
│   ├── EXP-07 Mathematical Music           experiments/math-music.html
│   └── EXP-08 Sound-to-Visual Translation  experiments/sound-visual.html
├── FIELD NOTES                   field-notes.html   (NEW — knowledge library)
│   ├── Mathematics              field-notes.html#mathematics
│   ├── Physics                  field-notes.html#physics
│   ├── Acoustics                field-notes.html#acoustics
│   ├── Signal Processing        field-notes.html#signal-processing
│   ├── Music Theory             field-notes.html#music-theory
│   └── Accessibility            field-notes.html#accessibility
├── RESEARCH                      research.html      (NEW)
└── ABOUT / ARCHIVE               about.html         (NEW)
```

**Total new pages**: 12 (experiments index + 8 experiment pages + field-notes + research + about)
**Total redesigned pages**: 4 (home, visualizer, generator, accessibility)
**Total pages**: 16

---

## 3. Page-by-Page Wireframe Descriptions

### Home (index.html) — 7 sections, full-screen editorial

**Section 01 — Hero (100vh)**
- Full viewport height
- Left: Large editorial typography (display sans, 3.5–4rem), project name as wordmark
- Right/center: Signature sound sculpture canvas (interactive, morphing wave structure)
- Bottom: Thin metadata strip (mono type: version, date, "scroll to explore")
- Subtle generative animation in background (wave sculpture morphs with scroll)

**Section 02 — Concept Transformation**
- Horizontal flow: Physical Vibration → Digital Signal → Mathematical Analysis → Musical Expression → Visual Translation
- Each stage: number, icon/mini-diagram, 1-line description
- Scroll-driven: stages highlight as user scrolls past
- Thin connecting line between stages

**Section 03 — Three Research Directions**
- Asymmetrical editorial layout (NOT identical cards)
- Analyze: large left block with visualizer screenshot/graphic preview, description below
- Generate: right-aligned narrow column with waveform pattern graphic
- Translate: full-width bottom band with abstract pattern preview
- Each links to its respective module page

**Section 04 — Experimental Archive Preview**
- Grid of 4 selected experiments with IDs (EXP-01 through EXP-04)
- Each: experiment ID (mono), title, 1-line research question, mini preview graphic (SVG wave pattern)
- Links to experiments.html for full archive

**Section 05 — Field Notes Preview**
- Magazine-style layout: 3 columns of different heights
- Each column: topic category, 2-3 article titles with thin separators
- Links to field-notes.html

**Section 06 — Project Development**
- Three-column status: Completed / In Progress / Planned
- Each item: feature name, status badge
- Honest representation — no fake features

**Section 07 — Footer / Site Index**
- Full editorial site map in footer
- Columns: Navigation, Lab Modules, Experiments, Field Notes, About
- Bottom: copyright, GitHub link, version number

### Sound Visualizer (visualizer.html)
- New editorial header with large title, metadata strip
- Same 7-section content structure (Audio Setup, Waveform, Spectrum, Spectrogram, Readouts, Experiments, Learn)
- All functionality preserved — only visual chrome changes
- New navigation bar, new typography, new section numbering style

### Generator (generator.html)
- New editorial header
- Accurate "Under Development" status with planned feature breakdown
- Mathematical foundation content preserved and restyled
- Honest status indicators

### Accessibility (accessibility.html)
- New editorial header
- Disclaimer preserved and restyled
- Accurate "Under Development" status
- Mathematical/physical foundation content preserved and restyled

### Experiments Archive (experiments.html) — NEW
- Hero: "Experiments" title, count, description
- Grid of 8 experiment cards:
  - Experiment ID (EXP-01)
  - Title
  - Research question (1-2 lines)
  - Status badge (Interactive / Planned)
  - Mini SVG preview graphic
- Links to individual experiment pages

### Individual Experiment Pages — NEW
Each experiment page has:
- Header: EXP-ID, title, status badge, category tag
- Research question (large editorial type)
- Mathematical model (equation block, diagram)
- Experimental setup (description, configuration)
- Interactive demonstration (links to visualizer with pre-config, or inline interactive canvas for some)
- Observations (what to look for — NOT fabricated results)
- Results and limitations (honest assessment)
- Navigation: prev/next experiment, back to archive

### Field Notes (field-notes.html) — NEW
- Hero: "Field Notes" title, description
- 6 category sections with article cards:
  - Each article: title, category tag, reading time, excerpt
  - Editorial typography with mathematical notation
  - Links to relevant interactive tools
- Magazine-style asymmetric layout

### Research (research.html) — NEW
- Methodology section
- Technical architecture diagram (SVG)
- Objectives
- Limitations (honest)
- Future directions

### About / Archive (about.html) — NEW
- Project development timeline
- MPC Studio context
- Version history (from git log)
- Technology stack
- Contributions

---

## 4. Design System

### Typography
- **Display headings**: Inter 800/900, 3.5–4rem hero, 2.2rem section, tight letter-spacing (-0.04em)
- **Editorial body**: Inter 400/500, 0.95rem, line-height 1.8
- **Technical metadata**: JetBrains Mono 500/600, 0.72–0.78rem, letter-spacing 0.06em
- **Mathematical notation**: JetBrains Mono, centered in subtle panels
- **Serif accents**: Lora italic for pull quotes / research questions

### Color Palette
- `--ink-0: #0A0B0F` (near-black base)
- `--ink-1: #111318` (surface)
- `--ink-2: #181B22` (elevated surface)
- `--ink-3: #20242E` (hover surface)
- `--paper: #E8E6E1` (warm off-white text)
- `--paper-dim: #9B9B96` (muted text)
- `--paper-faint: #5C5E5A` (faint text)
- `--slate: #4A5058` (muted slate)
- `--cyan: #00C7E2` (restrained electric cyan — slightly toned down)
- `--violet: #7C6FE6` (occasional violet accent)
- `--line: #1E2128` (thin separators)
- `--line-bright: #2A2E38`

### Layout System
- **Max width**: 1280px content, 1440px for full-bleed sections
- **Grid**: 12-column with 24px gutter, asymmetric usage
- **Section numbering**: `§01`, `§02` in mono type
- **Separators**: 1px lines, `--line` color
- **Variable section heights**: hero 100vh, concept 60vh, directions 80vh, etc.
- **Editorial spacing**: 80px between major sections, 32px between elements

### Background Treatments (varies by page type)
- **Home**: Sound sculpture canvas + subtle ambient gradients
- **Lab modules (visualizer)**: Near-black, minimal ambient — charts dominate
- **Content pages (experiments, field notes, research, about)**: Warm off-white tint on near-black, subtle paper texture feel
- **No uniform dark background** — each page type gets distinct treatment

---

## 5. Reusable Components

### CSS Components (src/css/components.css — NEW)
- `.editorial-header` — large title + metadata strip
- `.experiment-card` — ID, title, question, status, preview
- `.article-card` — title, category, excerpt, reading time
- `.status-badge` — live/planned/dev status indicator
- `.section-number` — editorial §01 numbering
- `.thin-separator` — 1px line with gradient fade
- `.metadata-strip` — mono type info bar
- `.editorial-grid` — asymmetric 12-col grid
- `.math-block` — equation display with label
- `.concept-flow` — horizontal transformation flow

### JS Components
- `sound-sculpture.js` — NEW: Canvas-based interactive wave sculpture (signature visual identity)
  - Morphs between sine/square/triangle/sawtooth
  - Responds to scroll position (waveform changes)
  - Mouse interaction (distort wave near cursor)
  - Lightweight (requestAnimationFrame, DPR cap)
  - Respects prefers-reduced-motion
- `nav.js` — NEW: Navigation system with dropdown, mobile menu
- `app.js` — MODIFIED: Add nav initialization, preserve i18n + scroll reveal + collapsible

### Shared Elements
- Navigation bar (all pages)
- Footer with site index (all pages)
- Ambient background layers (grain, vignette — all pages)
- i18n system (all pages, extended with new keys)

---

## 6. Implementation Stages

### Stage A — Design System and Global Navigation
Files to create/modify:
- `src/css/design-system.css` — NEW: Tokens, typography, layout, components
- `src/css/components.css` — NEW: Reusable component styles
- `src/js/core/nav.js` — NEW: Dropdown nav + mobile menu
- `src/js/core/app.js` — MODIFY: Add nav init
- `src/js/core/i18n.js` — MODIFY: Add new nav/page translation keys
- All HTML pages: Replace navigation bar markup

Verification: All existing pages still load, i18n toggle works, navigation links correct.

### Stage B — Homepage Redesign
Files to create/modify:
- `index.html` — REWRITE: 7-section editorial layout
- `src/js/visual/sound-sculpture.js` — NEW: Signature canvas component
- `src/css/home.css` — NEW: Homepage-specific styles
- `src/js/core/i18n.js` — MODIFY: Add homepage translation keys

Verification: Homepage renders all 7 sections, sound sculpture animates, all links work.

### Stage C — Experiments and Field Notes
Files to create:
- `experiments.html` — Archive index
- `experiments/*.html` — 8 individual experiment pages
- `field-notes.html` — Knowledge library
- `src/css/editorial.css` — Shared editorial page styles
- `src/js/core/i18n.js` — MODIFY: Add experiment/field-notes keys

Verification: All experiment pages load, navigation works, links to visualizer correct.

### Stage D — Research and About
Files to create:
- `research.html`
- `about.html`
- Add to i18n.js

Verification: Pages load, content is accurate and honest.

### Stage E — Existing Module Redesign
Files to modify:
- `visualizer.html` — New header, nav, typography — preserve ALL functionality
- `generator.html` — New header, nav, typography
- `accessibility.html` — New header, nav, typography
- `src/css/visualizer.css` — Update to new design tokens
- `src/css/generator.css` — Update
- `src/css/accessibility.css` — Update

Verification: Visualizer FFT/waveform/spectrum/spectrogram/pitch/beat/harmonics/experiments ALL work. Generator and Accessibility show correct status.

### Stage F — Responsive Testing and Deployment
- Test all 16 pages on mobile (375px) and desktop (1440px)
- Verify navigation works on all pages
- Verify visualizer functionality intact
- Verify i18n works on all new pages
- Verify GitHub Pages deployment
- Commit and push to origin/main

---

## 7. Key Design Decisions

1. **No frameworks**: Stay vanilla JS/CSS — preserve GitHub Pages compatibility, zero build step
2. **Sound sculpture as identity**: The signature interactive canvas IS the visual identity — not a decorative element
3. **Asymmetric layouts**: Each page has a distinct composition — no repeated card grids
4. **Honest status**: Generator and Accessibility clearly show "Under Development" — no fake functionality
5. **No fabricated results**: Experiment pages describe what to observe, not fake data
6. **Warm off-white on near-black**: Creates "editorial paper" feel distinct from typical dark SaaS
7. **Thin separators over borders**: Editorial design uses hairlines, not heavy borders
8. **Mono type for metadata**: Technical credibility through consistent metadata strips
9. **Variable section heights**: Break the uniform rhythm — some sections 100vh, others 40vh
10. **Different backgrounds per page type**: Home gets sculpture, lab gets minimal, content gets paper-feel
