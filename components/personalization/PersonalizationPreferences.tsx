'use client';

import { useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import Link from 'next/link';
import { getCookie, setCookieWithConsent, CookieCategory, EXPIRATION } from '../../lib/cookies/cookieManager';
import { getCookieConsentValue } from 'react-cookie-consent';

interface PersonalizationSettings {
  enableRecommendations: boolean;
  enableHistory: boolean;
}

export default function PersonalizationPreferences() {
  const [settings, setSettings] = useState<PersonalizationSettings>({
    enableRecommendations: false,
    enableHistory: false
  });
  
  const [consentGiven, setConsentGiven] = useState<boolean>(false);
  
  useEffect(() => {
    // Check if consent has been given
    const hasConsent = getCookieConsentValue("cookie_consent") === "true";
    setConsentGiven(hasConsent);
    
    // Only load settings if consent was given
    if (hasConsent) {
      const savedSettings = getCookie('personalization_prefs');
      if (savedSettings) {
        try {
          setSettings(JSON.parse(savedSettings));
        } catch (e) {
          console.error('Failed to parse personalization settings', e);
        }
      }
    }
  }, []);
  
  const updateSettings = (key: keyof PersonalizationSettings, value: boolean) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    
    // Attempt to save settings - this will only work if consent was given
    const wasSet = setCookieWithConsent(
      'personalization_prefs',
      JSON.stringify(newSettings),
      CookieCategory.AI_PERSONALIZATION,
      EXPIRATION.LONG
    );
    
    if (!wasSet && !consentGiven) {
      // Show consent message if the cookie wasn't set due to lack of consent
      alert('To save personalization preferences, please accept cookies in the cookie banner.');
    }
  };
  
  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-xl mx-auto my-8">
      <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">
        <FormattedMessage
          id="personalization_title"
          defaultMessage="Personalization Settings"
        />
      </h2>
      
      <div className="space-y-4">
        <div className="flex items-center">
          <input
            type="checkbox"
            id="enableRecommendations"
            checked={settings.enableRecommendations}
            onChange={(e) => updateSettings('enableRecommendations', e.target.checked)}
            className="mr-2 h-5 w-5"
          />
          <label htmlFor="enableRecommendations" className="text-gray-700 dark:text-gray-200">
            <FormattedMessage
              id="personalization_recommendations"
              defaultMessage="Enable personalized recommendations"
            />
          </label>
        </div>
        
        <div className="flex items-center">
          <input
            type="checkbox"
            id="enableHistory"
            checked={settings.enableHistory}
            onChange={(e) => updateSettings('enableHistory', e.target.checked)}
            className="mr-2 h-5 w-5"
          />
          <label htmlFor="enableHistory" className="text-gray-700 dark:text-gray-200">
            <FormattedMessage
              id="personalization_history"
              defaultMessage="Remember browsing history"
            />
          </label>
        </div>
      </div>
      
      {!consentGiven && (
        <div className="mt-4 p-3 bg-yellow-100 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-200 rounded">
          <FormattedMessage
            id="personalization_consent_required"
            defaultMessage="To enable personalization features, please accept cookies in the cookie banner at the bottom of the page."
          />
        </div>
      )}
      
      <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
        <FormattedMessage
          id="personalization_privacy_note"
          defaultMessage="Your preferences are stored in a cookie on your device. See our {privacyLink} for more information."
          values={{
            privacyLink: (
              <Link 
                href="/privacy-policy" 
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                Privacy Policy
              </Link>
            ),
          }}
        />
      </p>
    </div>
  );
}
