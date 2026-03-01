// utils/browserCheck.js

/**
 * Detects if the current browser is Xverse.
 * @returns {boolean} True if the browser is Xverse, otherwise false.
 */
export function isXverseBrowser() {
  if (typeof window === 'undefined') return false;

  // 1. URL param approach
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.has('inXverse')) {
    return true;
  }

  // 2. Check global object
  if (window?.bitcoin?.isXverse) {
    return true;
  }

  // 3. User-Agent check
  const ua = window.navigator.userAgent || '';
  if (/Xverse/i.test(ua)) return true;

  // If none match, assume not in Xverse
  return false;
}

/**
 * Detects if the current browser is Unisat.
 * @returns {boolean} True if the browser is Unisat, otherwise false.
 */
export function isUnisatBrowser() {
  if (typeof window === 'undefined') return false;

  // 1. URL param approach
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.has('inUnisat')) {
    return true;
  }

  // 2. Check global object
  if (window?.unisat) {
    return true;
  }

  // 3. User-Agent check
  const ua = window.navigator.userAgent || '';
  if (/Unisat/i.test(ua)) return true;

  // If none match, assume not in Unisat
  return false;
}

/**
 * Detects the active mobile app browser.
 * @returns {string} The name of the active browser (e.g., 'Xverse', 'Unisat'), or 'Unknown' if none match.
 */
export function detectMobileAppBrowser() {
  if (isXverseBrowser()) return 'xverse';
  if (isUnisatBrowser()) return 'unisat';
  return 'Unknown';
}