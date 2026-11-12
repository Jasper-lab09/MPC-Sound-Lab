/**
 * Simple navigation controller
 * Sets active state on topbar links based on current page
 */
export class Router {
  constructor() {
    this.currentPage = this._detectPage();
    this._updateActiveLink();
  }

  _detectPage() {
    const path = window.location.pathname;
    const filename = path.substring(path.lastIndexOf('/') + 1) || 'index.html';
    return filename.replace('.html', '');
  }

  _updateActiveLink() {
    const links = document.querySelectorAll('.topbar-link');
    links.forEach((link) => {
      const href = link.getAttribute('href') || '';
      const linkPage = href.replace('.html', '');
      if (linkPage === this.currentPage) {
        link.classList.add('active');
      }
    });
  }
}
