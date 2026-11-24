/**
 * App initialization — runs on every page
 * Sets up navigation, i18n, language toggle, and scroll-triggered animations.
 */
import { i18n } from './i18n.js';
import { Nav } from './nav.js';

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

    // Re-apply static translations when language changes
    window.addEventListener('langchange', () => {
      i18n.applyTranslations();
    });

    // Initialize navigation system
    const nav = new Nav();
    nav.init();

    // Set up scroll-triggered reveal animations
    this._setupScrollReveal();

    // Set up collapsible theory sections
    this._setupCollapsibleSections();

    // Mark body as loaded
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

    // Observe sections, panels, cards, and editorial elements
    document.querySelectorAll('.section, .panel, .reveal, .editorial-header, .home-section').forEach((el) => {
      el.classList.add('reveal');
      observer.observe(el);
    });
  }

  _setupCollapsibleSections() {
    // Find all sections marked with data-collapsible
    document.querySelectorAll('.section[data-collapsible]').forEach((section) => {
      // Wrap all content after the section-header in a wrapper div
      const header = section.querySelector('.section-header, .section-label');
      if (!header) return;

      // Get all siblings that come after the header
      const contentElements = [];
      let sibling = header.nextElementSibling;
      while (sibling) {
        contentElements.push(sibling);
        sibling = sibling.nextElementSibling;
      }

      // Only wrap if there are content elements and not already wrapped
      if (contentElements.length > 0 && !section.querySelector('.section-content-wrapper')) {
        const wrapper = document.createElement('div');
        wrapper.className = 'section-content-wrapper';
        header.parentNode.insertBefore(wrapper, header.nextSibling);
        contentElements.forEach((el) => wrapper.appendChild(el));
      }

      // Add collapse icon to the section header
      if (!header.querySelector('.collapse-icon')) {
        const icon = document.createElement('span');
        icon.className = 'collapse-icon';
        icon.textContent = '\u25B6';
        header.appendChild(icon);
      }

      // Toggle on header click
      header.addEventListener('click', () => {
        section.classList.toggle('collapsed');
      });
    });
  }
}
