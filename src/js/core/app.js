/**
 * App initialization — runs on every page
 * Sets up i18n, language toggle, and scroll-triggered animations.
 */
import { i18n } from './i18n.js';

export class App {
  init() {
    // Initialize i18n
    i18n.init();

    // Set up language toggle buttons (present in topbar on every page)
    document.querySelectorAll('.lang-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        i18n.toggle();
      });
    });

    // Set up scroll-triggered reveal animations
    this._setupScrollReveal();

    // Mark body as loaded (for CSS transition staging)
    document.body.classList.add('app-ready');
  }

  _setupScrollReveal() {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            observer.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
    );

    // Observe all sections, panels, and cards
    document.querySelectorAll('.section, .mod-card, .panel, .lab-hero').forEach((el) => {
      el.classList.add('reveal');
      observer.observe(el);
    });
  }
}
