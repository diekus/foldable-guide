/**
 * Single source of truth for the device's posture and viewport segments.
 *
 *   import { getFoldableState, onFoldableChange } from './foldable.js';
 *   onFoldableChange((state) => console.log(state.layout));
 *
 * Sources of change: posture 'change' events, window resizes (segments
 * change size or count) and the segment media queries. Updates are batched
 * to one per animation frame and dispatched as a 'foldablechange' event.
 */
import { supportsDevicePosture, supportsViewportSegments } from './features.js';

const events = new EventTarget();
let current = null;
let scheduled = false;

/**
 * @typedef {{ x: number, y: number, width: number, height: number }} Segment
 * @typedef {Object} FoldableState
 * @property {'continuous'|'folded'|null} posture  null when unsupported
 * @property {Segment[]} segments                  always at least one
 * @property {'single'|'book'|'tabletop'} layout   book = side by side, tabletop = stacked
 * @property {'vertical'|'horizontal'|null} foldOrientation  direction of the fold line
 * @property {number} foldSize                     px between segments (hinge on Surface Duo, 0 on seamless folds)
 * @property {number} viewportWidth
 * @property {number} viewportHeight
 */

function readSegments() {
  const raw = supportsViewportSegments() ? window.viewport.segments : null;
  // Some implementations report null for a single segment.
  if (!raw || raw.length === 0) {
    return [{ x: 0, y: 0, width: window.innerWidth, height: window.innerHeight }];
  }
  return Array.from(raw, (r) => ({
    x: Math.round(r.x),
    y: Math.round(r.y),
    width: Math.round(r.width),
    height: Math.round(r.height),
  }));
}

/** @returns {FoldableState} */
export function getFoldableState() {
  const posture = supportsDevicePosture() ? navigator.devicePosture.type : null;
  const segments = readSegments();

  let layout = 'single';
  let foldOrientation = null;
  let foldSize = 0;

  if (segments.length >= 2) {
    const [a, b] = segments;
    if (b.x >= a.x + a.width) {
      // Side by side: the fold line is vertical (book style).
      layout = 'book';
      foldOrientation = 'vertical';
      foldSize = b.x - (a.x + a.width);
    } else {
      // Stacked: the fold line is horizontal (flip style / tabletop).
      layout = 'tabletop';
      foldOrientation = 'horizontal';
      foldSize = b.y - (a.y + a.height);
    }
  }

  return {
    posture,
    segments,
    layout,
    foldOrientation,
    foldSize,
    viewportWidth: window.innerWidth,
    viewportHeight: window.innerHeight,
  };
}

function update() {
  scheduled = false;
  current = getFoldableState();
  events.dispatchEvent(new CustomEvent('foldablechange', { detail: current }));
}

function scheduleUpdate() {
  if (scheduled) return;
  scheduled = true;
  requestAnimationFrame(update);
}

let listening = false;

function startListening() {
  if (listening) return;
  listening = true;

  if (supportsDevicePosture()) {
    navigator.devicePosture.addEventListener('change', scheduleUpdate);
  }
  window.addEventListener('resize', scheduleUpdate);

  // Segment count can change without a resize event on some devices.
  for (const query of [
    '(horizontal-viewport-segments: 2)',
    '(vertical-viewport-segments: 2)',
  ]) {
    window.matchMedia(query).addEventListener('change', scheduleUpdate);
  }
}

/**
 * Subscribe to posture/segment changes. The callback runs immediately with
 * the current state, then on every change. Returns an unsubscribe function.
 * @param {(state: FoldableState) => void} callback
 */
export function onFoldableChange(callback) {
  startListening();
  const handler = (event) => callback(event.detail);
  events.addEventListener('foldablechange', handler);
  callback(current ?? (current = getFoldableState()));
  return () => events.removeEventListener('foldablechange', handler);
}

/** Human-readable labels shared by the UI. */
export const LAYOUT_LABELS = {
  single: 'Single screen',
  book: 'Book (side by side)',
  tabletop: 'Tabletop / flip (stacked)',
};
