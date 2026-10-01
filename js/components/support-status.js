import { getSupportReport } from '../features.js';

/** <support-status>: which foldable and PWA APIs this browser supports. */
class SupportStatus extends HTMLElement {
  connectedCallback() {
    const items = getSupportReport()
      .map(({ name, detail, supported }) => `
        <li>
          <span>${name}<br><code>${detail}</code></span>
          <span class="badge ${supported ? 'badge--ok' : 'badge--no'}">${supported ? 'Supported' : 'Not supported'}</span>
        </li>`)
      .join('');

    this.innerHTML = `<ul class="support-list" data-testid="support-list">${items}</ul>`;
  }
}

customElements.define('support-status', SupportStatus);
