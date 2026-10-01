/**
 * App entry point: registers the service worker, boots the components
 * and announces posture/layout changes to assistive technology.
 */
import './components/posture-readout.js';
import './components/segments-readout.js';
import './components/segment-map.js';
import './components/support-status.js';
import { onFoldableChange, LAYOUT_LABELS } from './foldable.js';
import { supportsServiceWorker } from './features.js';

if (supportsServiceWorker()) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch((error) => {
      console.warn('Service worker registration failed:', error);
    });
  });
}

// Announce only meaningful changes (posture or layout), not every resize.
const announcer = document.getElementById('announcer');
let lastSummary = null;

onFoldableChange(({ posture, layout, segments }) => {
  const summary = `Posture ${posture ?? 'unsupported'}. ${LAYOUT_LABELS[layout]}, ${segments.length} segment${segments.length === 1 ? '' : 's'}.`;
  if (lastSummary !== null && summary !== lastSummary && announcer) {
    announcer.textContent = summary;
  }
  lastSummary = summary;
});
