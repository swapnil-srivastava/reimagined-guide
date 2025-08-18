'use client';

import Link from 'next/link';
import { FormattedMessage } from 'react-intl';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart, faGlobe, faShield, faCog } from '@fortawesome/free-solid-svg-icons';

export default function Footer() {
  return (
    <footer className="mt-auto bg-blog-white dark:bg-fun-blue-500 border-t border-gray-200 dark:border-gray-700 shadow-lg">
      <div className="px-4 py-3 sm:px-6 lg:px-8">
        {/* Mobile-first responsive layout */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          
          {/* Copyright and Built with Love - Mobile: stacked, Desktop: left side */}
          <div className="flex flex-col gap-1 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-1 text-xs text-gray-600 dark:text-gray-300">
              <span>&copy; {new Date().getFullYear()}</span>
              <span className="hidden sm:inline">swapnilsrivastava.eu</span>
              <span className="sm:hidden">swapnilsrivastava.eu</span>
              <span>•</span>
              <FormattedMessage
                id="footer.rights"
                description="All rights reserved text"
                defaultMessage="All rights reserved"
              />
            </div>
            
            {/* Built with love message */}
            <div className="flex items-center justify-center sm:justify-start gap-1 text-xs text-primary-blue dark:text-teal-accent">
              <FormattedMessage
                id="footer.built-with-love"
                description="Built with love message"
                defaultMessage="Built with"
              />
              <FontAwesomeIcon 
                icon={faHeart} 
                className="text-red-500 animate-pulse w-3 h-3" 
              />
              <FormattedMessage
                id="footer.by-swapnil"
                description="By Swapnil Srivastava"
                defaultMessage="by Swapnil Srivastava"
              />
            </div>
          </div>

          {/* Navigation Links - Mobile: row, Desktop: right side */}
          <div className="flex items-center justify-center gap-4 sm:gap-6">
            <Link 
              href="/privacy-policy" 
              className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-300 hover:text-primary-blue dark:hover:text-teal-accent transition-colors duration-200"
            >
              <FontAwesomeIcon icon={faShield} className="w-3 h-3" />
              <FormattedMessage
                id="footer.privacy-policy"
                description="Privacy Policy link"
                defaultMessage="Privacy"
              />
            </Link>
            
            <Link 
              href="/user-preferences" 
              className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-300 hover:text-primary-blue dark:hover:text-teal-accent transition-colors duration-200"
            >
              <FontAwesomeIcon icon={faCog} className="w-3 h-3" />
              <FormattedMessage
                id="footer.preferences"
                description="User preferences link"
                defaultMessage="Settings"
              />
            </Link>
            
            <Link 
              href="/technology" 
              className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-300 hover:text-primary-blue dark:hover:text-teal-accent transition-colors duration-200"
            >
              <FontAwesomeIcon icon={faGlobe} className="w-3 h-3" />
              <FormattedMessage
                id="footer.technology"
                description="Technology stack link"
                defaultMessage="Tech"
              />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
