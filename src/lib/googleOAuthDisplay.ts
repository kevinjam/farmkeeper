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

function getUserAgent(): string {
  return typeof navigator !== 'undefined' ? navigator.userAgent || '' : '';
}

/** iOS installed PWA / home-screen shortcut */
function isIOSStandalonePwa(): boolean {
  if (typeof window === 'undefined') return false;
  const nav = window.navigator as Navigator & { standalone?: boolean };
  return nav.standalone === true;
}

/** Android/iOS display-mode standalone or minimal-ui */
function isDisplayModeStandalone(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia?.('(display-mode: standalone)').matches === true ||
    window.matchMedia?.('(display-mode: minimal-ui)').matches === true
  );
}

/**
 * Embedded WebView / in-app browser heuristics (Google blocks these for OAuth).
 */
function isEmbeddedOrInAppBrowser(ua: string): boolean {
  if (document.referrer?.startsWith('android-app://')) return true;
  if (/;\s*wv\)/i.test(ua)) return true;

  if (/Instagram/i.test(ua)) return true;
  if (/FBAN|FBAV|FB_IAB|FB4A|FBIOS|FBSSO/i.test(ua)) return true;
  if (/Messenger/i.test(ua)) return true;
  if (/Line\//i.test(ua)) return true;
  if (/Snapchat/i.test(ua)) return true;
  if (/musical_ly|BytedanceWebview|Bytedance|trill_|TikTok/i.test(ua)) return true;
  if (/MicroMessenger/i.test(ua)) return true;
  if (/LinkedInApp/i.test(ua)) return true;
  if (/Pinterest/i.test(ua)) return true;
  if (/Twitter/i.test(ua)) return true;
  if (/cordova|Capacitor|Ionic|Crosswalk/i.test(ua)) return true;

  return false;
}

/**
 * iOS WKWebView often has AppleWebKit but not a full Safari token.
 * Real Safari / Chrome / Firefox / Edge on iOS are allowed.
 */
function isIOSWebView(ua: string): boolean {
  if (!/iPhone|iPad|iPod/i.test(ua)) return false;
  if (/CriOS|FxiOS|OPiOS|EdgiOS|DuckDuckGo/i.test(ua)) return false;
  if (/Safari/i.test(ua) && !isEmbeddedOrInAppBrowser(ua)) return false;
  return /AppleWebKit/i.test(ua);
}

/**
 * True when OAuth must not run inside this WebView (open Google in Safari/Chrome instead).
 */
export function isStandaloneOrLikelyRestrictedOAuthContext(): boolean {
  if (typeof window === 'undefined') return false;

  const ua = getUserAgent();

  if (isIOSStandalonePwa()) return true;
  if (isDisplayModeStandalone()) return true;
  if (isEmbeddedOrInAppBrowser(ua)) return true;
  if (isIOSWebView(ua)) return true;

  return false;
}

/**
 * Mobile browsers Google accepts for in-page OAuth redirect.
 */
export function isTrustedMobileBrowser(): boolean {
  if (typeof window === 'undefined') return true;

  const ua = getUserAgent();
  const isMobile = /Android|iPhone|iPad|iPod|Mobile/i.test(ua);
  if (!isMobile) return true;

  if (isStandaloneOrLikelyRestrictedOAuthContext()) return false;

  if (/iPhone|iPad|iPod/i.test(ua)) {
    return /Safari|CriOS|FxiOS|OPiOS|EdgiOS/i.test(ua);
  }

  if (/Android/i.test(ua)) {
    if (/; wv\)/i.test(ua)) return false;
    return /Chrome|Firefox|SamsungBrowser|EdgA/i.test(ua);
  }

  return true;
}

/** Open Google OAuth in the system browser when the current shell is not trusted. */
export function shouldOpenGoogleAuthExternally(): boolean {
  return !isTrustedMobileBrowser();
}

/**
 * Best-effort: open `url` in a real browser instead of an embedded WebView.
 * On Android, prefers Chrome via an intent: URL.
 */
export function openUrlPreferringSystemBrowser(url: string): OpenSystemBrowserResult {
  if (typeof window === 'undefined') {
    return { usedAndroidIntent: false, openedAuxiliary: false };
  }

  const ua = getUserAgent();
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
