import { useState } from "react";
import { faFingerprint } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { FormattedMessage } from "react-intl";

// https://www.cookiebot.com/ Refer this link in the future

const CookiesBanner = ({  }) => {
    
    const [ cookiesVisible, setCookiesVisible] = useState(false);

    return (
      <>
       <div className="fixed left-0 bottom-0 z-40">
            {/* Advise  */}
            <div className={`fixed sm:left-4 bottom-20 rounded-lg bg-white shadow-2xl w-full sm:w-1/2 xl:w-1/4 max-w-[450px] overflow-hidden ${cookiesVisible ? 'visible' : 'hidden'}`}>

                {/* Text */}
                <div className="">
                    <div className="relative overflow-hidden px-8 pt-8">
                        <div className="w-20 h-16 absolute -top-10 -right-10 text-yellow-500">
                            <svg width="120" height="119" viewBox="0 0 120 119" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path opacity="0.3"
                                    d="M6.38128 49.1539C3.20326 32.893 13.809 17.1346 30.0699 13.9566L70.3846 6.07751C86.6455 2.89948 102.404 13.5052 105.582 29.7661L113.461 70.0808C116.639 86.3417 106.033 102.1 89.7724 105.278L49.4577 113.157C33.1968 116.335 17.4384 105.729 14.2604 89.4686L6.38128 49.1539Z"
                                    fill="currentColor"/>
                            </svg>
                        </div>
                        <div className="text-2xl flex flex-col pb-4">
                            <small>
                                <FormattedMessage
                                id="cookies_small_text"
                                description="Cookies heading" // Description should be a string literal
                                defaultMessage="Hello There ..." // Message should be a string literal
                                />
                            </small>
                            <span className="text-3xl font-bold">
                                <FormattedMessage
                                    id="cookies_heading"
                                    description="Cookies heading" // Description should be a string literal
                                    defaultMessage="We are the Cookies !" // Message should be a string literal
                                    />
                            </span>
                        </div>
                        <div className="pb-4">
                            <p>
                                <FormattedMessage
                                    id="cookies_description"
                                    description="Cookies Description" // Description should be a string literal
                                    defaultMessage="Lorem ipsum dolor sit amet, consectetur adipisicing elit. Ab, accusamus aliquid aperiam beatae
                                    consectetur culpa dolores eum expedita, ipsam iure laboriosam nobis odit quos, sed sunt
                                    veritatis voluptas voluptate voluptatum!" // Message should be a string literal
                                    />
                            </p>
                        </div>
                    </div>

                </div>

                {/* Button */}
                <div className="w-full flex justify-center items-center border-t border-solid border-gray-200">
                    <button className="border-r border-gray-200 flex-1 px-4 py-3 text-gray-500 hover:text-white hover:bg-red-400 duration-150" >
                        <FormattedMessage
                        id="cookies_deny_button"
                        description="Cookies Deny Button" // Description should be a string literal
                        defaultMessage="No thanks !" // Message should be a string literal
                        />
                    </button>
                    <button className="flex-1 px-4 py-3 text-gray-500 hover:text-white hover:bg-green-400 duration-150">
                        <FormattedMessage
                        id="cookies_accept_button"
                        description="Cookies Accept Button" // Description should be a string literal
                        defaultMessage="Off course" // Message should be a string literal
                        />
                    </button>
                </div>
            </div>

            {/* Button */}
            
            <button className="fixed left-4 bottom-2 uppercase text-sm px-4 py-4 bg-gray-900 text-white rounded-full" onClick={() => setCookiesVisible(!cookiesVisible)}>
                <FontAwesomeIcon icon={faFingerprint} size="2x" />
            </button>
       </div>
      </>
    );
  };
  
  export default CookiesBanner;