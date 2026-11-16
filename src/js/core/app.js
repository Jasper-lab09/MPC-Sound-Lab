/**
 * App initialization — runs on every page
 * Sets up i18n, language toggle, and scroll-triggered animations.
 */
import { i18n } from './i18n.js';

export class App {
  init() {
    // Initialize i18n — apply translations immediately
    i18n.init();

    // Set up language toggle buttons (present in topbar on every page)
    const langBtns = document.querySelectorAll('.lang-btn');
    langBtns.forEach((btn) => {
      // Remove any existing listener to prevent double-binding
      btn.replaceWith(btn.cloneNode(true));
    });
    document.querySelectorAll('.lang-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        i18n.toggle();
      });
    });

    // Re-apply static translations when language changes (for elements
    // that might have been overwritten by dynamic JS like VisualizerController)
    window.addEventListener('langchange', () => {
      i18n.applyTranslations();
    });

    // Set up scroll-triggered reveal animations
    this._setupScrollReveal();

    // Set up collapsible theory sections
    this._setupCollapsibleSections();

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

  _setupCollapsibleSections() {
    // Find all sections marked with data-collapsible
    document.querySelectorAll('.section[data-collapsible]').forEach((section) => {
      // Wrap all content after the section-label in a wrapper div
      const label = section.querySelector('.section-label');
      if (!label) return;

      // Get all siblings of section-label that come after it
      const contentElements = [];
      let sibling = label.nextElementSibling;
      while (sibling) {
        contentElements.push(sibling);
        sibling = sibling.nextElementSibling;
      }

      // Only wrap if there are content elements and not already wrapped
      if (contentElements.length > 0 && !section.querySelector('.section-content-wrapper')) {
        const wrapper = document.createElement('div');
        wrapper.className = 'section-content-wrapper';
        label.parentNode.insertBefore(wrapper, label.nextSibling);
        contentElements.forEach((el) => wrapper.appendChild(el));
      }

      // Add collapse icon to the section label
      if (!label.querySelector('.collapse-icon')) {
        const icon = document.createElement('span');
        icon.className = 'collapse-icon';
        icon.textContent = '\u25B6'; // right triangle
        label.appendChild(icon);
      }

      // Toggle on label click
      label.addEventListener('click', (e) => {
        // Don't toggle if clicking on the section number or divider (cosmetic)
        section.classList.toggle('collapsed');
      });
    });
  }
}
