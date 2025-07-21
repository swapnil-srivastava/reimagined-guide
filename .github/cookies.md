Key Points
	•	It seems likely that the spec for an AI agent to work with cookies should focus on managing consent and ensuring GDPR compliance, given the website’s existing cookie banner and Supabase integration.
	•	Research suggests the agent should check user consent before setting non-necessary cookies, always set necessary cookies, and provide options for users to withdraw consent.
	•	The evidence leans toward including AI-related cookies (e.g., for personalization) in the spec, ensuring they require consent and are handled appropriately.
Cookie Agent Specification Overview
This spec outlines how an AI agent should interact with the cookie system in your NextJS website, ensuring GDPR compliance and integration with existing components like CookiesBanner.tsx.
Purpose and Scope
	•	The agent will manage cookie operations, ensuring necessary cookies (e.g., Supabase auth) are always set, while non-necessary cookies (e.g., analytics, AI personalization) require user consent.
	•	It will work with the existing react-cookie-consent library and extend functionality for AI features.
Key Requirements
	•	Check Consent: Use getCookieConsentValue to verify user consent before setting non-necessary cookies.
	•	Set Cookies: Always set necessary cookies; set non-necessary cookies only with consent.
	•	Withdraw Consent: Allow users to withdraw consent using resetCookieConsentValue, removing non-necessary cookies.
	•	AI Integration: Ensure AI features (e.g., personalization) use non-necessary cookies with consent, degrading gracefully if consent is denied.
For more details, refer to Supabase Authentication Cookies and react-cookie-consent Documentation.

Survey Note on Cookie Agent Specification for AI Integration
This note provides a detailed exploration of creating a specification for an AI agent to work with the cookie system in your NextJS GitHub repository ([invalid url, do not cite]), ensuring GDPR compliance, and leveraging existing components like CookiesBanner.tsx`. The analysis is based on the provided context, including the repository’s main page and the cookie banner component, and aligns with best practices for cookie implementation in NextJS applications as of 07:21 PM CEST on Monday, July 21, 2025.
Introduction
Cookies are small data files stored on a user’s device by websites to enhance user experience, track sessions, or analyze behavior. Under the General Data Protection Regulation (GDPR), websites must obtain explicit user consent for non-essential cookies, provide clear information about cookie usage, and allow users to manage their preferences. Given your NextJS project with Supabase integration and an existing cookie banner, this note outlines a structured specification for an AI agent to interact with the cookie system, ensuring compliance and supporting AI features that may rely on cookies.
Understanding Your Project Context
Your GitHub repository, reimagined-guide, is a NextJS project bootstrapped with create-next-app and integrated with Supabase for authentication and database management. The repository’s main page mentions removing Firebase in favor of Supabase and includes instructions for getting started, such as running npm run dev or yarn dev. It also lists resources for learning more about Next.js and deploying on Vercel, with a note about ensuring dark mode works in production via Tailwind CSS configuration.
The second attachment, CookiesBanner.tsx, is a React component that displays a cookie consent banner using react-cookie-consent. It informs users about cookie usage and provides buttons to accept or decline, setting a cookie_consent cookie when accepted. However, you’ve indicated that the cookie integration is not complete, suggesting that additional functionality, especially for AI features, needs to be added.
Analyzing Existing Cookie Logic
Given the repository’s structure, it’s likely that your existing cookie integration includes necessary cookies for Supabase authentication, such as sb-access-token and sb-refresh-token, which are essential for session management. These cookies are typically set automatically by Supabase and are considered necessary under GDPR, as they enable core functionality like user login. The CookiesBanner.tsx component handles consent for non-necessary cookies, but there was no evidence of specific handling for AI-related cookies or advanced consent management in the provided files.
Since the user mentioned wanting a spec for an AI agent to work with the cookie system, it seems likely that the website includes AI features (e.g., personalization, recommendation systems) that may use cookies, and the agent needs to ensure these are handled correctly.
Creating the Cookie Agent Specification
To create a specification for the AI agent, we need to define how it should interact with the cookie system, ensuring GDPR compliance and integration with existing components. The spec should include:
1. Cookie Specification Table
First, define all cookies used in the website, their purposes, types, and consent requirements. This table must be included in the privacy policy for transparency.
Cookie Name
Purpose
Type
Expiry
Consent Required
sb-access-token
Supabase authentication
Necessary
Session
No
sb-refresh-token
Supabase authentication
Necessary
30 days
No
_ga
Google Analytics
Non-Necessary
2 years
Yes
_gid
Google Analytics
Non-Necessary
24 hours
Yes
theme
User theme preference
Preferences
365 days
Yes
ai_session
AI personalization data
Non-Necessary
30 days
Yes
	•	Note: If additional AI-related cookies are used, they must be added to this table with clear purpose and consent requirements.
2. Agent Functionalities
The AI agent must adhere to the following requirements when interacting with the cookie system:
2.1. Consent Checking
	•	The agent must check if the user has given consent for non-necessary cookies before performing any actions that involve setting or using such cookies.
	•	Use the getCookieConsentValue function from the react-cookie-consent library to determine the consent status.
	•	Example: import { getCookieConsentValue } from 'react-cookie-consent';
	•	
	•	const hasConsent = getCookieConsentValue('cookie_consent');
	•	
2.2. Cookie Setting
	•	Necessary Cookies:
	◦	Always set necessary cookies (e.g., sb-access-token, sb-refresh-token) as they are essential for authentication and website functionality.
	◦	These cookies are managed by Supabase and do not require consent.
	•	Non-Necessary Cookies:
	◦	Set non-necessary cookies (e.g., ai_session, _ga) only if the user has given consent.
	◦	Example: if (hasConsent) {
	◦	  Cookies.set('ai_session', 'some_value', { expires: 30 });
	◦	}
	◦	
2.3. Cookie Removal
	•	If the user declines or withdraws consent, the agent must remove all non-necessary cookies.
	•	Use the resetCookieConsentValue function from react-cookie-consent to reset consent and remove non-necessary cookies.
	•	Example: import { resetCookieConsentValue } from 'react-cookie-consent';
	•	
	•	const handleWithdrawConsent = () => {
	•	  resetCookieConsentValue();
	•	  Cookies.remove('ai_session');
	•	  Cookies.remove('_ga');
	•	};
	•	
2.4. Consent Withdrawal
	•	The agent must provide a mechanism for users to withdraw consent at any time.
	•	This can be implemented through a settings page or a “Manage Cookies” button that triggers the withdrawal logic.
	•	Example: const resetConsent = () => {
	•	  setConsentGiven(null);
	•	  localStorage.removeItem('cookieConsent');
	•	  Cookies.remove('ai_session');
	•	  Cookies.remove('_ga');
	•	};
	•	
2.5. Integration with Existing Components
	•	The agent must work seamlessly with the existing CookiesBanner.tsx component.
	•	If additional consent options are needed (e.g., granular control for different cookie types), extend the banner to include these options.
	•	Example extension:
	•	  This website uses cookies to enhance your experience. Learn more.
	•	
	•	
2.6. AI Feature Handling
	•	If the website includes AI features (e.g., personalization, recommendation systems), ensure that any cookies used by these features are classified as non-necessary and require consent.
	•	The agent must disable or degrade AI features gracefully if consent is not given.
	•	Example: if (hasConsent) {
	•	  // Enable AI personalization
	•	  loadAIScripts();
	•	} else {
	•	  // Disable AI personalization
	•	  disableAIScripts();
	•	}
	•	
3. Technical Requirements
	•	Client-Side Handling:
	◦	All cookie operations must be performed on the client-side, as cookies are client-side storage.
	◦	Use libraries like js-cookie for easier cookie management.
	•	Server-Side Handling:
	◦	For server-side rendered (SSR) components, access cookies from the request object (e.g., req.cookies in NextJS API routes).
	◦	Ensure that Supabase authentication cookies are properly set and validated on the server.
	•	Supabase Integration:
	◦	Use @supabase/ssr for handling Supabase Auth in SSR contexts, as it is the recommended approach for newer versions of Supabase.
	◦	Example: import { createClient } from '@supabase/ssr';
	◦	
	◦	const supabase = createClient();
	◦	
4. GDPR Compliance
	•	Explicit Consent: Obtain explicit user consent for all non-necessary cookies via the consent banner.
	•	Clear Information: Provide a privacy policy that explains cookie usage, including the cookie spec table. Link to this policy from the consent banner.
	•	User Control: Allow users to accept, decline, or withdraw consent at any time.
	•	Necessary vs. Non-Necessary: Clearly distinguish between cookie types and ensure only necessary cookies are set without consent.
	•	Cookie Management: Use react-cookie-consent to handle consent and storage, ensuring proper expiry and security settings (e.g., secure: true for HTTPS).
5. Testing and Verification
	•	Consent Banner:
	◦	Verify that the banner appears on first visit and hides after a user makes a choice.
	•	Cookie Setting:
	◦	Confirm that necessary cookies are always set.
	◦	Confirm that non-necessary cookies are only set after consent is given.
	•	Consent Withdrawal:
	◦	Test that users can withdraw consent and that non-necessary cookies are removed.
	•	AI Features:
	◦	Test that AI features are disabled or degraded when consent is not given.
	•	SSR Compatibility:
	◦	Ensure that cookies are properly handled in both client-side and server-side contexts.
6. Documentation
	•	Update the project’s README or documentation to include this specification.
	•	Include the cookie spec table in the website’s privacy policy.
	•	Provide clear instructions for developers on how to extend or modify the cookie system while maintaining compliance.
7. Example Implementation
Below is an example of how the agent can interact with the cookie system in a component:
import { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { getCookieConsentValue, resetCookieConsentValue } from 'react-cookie-consent';

export default function CookieAgent() {
  const [consentGiven, setConsentGiven] = useState(null);

  useEffect(() => {
    const storedConsent = localStorage.getItem('cookieConsent');
    if (storedConsent !== null) {
      setConsentGiven(storedConsent === 'true');
    }
  }, []);

  const handleAccept = () => {
    setConsentGiven(true);
    localStorage.setItem('cookieConsent', 'true');
    // Set non-necessary cookies
    Cookies.set('ai_session', 'some_value', { expires: 30 });
  };

  const handleDecline = () => {
    setConsentGiven(false);
    localStorage.setItem('cookieConsent', 'false');
    // Remove non-necessary cookies
    Cookies.remove('ai_session');
  };

  const resetConsent = () => {
    setConsentGiven(null);
    localStorage.removeItem('cookieConsent');
    Cookies.remove('ai_session');
  };

  // Render consent banner if undecided
  if (consentGiven === null) {
    return (
      
        
We use cookies to enhance your experience. Learn more.
        Accept
        Decline
      
    );
  }

  // Provide withdrawal option
  return (
    
      Manage Cookies
    
  );
}
Conclusion
This specification ensures that the AI agent interacts with the cookie system in a GDPR-compliant manner while leveraging the existing CookiesBanner.tsx component. It provides clear guidelines for handling consent, setting and removing cookies, and integrating with AI features. By following this spec, you can complete the cookie functionality in your repository while ensuring transparency and user control.
Citations:
	•	Supabase Authentication Cookies
	•	react-cookie-consent Documentation
	•	GDPR Cookie Consent Guidelines
