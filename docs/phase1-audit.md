# MPC Sound Lab — Phase 1 Audit & Design Architecture

Date: 2026-11-24
Scope: Codebase inventory, visual audit, design-architecture proposal for the next creative overhaul described in the 2026-11-24 spec.

---

## 1. Existing Project Structure

### HTML pages (8)
| Page | Purpose | Status | Notes |
|------|---------|--------|-------|
| `index.html` | Editorial homepage | ✅ v2.0 complete | Has hero sculpture, 5 sections |
| `visualizer.html` | Sound Visualizer | ✅ Working | ~1,081 lines of JS, fully functional |
| `generator.html` | Mathematical Music Generator | ⚠️ Phase 3, placeholder UI | Honest status badge |
| `accessibility.html` | Accessible Sound Experience | ⚠️ Phase 4, placeholder UI | Honest status badge |
| `experiments.html` | Experiment archive | ✅ Content page | 8 experiments |
| `field-notes.html` | Knowledge library | ✅ Content page | 6 categories |
| `research.html` | Research directions | ✅ Content page | 3 directions, methodology, questions |
| `about.html` | Studio / technology / archive | ✅ Content page | v1 / v1.5 / v2.0 history |

### CSS (7 files)
| File | Size | Role |
|------|------|------|
| `design-system.css` | 20 KB | Core tokens + shared components |
| `nav.css` | 9 KB | Nav, dropdown, mobile, footer |
| `home.css` | 9 KB | Homepage-specific styles |
| `visualizer.css` | 11 KB | Visualizer UI |
| `generator.css` | <1 KB | Phase-3 module overrides |
| `accessibility.css` | <1 KB | Phase-4 module overrides |
| `main.css` (legacy) | 29 KB | **No longer referenced** |

### JavaScript modules
| Module | Size | Role |
|--------|------|------|
| `core/i18n.js` | 885 lines | zh/en dictionary (345 keys each) |
| `core/app.js` | 101 lines | i18n init, scroll reveal, collapsible sections |
| `core/nav.js` | 144 lines | Dropdown, mobile menu, active state |
| `core/audio-context.js` | 158 lines | Shared AudioManager |
| `visual/sound-sculpture.js` | 302 lines | Generative homepage canvas |
| `visualizer/visualizer.js` | 1,081 lines | Main visualizer controller |
| `visualizer/dsp-utils.js` | 280 lines | Custom radix-2 FFT + windows |
| `visualizer/*` | rest | Signal generator, analyzers, panels |

---

## 2. Functional Inventory (What Must Be Preserved)

### Visualizer (intact)
- Custom FFT engine, window function overlay
- Real-time waveform, spectrum, spectrogram
- Signal generator (sine/square/sawtooth/triangle/noise)
- Pitch detection, beat detection, harmonic analyzer
- Experiment comparison (A/B snapshots)
- Explore panel with math/physics/experiment sections
- `langchange` re-apply of dynamic text

### i18n (intact)
- 345 EN / 345 ZH keys, perfect parity
- `data-i18n`, `data-i18n-html`, `data-i18n-attr` patterns
- Language persistence in `localStorage`
- All 321 HTML-used keys resolve

### Navigation
- Global nav on every page, dropdown for Lab, mobile menu
- Active state matching by pathname
- `prefers-reduced-motion` support disables canvas/animation

### Technical constraints
- GitHub Pages static hosting only
- No build step, no framework, no package manager
- Relative paths for all internal links
- Google Fonts imported via `main.css` only; **current v2 pages do not load the font import**, so they fall back to system fonts (confirmed by absence of `@import` in `design-system.css`).

---

## 3. Visual Audit Findings

From the 1440×900 homepage screenshot (see `/tmp/shots/home-current.png`):

### Strengths
- Distinctive dark editorial mood; not a generic SaaS layout
- Large hero headline with custom sound-sculpture canvas
- Thin separators, monospace annotations, restrained accents (cyan/violet)
- Asymmetric concept grid (label + body)
- Honest status badges (Live / Phase 3 / Phase 4)

### Issues vs. the 2026-11-24 spec
| # | Issue | Severity | Location |
|---|-------|----------|----------|
| 1 | **Entirely dark.** Spec says "Avoid making every section dark" and asks for warm off-white / paper-white background with dark sections only here and there. | High | Whole page |
| 2 | **No serif headline.** Spec calls for "editorial serif typography for major statements." Current hero uses Inter only. | High | Hero |
| 3 | **Section B (Research Statement) is missing.** There is no "Can we understand, generate and reinterpret sound through mathematics?" research statement with the four directions. | High | Home |
| 4 | **Repetitive card grids exist.** Directions grid (3 cards), experiment grid (8 cards), field-notes grid (6 cards), roadmap bar. Spec explicitly warns against "the same three-card layout repeatedly." | Medium | Home |
| 5 | **Font import not wired.** Google Fonts only live in unused `main.css`; v2 pages fall back to system fonts, missing Lora entirely. | Medium | All pages |
| 6 | **No GitHub repository link in footer.** Spec requests one. | Low | Footer |
| 7 | **No "LAB 001 / SOUND RESEARCH / EST. 2026" annotations.** Current hero eyebrow is "Independent Digital Research Studio" only. | Low | Hero |
| 8 | **Color palette mismatch.** Current palette is near-black + cyan/violet. Spec wants warm off-white paper background, near-black text, cobalt/acid-yellow accents, deep charcoal dark sections. | High | Global |

### What works well and should be kept
- The sound sculpture canvas (mathematically generated waves, not decorative particles)
- The § section numbering
- Status badges and honest development labels
- The asymmetric concept grid idea
- Existing bilingual i18n coverage

---

## 4. Proposed Design Architecture

### 4.1 Palette (revised)
```
--paper:      #F4F1EA   warm off-white, primary background
--paper-dark: #EBE7DE   alternate section background
--charcoal:   #1A1A1A   dark sections
--ink:        #111111   near-black text
--ink-dim:    #5C5C5C   secondary text
--cobalt:     #1E4DFF   primary accent (restrained)
--acid:       #E5F92C   secondary accent, used sparingly
--line:       #DCD7CC   thin dividers on paper
--line-dark:  #333333   thin dividers on charcoal
```

### 4.2 Typography (revised)
- Load **Newsreader** or **Lora** as editorial serif for headlines and large statements.
- Keep **Inter** for UI, nav, labels, body.
- Keep **JetBrains Mono** for experiment IDs, data labels, metadata.
- Import fonts in `design-system.css` so all pages actually load them.

### 4.3 Layout strategy (revised)
- **Most of the page is warm off-white** with dark type.
- One or two sections can invert to deep charcoal for contrast.
- Break up repetitive grids:
  - Hero: full-bleed dark charcoal with large serif headline + sound sculpture.
  - Research statement: editorial serif statement + four directions as a structured index (not four identical cards).
  - Enter the Lab: three modules shown as an asymmetric, intentional composition (not equal-width cards).
  - Research Index: horizontal scroll or two-column index with category numbers.
  - Experimental Archive: table-like list with IDs, not a card grid.
- Use oversized typography, large whitespace, thin rules, technical annotations.

### 4.4 Proposed Sitemap (unchanged URLs)
```
HOME
LAB (dropdown)
  Sound Visualizer
  Music Generator
  Accessibility
RESEARCH (dropdown)
  Experiments
  Field Notes
  Research Topics
ABOUT
```
Current nav already supports this; the dropdown trigger currently says "Lab" instead of "Research" for research pages. We can split into two dropdowns or keep the current Lab dropdown and add a Research dropdown.

### 4.5 Component plan
| Component | Where | Notes |
|-----------|-------|-------|
| `WaveHero` canvas | Hero only | Keep sound sculpture, recolor to cobalt/acid on charcoal |
| `ResearchStatement` | Home §B | Large serif pull quote + 4 direction list |
| `LabEntry` | Home §C | Asymmetric 3-item composition |
| `ResearchIndex` | Home §D | Numbered category list |
| `ExperimentList` | Home §E + experiments.html | Table-style rows |
| `FieldNotesTeaser` | Home §F | Small cards or 2-column list |
| `SiteFooter` | All pages | Add GitHub repo link |

---

## 5. Risks & Constraints

1. **Do not break the Visualizer.** Its CSS (`visualizer.css`) and JS (`visualizer.js`) are tightly coupled to the dark theme. A global palette swap must not override visualizer-specific chart colors or controls. Plan: keep visualizer page in a dark mode or scope new palette rules carefully.
2. **Do not lose i18n parity.** Every new string needs both EN and ZH entries. Plan: add keys in pairs, run parity script after each batch.
3. **Do not break GitHub Pages paths.** All internal links are relative `.html` files; keep them that way.
4. **Font import must move to `design-system.css`.** Currently no v2 page loads Lora, so serif headlines are not available.

---

## 6. Recommended Phase Plan

### Phase 1 — Audit & Architecture ✅ (this document)
Produce the audit, palette, typography, sitemap, component plan.

### Phase 2 — Global Design System
- Rewrite `design-system.css` with the new light-first palette.
- Move font import into `design-system.css`.
- Update `nav.css` for light/dark compatibility.
- Update `app.js` if needed for new class names.

### Phase 3 — Homepage Reconstruction
- Rebuild `index.html` sections A–G according to spec.
- Recolor sound sculpture.
- Add new i18n keys.
- Update `home.css`.

### Phase 4 — Consistency Pass on Existing Pages
- Apply new nav/footer/styles to all 8 pages without changing core functionality.
- Keep Visualizer visually stable.

### Phase 5 — Testing
- Desktop / tablet / mobile responsive check.
- Language switching across all pages.
- Link checker, asset checker, JS syntax check.
- GitHub Pages deployment.

---

## 7. Quick Wins Already Possible

1. Add the font import to `design-system.css`.
2. Add a GitHub repo link to the footer on all pages.
3. Fix the hero eyebrow to include technical annotations.

These three changes are low-risk and do not alter layout.
