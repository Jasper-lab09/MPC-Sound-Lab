/**
 * Navigation system for MPC Sound Lab
 * - 8-destination nav with dropdown for Lab section
 * - Mobile responsive hamburger menu
 * - Active state detection based on current page
 * - Smooth transitions
 */

export class Nav {
  constructor() {
    this.mobileOpen = false;
  }

  init() {
    this._bindDropdown();
    this._bindMobile();
    this._setActiveState();
    this._bindAmbientToggle();
  }

  _bindDropdown() {
    const dropdown = document.querySelector('.nav-dropdown');
    if (!dropdown) return;

    const trigger = dropdown.querySelector('.nav-dropdown-trigger');
    const menu = dropdown.querySelector('.nav-dropdown-menu');

    if (!trigger || !menu) return;

    let timeout = null;

    trigger.addEventListener('mouseenter', () => {
      clearTimeout(timeout);
      menu.classList.add('open');
      trigger.classList.add('active');
    });

    trigger.addEventListener('mouseleave', () => {
      timeout = setTimeout(() => {
        menu.classList.remove('open');
        trigger.classList.remove('active');
      }, 200);
    });

    menu.addEventListener('mouseenter', () => {
      clearTimeout(timeout);
    });

    menu.addEventListener('mouseleave', () => {
      timeout = setTimeout(() => {
        menu.classList.remove('open');
        trigger.classList.remove('active');
      }, 200);
    });

    // Click toggle for touch devices
    trigger.addEventListener('click', (e) => {
      e.preventDefault();
      menu.classList.toggle('open');
      trigger.classList.toggle('active');
    });
  }

  _bindMobile() {
    const mobileToggle = document.querySelector('.nav-mobile-toggle');
    const mobileMenu = document.querySelector('.nav-mobile-menu');
    if (!mobileToggle || !mobileMenu) return;

    mobileToggle.addEventListener('click', () => {
      this.mobileOpen = !this.mobileOpen;
      mobileMenu.classList.toggle('open', this.mobileOpen);
      mobileToggle.classList.toggle('open', this.mobileOpen);
      mobileToggle.setAttribute('aria-expanded', this.mobileOpen);
    });

    // Close on link click
    mobileMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        this.mobileOpen = false;
        mobileMenu.classList.remove('open');
        mobileToggle.classList.remove('open');
        mobileToggle.setAttribute('aria-expanded', 'false');
      });
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
      if (this.mobileOpen && !mobileMenu.contains(e.target) && !mobileToggle.contains(e.target)) {
        this.mobileOpen = false;
        mobileMenu.classList.remove('open');
        mobileToggle.classList.remove('open');
        mobileToggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  _setActiveState() {
    const path = window.location.pathname;
    const filename = path.split('/').pop() || 'index.html';

    // Determine which nav item should be active
    const links = document.querySelectorAll('.nav-link, .nav-dropdown-link, .nav-mobile-link');
    links.forEach(link => {
      const href = link.getAttribute('href') || '';
      const linkFile = href.split('/').pop();

      // Exact match
      if (linkFile === filename) {
        link.classList.add('active');
        return;
      }

      // Experiments section
      if (filename.startsWith('experiments') && href.includes('experiments')) {
        link.classList.add('active');
        return;
      }

      // Field notes
      if (filename === 'field-notes.html' && href === 'field-notes.html') {
        link.classList.add('active');
        return;
      }
    });
  }

  _bindAmbientToggle() {
    const ambientBtn = document.getElementById('ambient-toggle');
    if (!ambientBtn) return;

    ambientBtn.addEventListener('click', () => {
      document.body.classList.toggle('ambient-off');
    });
  }
}

/**
 * Shared navigation HTML — injected into each page
 * Pages call Nav.injectNav(activePage) to insert the nav bar
 */
Nav.injectNav = function(activeContext = '') {
  // This is called by each page if the nav is not hardcoded
  // Most pages will hardcode the nav for simplicity
};
