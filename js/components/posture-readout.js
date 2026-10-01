import { onFoldableChange } from '../foldable.js';

const NOTES = {
  continuous: 'The screen is flat: a regular phone, tablet or desktop, or a foldable opened all the way.',
  folded: 'The device is partly folded, like a book or a laptop. Content should avoid the fold.',
  unsupported: 'This browser does not expose the Device Posture API. The layout uses the regular responsive fallback.',
};

/** <posture-readout>: the current device posture, updated live. */
class PostureReadout extends HTMLElement {
  connectedCallback() {
    this.unsubscribe = onFoldableChange((state) => this.render(state));
  }

  disconnectedCallback() {
    this.unsubscribe?.();
  }

  render({ posture }) {
    const key = posture ?? 'unsupported';
    if (key === this.lastKey) return;
    this.lastKey = key;

    this.innerHTML = `
      <p class="readout-value" data-testid="posture-value">${key}</p>
      <p class="readout-note">${NOTES[key] ?? ''}</p>
    `;
  }
}

customElements.define('posture-readout', PostureReadout);
