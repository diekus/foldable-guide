/**
 * Feature detection helpers. Always check before using an API:
 * none of these are available in every browser.
 */

/** Device Posture API: navigator.devicePosture.type + 'change' event. */
export function supportsDevicePosture() {
  return 'devicePosture' in navigator && navigator.devicePosture != null;
}

/** Viewport Segments API (JS side): window.viewport.segments. */
export function supportsViewportSegments() {
  return 'viewport' in window && window.viewport != null && 'segments' in window.viewport;
}

/**
 * Whether the browser understands a CSS media feature. Unknown media
 * features make the whole query invalid, which matchMedia reports as "not all".
 */
export function supportsMediaFeature(query) {
  return window.matchMedia(query).media !== 'not all';
}

/** Window Controls Overlay (installed desktop PWAs). */
export function supportsWindowControlsOverlay() {
  return 'windowControlsOverlay' in navigator;
}

export function supportsServiceWorker() {
  return 'serviceWorker' in navigator;
}

/** List used by <support-status>. */
export function getSupportReport() {
  return [
    { name: 'Device Posture API (JS)', detail: 'navigator.devicePosture', supported: supportsDevicePosture() },
    { name: 'Device Posture (CSS)', detail: '@media (device-posture)', supported: supportsMediaFeature('(device-posture: continuous)') },
    { name: 'Viewport Segments API (JS)', detail: 'window.viewport.segments', supported: supportsViewportSegments() },
    { name: 'Viewport Segments (CSS)', detail: '@media (horizontal-viewport-segments)', supported: supportsMediaFeature('(horizontal-viewport-segments: 1)') },
    { name: 'Window Controls Overlay', detail: 'navigator.windowControlsOverlay', supported: supportsWindowControlsOverlay() },
    { name: 'Service Worker', detail: 'navigator.serviceWorker', supported: supportsServiceWorker() },
  ];
}
