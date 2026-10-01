import { onFoldableChange, LAYOUT_LABELS } from '../foldable.js';

const pct = (value, total) => `${(value / total) * 100}%`;

/**
 * <segment-map>: a scaled drawing of the viewport. Segments are drawn as
 * panels; whatever is not covered by a segment (the fold or hinge) shows
 * the striped background.
 */
class SegmentMap extends HTMLElement {
  connectedCallback() {
    this.unsubscribe = onFoldableChange((state) => this.render(state));
  }

  disconnectedCallback() {
    this.unsubscribe?.();
  }

  render({ segments, layout, foldSize, viewportWidth: w, viewportHeight: h }) {
    const portrait = h > w;
    const label =
      `${LAYOUT_LABELS[layout]}: ${segments.length} segment${segments.length === 1 ? '' : 's'}` +
      (segments.length > 1 ? `, ${foldSize}px between them` : '') +
      ` in a ${w} by ${h} viewport.`;

    const panels = segments
      .map((s, i) => `
        <div class="segment-map__segment" style="left:${pct(s.x, w)};top:${pct(s.y, h)};width:${pct(s.width, w)};height:${pct(s.height, h)}">
          ${i + 1}<br>${s.width}×${s.height}
        </div>`)
      .join('');

    this.innerHTML = `
      <div class="segment-map__frame" role="img" aria-label="${label}"
           style="--map-ratio:${w} / ${h}" ${portrait ? 'data-portrait' : ''}>
        <div aria-hidden="true">${panels}</div>
      </div>
      <p class="segment-map__legend" aria-hidden="true">
        <span><span class="segment-map__swatch segment-map__swatch--segment"></span>Segment</span>
        <span><span class="segment-map__swatch segment-map__swatch--fold"></span>Fold / hinge</span>
      </p>
    `;
  }
}

customElements.define('segment-map', SegmentMap);
