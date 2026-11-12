/**
 * App initialization — runs on every page
 */
import { Router } from './router.js';

export class App {
  constructor() {
    this.router = new Router();
  }

  init() {
    // Mark body as loaded
    document.body.classList.add('app-ready');
  }
}
