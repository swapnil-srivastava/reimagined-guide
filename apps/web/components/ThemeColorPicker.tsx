import React, { useState, useEffect, useRef } from 'react';
import { useThemeSettings } from '../lib/use-theme-settings';
import { useIntl } from 'react-intl';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPalette, faXmark } from '@fortawesome/free-solid-svg-icons';
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
  const wrapperRef = useRef<HTMLDivElement>(null);
  const intl = useIntl();

  useEffect(() => {
    setMounted(true);
    
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  if (!mounted) {
    return (
      <div className="relative">
        <div className="md:hidden w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse m-0.5" />
        <div className="hidden md:flex gap-2 p-1.5 bg-white/50 dark:bg-gray-800/50 rounded-full border border-gray-100 dark:border-gray-700">
          {themeColors.map((c) => (
            <div key={c.name} className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-9 flex items-center" ref={wrapperRef}>
      {/* Mobile: Animated Container */}
      <div className="md:hidden">
        {/* Trigger Button - Rotates when open */}
        <div 
          className={`transition-all duration-300 ease-in-out transform ${
            isOpen ? 'rotate-180' : 'rotate-0'
          }`}
          onClick={() => setIsOpen(!isOpen)}
          role="button"
          aria-label={intl.formatMessage({ id: 'theme-picker-label', defaultMessage: 'Change theme color' })}
        >
          <RoundButton>
            {isOpen ? (
                 <FontAwesomeIcon icon={faXmark} size="lg" />
            ) : (
                <FontAwesomeIcon icon={faPalette} size="lg" />
            )}
          </RoundButton>
        </div>

        {/* Floating Palette Dropdown (Below Navbar) */}
        {isOpen && (
            <div 
            className="
                fixed top-20 left-0 right-0 p-4 
                flex justify-center items-center 
                bg-white/95 dark:bg-gray-900/95 backdrop-blur-md 
                border-b border-gray-100 dark:border-gray-800 
                shadow-lg z-40 animate-slideDown
            "
            onClick={(e) => e.stopPropagation()} // Prevent close when clicking panel
            >
            <div className="flex gap-4 p-2">
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
                        w-10 h-10 rounded-full transition-transform duration-200
                        ${isActive 
                        ? 'ring-4 ring-offset-2 ring-gray-900 dark:ring-gray-100 scale-110 shadow-xl' 
                        : 'hover:scale-110 border-2 border-transparent shadow-md'
                        }
                    `}
                    style={{ backgroundColor: hex }}
                    aria-label={intl.formatMessage({ id: labelId })}
                    />
                );
                })}
            </div>
            </div>
        )}
      </div>

      {/* Desktop Inline View (Unchanged) */}
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
