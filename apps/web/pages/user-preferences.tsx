import { NextPage } from 'next';
import Head from 'next/head';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { FormattedMessage } from 'react-intl';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';

// Import with SSR disabled to prevent hydration errors since it depends on cookies
const PersonalizationPreferences = dynamic(
  () => import('../components/personalization/PersonalizationPreferences'),
  { ssr: false }
);

const UserPreferences: NextPage = () => {
  return (
    <>
      <Head>
        <title>User Preferences - Reimagined Guide</title>
        <meta name="description" content="Manage your personalization preferences" />
      </Head>
      <div className="container mx-auto px-4 py-8 text-blog-black dark:text-blog-white">
        <h1 className="text-3xl font-bold mb-6 text-blog-black dark:text-blog-white">
          <FormattedMessage id="preferences.title" defaultMessage="User Preferences" />
        </h1>
        <div className="mb-6">
          <p className="dark:text-blog-white">
            <FormattedMessage
              id="preferences.intro"
              defaultMessage="Customize your experience on our platform by adjusting your personalization settings. These settings will be saved according to your cookie preferences."
            />
          </p>
        </div>
        <PersonalizationPreferences />
        <div className="mt-8">
          <Link href="/" legacyBehavior>
            <a className="text-[#1249de] hover:text-[#385dc5] dark:text-[#12dea8] dark:hover:text-[#385dc5] flex items-center gap-2">
              <FontAwesomeIcon icon={faArrowLeft} className="h-4 w-4" />
              <span>
                <FormattedMessage id="preferences.back_to_home" defaultMessage="Back to Home" />
              </span>
            </a>
          </Link>
        </div>
      </div>
    </>
  );
};

export default UserPreferences;
