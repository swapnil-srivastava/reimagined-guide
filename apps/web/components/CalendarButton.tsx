'use client';

import React, { useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarPlus, faChevronDown, faExternalLinkAlt, faDownload } from '@fortawesome/free-solid-svg-icons';
import { getCalendarLink, getAllCalendarOptions } from '../lib/calendar';

interface CalendarButtonProps {
  title: string;
  description?: string;
  location: string;
  date: string; // YYYY-MM-DD format
  time: string; // HH:MM:SS format
  className?: string;
}

const CalendarButton: React.FC<CalendarButtonProps> = ({ 
  title, 
  description, 
  location, 
  date, 
  time, 
  className = '' 
}) => {
  const [showDropdown, setShowDropdown] = useState(false);
  
  const eventData = { title, description, location, date, time };
  const primaryCalendarLink = getCalendarLink(eventData);
  const allCalendarOptions = getAllCalendarOptions(eventData);

  const handlePrimaryClick = () => {
    window.open(primaryCalendarLink, '_blank', 'noopener,noreferrer');
  };

  const handleOptionClick = (option: any) => {
    if (option.action) {
      option.action();
    } else {
      window.open(option.link, '_blank', 'noopener,noreferrer');
    }
    setShowDropdown(false);
  };

  return (
    <div className={`relative z-0 ${className}`} style={{ isolation: 'isolate' }}>
      {/* Primary Add to Calendar Button */}
      <div className="flex">
        <button
          onClick={handlePrimaryClick}
          className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-l-lg transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2 shadow-sm font-medium"
        >
          <FontAwesomeIcon icon={faCalendarPlus} className="text-lg" />
          <span className="text-sm md:text-base">
            <FormattedMessage
              id="calendar-button-add-to-calendar"
              description="Add to Calendar button"
              defaultMessage="Add to Calendar"
            />
          </span>
        </button>
        
        {/* Dropdown Toggle */}
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="px-3 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-r-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2 shadow-sm border-l border-green-400"
        >
          <FontAwesomeIcon icon={faChevronDown} className={`text-sm transition-transform duration-200 ${showDropdown ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Dropdown Menu */}
      {showDropdown && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-fun-blue-600 rounded-lg shadow-xl border border-gray-200 dark:border-fun-blue-500 z-[99999] overflow-visible min-w-max">
          <div className="py-2">
            {allCalendarOptions.map((option, index) => (
              <button
                key={index}
                onClick={() => handleOptionClick(option)}
                className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-fun-blue-700 transition-colors duration-200 flex items-center gap-3 whitespace-nowrap"
              >
                <span className="text-lg">{option.icon}</span>
                <span className="font-medium text-blog-black dark:text-blog-white">
                  {option.name}
                </span>
                {option.action ? (
                  <FontAwesomeIcon icon={faDownload} className="ml-auto text-gray-400 text-sm" />
                ) : (
                  <FontAwesomeIcon icon={faExternalLinkAlt} className="ml-auto text-gray-400 text-sm" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Overlay to close dropdown */}
      {showDropdown && (
        <div 
          className="fixed inset-0 z-[99998]" 
          onClick={() => setShowDropdown(false)}
        />
      )}
    </div>
  );
};

export default CalendarButton;
