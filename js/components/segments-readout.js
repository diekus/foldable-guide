import { onFoldableChange, LAYOUT_LABELS } from '../foldable.js';
import { supportsViewportSegments } from '../features.js';

const px = (n) => `${n}px`;

/** <segments-readout>: number, size and position of each viewport segment. */
class SegmentsReadout extends HTMLElement {
  connectedCallback() {
    this.unsubscribe = onFoldableChange((state) => this.render(state));
  }

  disconnectedCallback() {
    this.unsubscribe?.();
  }

  render(state) {
    const { segments, layout, foldOrientation, foldSize, viewportWidth, viewportHeight } = state;
    const foldLabel = foldOrientation
      ? `${foldOrientation} (${foldSize > 0 ? `${px(foldSize)} hinge` : 'seamless'})`
      : 'none';

    const rows = segments
      .map((s, i) => `
        <tr>
          <td>${i + 1}</td>
          <td>${px(s.x)}</td>
          <td>${px(s.y)}</td>
          <td>${px(s.width)}</td>
          <td>${px(s.height)}</td>
        </tr>`)
      .join('');

    this.innerHTML = `
      <dl class="facts">
        <dt>Segments</dt><dd data-testid="segment-count">${segments.length}</dd>
        <dt>Layout</dt><dd data-testid="segment-layout">${LAYOUT_LABELS[layout]}</dd>
        <dt>Fold</dt><dd data-testid="fold">${foldLabel}</dd>
        <dt>Viewport</dt><dd>${viewportWidth} × ${viewportHeight}</dd>
      </dl>
      <div class="table-wrap" tabindex="0" role="region" aria-label="Segment geometry">
        <table class="segments-table">
          <caption>Segment geometry (CSS px)</caption>
          <thead>
            <tr><th scope="col">#</th><th scope="col">x</th><th scope="col">y</th><th scope="col">Width</th><th scope="col">Height</th></tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
      ${supportsViewportSegments() ? '' : '<p class="readout-note">The Viewport Segments API is not supported, so the whole viewport is shown as one segment.</p>'}
    `;
  }
}

customElements.define('segments-readout', SegmentsReadout);
