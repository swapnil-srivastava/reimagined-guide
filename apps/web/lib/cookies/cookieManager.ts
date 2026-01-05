import Cookies from 'js-cookie';
import { getCookieConsentValue } from 'react-cookie-consent';

// Cookie types
export enum CookieCategory {
  NECESSARY = 'necessary',
  PREFERENCES = 'preferences',
  ANALYTICS = 'analytics',
  AI_PERSONALIZATION = 'ai_personalization'
}

// Cookie expiration periods in days
export const EXPIRATION = {
  SESSION: null, // Session cookie
  SHORT: 1,      // 1 day
  MEDIUM: 30,    // 30 days
  LONG: 365      // 1 year
};

// Set a cookie if consent is given for its category
export const setCookieWithConsent = (
  name: string,
  value: string,
  category: CookieCategory,
  expireDays: number | null = EXPIRATION.MEDIUM
): boolean => {
  // Necessary cookies are always set
  if (category === CookieCategory.NECESSARY) {
    if (expireDays) {
      Cookies.set(name, value, { expires: expireDays, sameSite: 'strict' });
    } else {
      Cookies.set(name, value, { sameSite: 'strict' });
    }
    return true;
  }
  
  // For non-necessary cookies, check consent
  const hasConsent = getCookieConsentValue('cookie_consent') === 'true';
  if (hasConsent) {
    const options: Cookies.CookieAttributes = { sameSite: 'strict' };
    if (expireDays) {
      options.expires = expireDays;
    }
    Cookies.set(name, value, options);
    return true;
  }
  
  return false;
};

// Get a cookie value
export const getCookie = (name: string): string | undefined => {
  return Cookies.get(name);
};

// Remove a cookie
export const removeCookie = (name: string): void => {
  Cookies.remove(name);
};

// Remove all non-necessary cookies
export const removeNonNecessaryCookies = (): void => {
  // Add specific non-necessary cookies to remove here
  // Analytics cookies
  Cookies.remove('_ga');
  Cookies.remove('_gid');
  
  // AI/Personalization cookies
  Cookies.remove('ai_session');
  Cookies.remove('personalization_prefs');
  Cookies.remove('theme_preference');
};
