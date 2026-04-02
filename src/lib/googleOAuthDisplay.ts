/**
 * Google blocks OAuth (403 disallowed_useragent) in many embedded / standalone
 * WebView contexts — e.g. iOS/Android PWAs installed with display: standalone.
 */
export function isStandaloneOrLikelyRestrictedOAuthContext(): boolean {
  if (typeof window === 'undefined') return false;

  const nav = window.navigator as Navigator & { standalone?: boolean };
  if (nav.standalone === true) return true;

  if (window.matchMedia?.('(display-mode: standalone)').matches) return true;
  if (window.matchMedia?.('(display-mode: minimal-ui)').matches) return true;

  // Android TWA / WebAPK referrer hints (best-effort)
  if (document.referrer?.startsWith('android-app://')) return true;

  return false;
}
