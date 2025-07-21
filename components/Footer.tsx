'use client';

import Link from 'next/link';
import { FormattedMessage } from 'react-intl';

export default function Footer() {
  return (
    <footer className="mt-auto pb-20 py-6 bg-blog-white  dark:bg-fun-blue-600 dark:text-blog-white drop-shadow-lg hover:drop-shadow-xl">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <p className="text-black dark:text-[#fbfbfb] text-sm">
              &copy; {new Date().getFullYear()} swapnilsrivastava.eu {" "}
              <FormattedMessage
                id="footer.rights"
                defaultMessage="All rights reserved."
              />
            </p>
          </div>
          <div className="flex space-x-6">
            <Link href="/privacy-policy" legacyBehavior>
              <a className="text-black dark:text-[#fbfbfb] hover:text-[#1249de] text-sm">
                <FormattedMessage
                  id="footer.privacy_policy"
                  defaultMessage="Privacy Policy"
                />
              </a>
            </Link>
            <Link href="/user-preferences" legacyBehavior>
              <a className="text-black dark:text-[#fbfbfb] hover:text-[#1249de] text-sm">
                <FormattedMessage
                  id="footer.preferences"
                  defaultMessage="Preferences"
                />
              </a>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
