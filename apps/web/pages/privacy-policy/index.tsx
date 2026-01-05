import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { FormattedMessage } from 'react-intl';

const PrivacyPolicy: NextPage = () => {
  return (
    <>
      <Head>
        <title>Privacy & Cookie Policy - swapnilsrivastava.eu</title>
        <meta name="description" content="Our privacy and cookie policy explains how we use cookies and process your data." />
      </Head>
      <div className="container mx-auto px-4 py-8 text-gray-900 dark:text-white">
        <h1 className="text-3xl font-bold mb-6 text-black dark:text-white">
          <FormattedMessage
            id="privacy-policy-title"
            description="Privacy & Cookie Policy"
            defaultMessage="Privacy & Cookie Policy"
          />
        </h1>
        
        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4 dark:text-white">
            <FormattedMessage
              id="privacy-policy-overview-title"
              description="Overview"
              defaultMessage="Overview"
            />
          </h2>
          <p className="mb-4 dark:text-white">
            <FormattedMessage
              id="privacy-policy-overview-text"
              description="This Privacy & Cookie Policy explains how we collect, use, and protect your information when you visit our website. We are committed to ensuring the privacy and security of your data."
              defaultMessage="This Privacy & Cookie Policy explains how we collect, use, and protect your information when you visit our website. We are committed to ensuring the privacy and security of your data."
            />
          </p>
        </section>
        
        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4 dark:text-white">Cookie Policy</h2>
          <p className="mb-4 dark:text-white">
            Our website uses cookies to enhance your browsing experience. Here&apos;s how we use them:
          </p>
          
          <h3 className="text-xl font-semibold mb-2 dark:text-white">Necessary Cookies</h3>
          <p className="mb-4 dark:text-white">
            These cookies are essential for the website to function properly. They enable core 
            functionality such as security, account management, and session management. You cannot 
            disable these cookies through our system.
          </p>
          
          <table className="w-full border-collapse mb-6">
            <thead>
              <tr className="bg-gray-100 dark:bg-gray-700">
                <th className="border p-2 text-left dark:border-gray-600">Name</th>
                <th className="border p-2 text-left dark:border-gray-600">Purpose</th>
                <th className="border p-2 text-left dark:border-gray-600">Duration</th>
              </tr>
            </thead>
            <tbody>
              <tr className="dark:bg-gray-800">
                <td className="border p-2 dark:border-gray-600">sb-access-token</td>
                <td className="border p-2 dark:border-gray-600">Supabase authentication</td>
                <td className="border p-2 dark:border-gray-600">Session</td>
              </tr>
              <tr className="dark:bg-gray-800">
                <td className="border p-2 dark:border-gray-600">sb-refresh-token</td>
                <td className="border p-2 dark:border-gray-600">Supabase authentication refresh</td>
                <td className="border p-2 dark:border-gray-600">30 days</td>
              </tr>
              <tr className="dark:bg-gray-800">
                <td className="border p-2 dark:border-gray-600">last_login</td>
                <td className="border p-2 dark:border-gray-600">Records your last login time</td>
                <td className="border p-2 dark:border-gray-600">30 days</td>
              </tr>
            </tbody>
          </table>
          
          <h3 className="text-xl font-semibold mb-2 dark:text-white">Preference Cookies</h3>
          <p className="mb-4 dark:text-white">
            These cookies allow the website to remember choices you make and provide enhanced, personalized features.
          </p>
          
          <table className="w-full border-collapse mb-6">
            <thead>
              <tr className="bg-gray-100 dark:bg-gray-700">
                <th className="border p-2 text-left dark:border-gray-600">Name</th>
                <th className="border p-2 text-left dark:border-gray-600">Purpose</th>
                <th className="border p-2 text-left dark:border-gray-600">Duration</th>
              </tr>
            </thead>
            <tbody>
              <tr className="dark:bg-gray-800">
                <td className="border p-2 dark:border-gray-600">theme_preference</td>
                <td className="border p-2 dark:border-gray-600">Stores your dark/light mode preference</td>
                <td className="border p-2 dark:border-gray-600">365 days</td>
              </tr>
            </tbody>
          </table>
          
          <h3 className="text-xl font-semibold mb-2 dark:text-white">Analytics Cookies</h3>
          <p className="mb-4 dark:text-white">
            These cookies allow us to count visits and traffic sources so we can measure and improve 
            the performance of our site.
          </p>
          
          <table className="w-full border-collapse mb-6">
            <thead>
              <tr className="bg-gray-100 dark:bg-gray-700">
                <th className="border p-2 text-left dark:border-gray-600">Name</th>
                <th className="border p-2 text-left dark:border-gray-600">Purpose</th>
                <th className="border p-2 text-left dark:border-gray-600">Duration</th>
              </tr>
            </thead>
            <tbody>
              <tr className="dark:bg-gray-800">
                <td className="border p-2 dark:border-gray-600">_ga</td>
                <td className="border p-2 dark:border-gray-600">Google Analytics - Distinguishes users</td>
                <td className="border p-2 dark:border-gray-600">2 years</td>
              </tr>
              <tr className="dark:bg-gray-800">
                <td className="border p-2 dark:border-gray-600">_gid</td>
                <td className="border p-2 dark:border-gray-600">Google Analytics - Distinguishes users for 24 hours</td>
                <td className="border p-2 dark:border-gray-600">24 hours</td>
              </tr>
            </tbody>
          </table>
          
          <h3 className="text-xl font-semibold mb-2 dark:text-white">AI/Personalization Cookies</h3>
          <p className="mb-4 dark:text-white">
            These cookies are used to provide personalized experiences and content based on your interactions.
          </p>
          
          <table className="w-full border-collapse mb-6">
            <thead>
              <tr className="bg-gray-100 dark:bg-gray-700">
                <th className="border p-2 text-left dark:border-gray-600">Name</th>
                <th className="border p-2 text-left dark:border-gray-600">Purpose</th>
                <th className="border p-2 text-left dark:border-gray-600">Duration</th>
              </tr>
            </thead>
            <tbody>
              <tr className="dark:bg-gray-800">
                <td className="border p-2 dark:border-gray-600">ai_session</td>
                <td className="border p-2 dark:border-gray-600">Stores AI personalization preferences</td>
                <td className="border p-2 dark:border-gray-600">30 days</td>
              </tr>
              <tr className="dark:bg-gray-800">
                <td className="border p-2 dark:border-gray-600">personalization_prefs</td>
                <td className="border p-2 dark:border-gray-600">Stores personalization settings</td>
                <td className="border p-2 dark:border-gray-600">365 days</td>
              </tr>
            </tbody>
          </table>
          
          <h3 className="text-xl font-semibold mb-2 dark:text-white">Managing Your Cookie Preferences</h3>
          <p className="dark:text-white">
            You can change your cookie preferences at any time by clicking the &quot;Cookie Preferences&quot; 
            button at the bottom left corner of any page.
          </p>
        </section>
        
        <div className="mt-8">
          <Link href="/" legacyBehavior>
            <a className="text-[#1249de] hover:text-[#385dc5] dark:text-[#12dea8] dark:hover:text-[#385dc5] flex items-center gap-2">
              <FontAwesomeIcon icon={faArrowLeft} className="h-4 w-4" />
              <span>
                <FormattedMessage id="privacy.back_to_home" defaultMessage="Back to Home" />
              </span>
            </a>
          </Link>
        </div>
      </div>
    </>
  );
};

export default PrivacyPolicy;
