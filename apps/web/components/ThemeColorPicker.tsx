import React, { useState, useEffect, useRef } from 'react';
import { useThemeSettings } from '../lib/use-theme-settings';
import { useIntl } from 'react-intl';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPalette } from '@fortawesome/free-solid-svg-icons';
import RoundButton from './RoundButton';

const themeColors = [
  { name: 'blue', labelId: 'theme-blue', hex: '#00539c' },
  { name: 'green', labelId: 'theme-green', hex: '#22c55e' },
  { name: 'purple', labelId: 'theme-purple', hex: '#a855f7' },
  { name: 'orange', labelId: 'theme-orange', hex: '#f97316' },
  { name: 'teal', labelId: 'theme-teal', hex: '#14b8a6' },
];

export default function ThemeColorPicker() {
  const { color: activeColor, setColor } = useThemeSettings();
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const intl = useIntl();

  useEffect(() => {
    setMounted(true);
    
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  if (!mounted) {
    return (
      <div className="relative">
        {/* Mobile Skeleton */}
        <div className="md:hidden w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse" />
         
        {/* Desktop Skeleton */}
        <div className="hidden md:flex gap-2 p-1.5 bg-white/50 dark:bg-gray-800/50 rounded-full border border-gray-100 dark:border-gray-700">
          {themeColors.map((c) => (
            <div key={c.name} className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Mobile Trigger Button */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden flex items-center justify-center cursor-pointer"
        aria-label={intl.formatMessage({ id: 'theme-picker-label', defaultMessage: 'Change theme color' })}
        role="button"
        aria-expanded={isOpen}
      >
        <RoundButton>
          <FontAwesomeIcon icon={faPalette} size="lg" />
        </RoundButton>
      </div>

      {/* Mobile Dropdown Panel */}
      {isOpen && (
        <div className="md:hidden absolute top-12 left-1/2 transform -translate-x-1/2 z-50 flex gap-2 p-3 bg-white dark:bg-gray-900 rounded-full border border-gray-100 dark:border-gray-800 shadow-xl animate-fadeIn">
            {themeColors.map(({ name, labelId, hex }) => {
                const isActive = activeColor === name;
                return (
                    <button
                        key={name}
                        onClick={() => {
                            setColor(name);
                            setIsOpen(false);
                        }}
                        className={`
                        w-8 h-8 rounded-full transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-gray-400
                        ${isActive ? 'ring-2 ring-offset-2 ring-gray-900 dark:ring-gray-100 scale-110' : ''}
                        `}
                        style={{ backgroundColor: hex }}
                        aria-label={intl.formatMessage({ id: labelId })}
                    />
                );
            })}
        </div>
      )}

      {/* Desktop Inline View */}
      <div className="hidden md:flex items-center gap-2 p-1.5 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md rounded-full border border-gray-100 dark:border-gray-800 shadow-lg transition-colors duration-300">
        {themeColors.map(({ name, labelId, hex }) => {
          const isActive = activeColor === name;

          return (
            <button
              key={name}
              onClick={() => setColor(name)}
              className={`
                relative w-6 h-6 rounded-full transition-all duration-300 ease-out
                hover:scale-110 active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-gray-400 dark:focus:ring-gray-500
                ${
                  isActive
                    ? 'ring-2 ring-offset-2 ring-gray-900 dark:ring-gray-100 scale-105 shadow-md'
                    : 'hover:shadow-md border border-transparent'
                }
              `}
              style={{ backgroundColor: hex }}
              aria-label={intl.formatMessage({ id: labelId })}
              aria-pressed={isActive}
              title={intl.formatMessage({ id: labelId })}
            />
          );
        })}
      </div>
    </div>
  );
}
