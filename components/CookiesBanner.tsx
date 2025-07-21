'use client';

import { useEffect, useState } from "react";
import { faFingerprint, faShieldAlt } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { FormattedMessage, useIntl } from "react-intl";
import Link from 'next/link';

import { getLocalStorage, setLocalStorage } from "../lib/library";
import { removeNonNecessaryCookies } from "../lib/cookies/cookieManager";

// https://www.cookiebot.com/ Refer this link in the future

const CookiesBanner = () => {
    
    const [cookiesVisible, setCookiesVisible] = useState<boolean>(false);
    const [cookieConsent, setCookieConsent] = useState<boolean>(true);
    
    // Get the cookie choice value from localStorage during component initialization
    useEffect(() => {
        const hasUserConsent = getLocalStorage("cookie_consent", null);
        
        // If no consent value stored yet, show the banner immediately
        if (hasUserConsent === null) {
            setCookiesVisible(true);
        } else {
            // If we have a stored preference, use it
            setCookieConsent(hasUserConsent === 'granted');
        }
    }, []);


    // Update localStorage whenever consent changes
    useEffect(() => {
        const newValue = cookieConsent ? 'granted' : 'denied';
        
        // Only store the value if a choice has been made (banner was shown and interacted with)
        if (cookiesVisible === false) {
            setLocalStorage("cookie_consent", newValue);
        }
    }, [cookieConsent, cookiesVisible]);
    

    return (
      <>
       <div className="fixed left-0 bottom-0 z-50">
            {/* Advise  */}
            <div className={`fixed sm:left-4 bottom-20 rounded-lg bg-white shadow-2xl w-full sm:w-1/2 xl:w-1/4 max-w-[450px] overflow-hidden transform transition-transform duration-300 ease-in-out ${cookiesVisible ? 'translate-y-0' : 'translate-y-full hidden'}`}>
                    <div className="relative overflow-hidden px-8 pt-8">
                        <div className="w-20 h-16 absolute -top-10 -right-10 text-yellow-500">
                            <svg width="120" height="119" viewBox="0 0 120 119" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path opacity="0.3"
                                    d="M6.38128 49.1539C3.20326 32.893 13.809 17.1346 30.0699 13.9566L70.3846 6.07751C86.6455 2.89948 102.404 13.5052 105.582 29.7661L113.461 70.0808C116.639 86.3417 106.033 102.1 89.7724 105.278L49.4577 113.157C33.1968 116.335 17.4384 105.729 14.2604 89.4686L6.38128 49.1539Z"
                                    fill="currentColor"/>
                            </svg>
                        </div>
                    </div>

                {/* Text */}
                <div className="flex flex-col md:ml-12">
                    <div className="p-4">
                        <div className="text-2xl flex flex-col pb-4">
                            <small>
                                <FormattedMessage
                                    id="cookies_small_text"
                                    description="Cookies Small Text" // Description should be a string literal
                                    defaultMessage="Your Privacy Matters" // Message should be a string literal
                                    />
                            </small>
                            <span className="block font-bold text-2xl">
                                <FormattedMessage
                                    id="cookies_heading"
                                    description="Cookies Heading" // Description should be a string literal
                                    defaultMessage="Cookie Preferences" // Message should be a string literal
                                    />
                            </span>
                        </div>
                        <div className="pb-4">
                            <p>
                                <FormattedMessage
                                    id="cookies_description"
                                    description="Cookies Description" // Description should be a string literal
                                    defaultMessage="We use cookies to enhance your browsing experience, analyze site traffic, and personalize content. Necessary cookies enable core functionality while optional cookies help us improve our services. By clicking 'Accept All', you consent to our use of cookies as described in our Privacy Policy." // Message should be a string literal
                                    />
                            </p>
                            <p className="mt-5">
                                <Link 
                                    href="/privacy-policy" 
                                    className="text-[#1249de] hover:underline"
                                    onClick={() => setCookiesVisible(false)}
                                    prefetch={false}
                                >
                                    <FormattedMessage
                                        id="cookies_privacy_link"
                                        description="Privacy Policy Link" 
                                        defaultMessage="Read our Privacy Policy for more information"
                                    />
                                </Link>
                            </p>
                        </div>
                    </div>

                </div>

                {/* Button */}
                <div className="w-full flex justify-center items-center border-t border-solid border-gray-200">
                    <button 
                        className="border-r border-gray-200 flex-1 px-4 py-3 text-white bg-[#00539c] duration-150" 
                        onClick={() => { 
                            setCookieConsent(false); 
                            setCookiesVisible(false);
                            // Remove any non-essential cookies when user declines
                            removeNonNecessaryCookies();
                        }}
                    >
                                                <FormattedMessage
                        id="cookies_deny_button"
                        description="Cookies Deny Button" // Description should be a string literal
                        defaultMessage="Necessary Only" // Message should be a string literal
                        />
                    </button>
                    <button 
                        className="flex-1 px-4 py-3 text-black bg-[#eea47f] hover:bg-opacity-90 duration-150" 
                        onClick={() => { 
                            setCookieConsent(true); 
                            setCookiesVisible(false);
                            // Additional code can be added here to set specific cookies when consent is granted
                        }}
                    >
                        <FormattedMessage
                            id="cookies_accept_button"
                            description="Cookies Accept Button" // Description should be a string literal
                            defaultMessage="Accept All" // Message should be a string literal
                        />
                    </button>
                </div>
            </div>

            {/* Floating Buttons for Cookie Management and Privacy Policy */}
            <div className="fixed left-4 bottom-4 flex gap-2 z-50">
                <button 
                    className="uppercase text-sm px-4 py-4 bg-[#004b8c] text-white rounded-full transition-colors"
                    onClick={() => setCookiesVisible(!cookiesVisible)}
                    aria-label="Manage Cookie Preferences"
                >
                    <FontAwesomeIcon icon={faFingerprint} size="2x" />
                </button>
                
                <Link 
                    href="/privacy-policy" 
                    className="uppercase text-sm px-4 py-4 bg-[#1249de] text-white rounded-full hover:bg-[#12dea8] transition-colors"
                    aria-label="Privacy Policy"
                    onClick={() => setCookiesVisible(false)}
                    prefetch={false}
                >
                    <FontAwesomeIcon icon={faShieldAlt} size="2x" />
                </Link>
            </div>
       </div>
      </>
    );
  };
  
  export default CookiesBanner;