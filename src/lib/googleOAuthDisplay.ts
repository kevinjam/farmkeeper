/**
 * Google returns 403 disallowed_useragent (“Use secure browsers”) for OAuth when the
 * request is made from embedded WebViews, many in-app browsers, and some standalone
 * display modes — not only installed PWAs.
 */

export type OpenSystemBrowserResult = {
  /** Navigated via Android intent: URI (typically hands off to Chrome). */
  usedAndroidIntent: boolean;
  /** window.open appeared to open an auxiliary window. */
  openedAuxiliary: boolean;
};

/**
 * Best-effort: open `url` in a real browser instead of an embedded WebView.
 * On Android, prefers Chrome via an intent: URL; otherwise tries window.open and a synthetic <a target="_blank">.
 */
export function openUrlPreferringSystemBrowser(url: string): OpenSystemBrowserResult {
  if (typeof window === 'undefined') {
    return { usedAndroidIntent: false, openedAuxiliary: false };
  }

  const ua = navigator.userAgent || '';
  const isAndroid = /Android/i.test(ua);

  if (isAndroid) {
    try {
      const withoutScheme = url.replace(/^https?:\/\//i, '');
      const intentUrl = `intent://${withoutScheme}#Intent;scheme=https;package=com.android.chrome;action=android.intent.action.VIEW;S.browser_fallback_url=${encodeURIComponent(url)};end`;
      window.location.assign(intentUrl);
      return { usedAndroidIntent: true, openedAuxiliary: false };
    } catch {
      // fall through
    }
  }

  let popup = window.open(url, '_blank', 'noopener,noreferrer');
  if (popup) {
    try {
      popup.opener = null;
    } catch {
      // ignore
    }
    return { usedAndroidIntent: false, openedAuxiliary: true };
  }

  try {
    const a = document.createElement('a');
    a.href = url;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  } catch {
    // ignore
  }

  popup = window.open(url, '_blank', 'noopener,noreferrer');
  return { usedAndroidIntent: false, openedAuxiliary: !!popup };
}

export function isStandaloneOrLikelyRestrictedOAuthContext(): boolean {
  if (typeof window === 'undefined') return false;

  const ua = navigator.userAgent || '';

  const nav = window.navigator as Navigator & { standalone?: boolean };
  if (nav.standalone === true) return true;

  if (window.matchMedia?.('(display-mode: standalone)').matches) return true;
  if (window.matchMedia?.('(display-mode: minimal-ui)').matches) return true;

  if (document.referrer?.startsWith('android-app://')) return true;

  // Android System WebView (documented “; wv” marker in user agent)
  if (/;\s*wv\)/i.test(ua)) return true;

  // Common in-app / embedded browsers that use disallowed user agents for Google OAuth
  if (/Instagram/i.test(ua)) return true;
  if (/FBAN|FBAV|FB_IAB|FB4A|FBIOS/i.test(ua)) return true;
  if (/Line\//i.test(ua)) return true;
  if (/Snapchat/i.test(ua)) return true;
  if (/musical_ly|BytedanceWebview|Bytedance|trill_|TikTok/i.test(ua)) return true;
  if (/MicroMessenger/i.test(ua)) return true;
  if (/LinkedInApp/i.test(ua)) return true;
  if (/Pinterest/i.test(ua)) return true;
  if (/Twitter/i.test(ua)) return true;

  if (/cordova|Capacitor|Ionic/i.test(ua)) return true;

  return false;
}
