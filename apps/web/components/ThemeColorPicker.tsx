import React, { useState, useEffect, useRef } from 'react';
import { useThemeSettings } from '../lib/use-theme-settings';
import { useIntl, FormattedMessage } from 'react-intl';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faXmark, faPalette } from '@fortawesome/free-solid-svg-icons';
import RoundButton from './RoundButton';

const themeColors = [
  { name: 'blue', labelId: 'theme-blue', hex: '#00539c', defaultLabel: 'Blue' },
  { name: 'green', labelId: 'theme-green', hex: '#22c55e', defaultLabel: 'Green' },
  { name: 'purple', labelId: 'theme-purple', hex: '#a855f7', defaultLabel: 'Purple' },
  { name: 'orange', labelId: 'theme-orange', hex: '#f97316', defaultLabel: 'Orange' },
  { name: 'teal', labelId: 'theme-teal', hex: '#14b8a6', defaultLabel: 'Teal' },
];

export default function ThemeColorPicker() {
  const { color: activeColor, setColor } = useThemeSettings();
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [hoveredColor, setHoveredColor] = useState<string | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const intl = useIntl();

  const activeTheme = themeColors.find((c) => c.name === activeColor) || themeColors[0];
  const activeIndex = themeColors.findIndex((c) => c.name === activeColor);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Close on escape key
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') setIsOpen(false);
    }
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  if (!mounted) {
    return (
      <div className="relative">
        <div className="md:hidden w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse m-0.5" />
        <div className="hidden md:flex gap-2 p-1.5 bg-white/70 dark:bg-gray-800/70 rounded-full border border-gray-200 dark:border-gray-700">
          {themeColors.map((c) => (
            <div key={c.name} className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="relative" ref={wrapperRef}>
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* MOBILE: Simple Dropdown Menu                                        */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <div className="md:hidden relative">
        {/* Trigger: Active Color Orb */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="relative group"
          aria-label={intl.formatMessage({ id: 'theme-picker-label', defaultMessage: 'Change theme color' })}
        >
          <span
            className="block w-10 h-10 rounded-full shadow-lg border-2 border-white dark:border-gray-700 transition-transform duration-300 group-hover:scale-110 group-active:scale-95"
            style={{ backgroundColor: activeTheme.hex }}
          />
          <span className="absolute -top-2 -right-2 text-xs bg-white/80 dark:bg-gray-800/80 rounded-full px-1.5 py-0.5 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 shadow-sm">
            <FontAwesomeIcon icon={faPalette} className="w-3 h-3" />
          </span>
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />

            {/* Dropdown Panel */}
            <div
              className="absolute left-1/2 -translate-x-1/2 top-full mt-3 z-50 bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-700 px-4 py-3 w-[min(360px,92vw)]"
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-3">
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-blog-black dark:text-blog-white">
                    <FormattedMessage
                      id="theme-picker-title"
                      description="Mobile theme picker title"
                      defaultMessage="Theme color"
                    />
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    <FormattedMessage
                      id="theme-picker-subtitle"
                      description="Mobile theme picker subtitle"
                      defaultMessage="Pick a tone you like"
                    />
                  </span>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-7 h-7 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors ml-3"
                  aria-label={intl.formatMessage({ id: 'theme-picker-close', defaultMessage: 'Close theme picker' })}
                >
                  <FontAwesomeIcon icon={faXmark} className="w-3 h-3" />
                </button>
              </div>

              {/* Color Options */}
              <div className="grid grid-cols-3 gap-3">
                {themeColors.map(({ name, labelId, hex, defaultLabel }) => {
                  const isActive = activeColor === name;
                  const labelText = intl.formatMessage({ id: labelId, defaultMessage: defaultLabel, description: 'Theme color name' });
                  return (
                    <button
                      key={name}
                      onClick={() => {
                        setColor(name);
                        setIsOpen(false);
                      }}
                      className="relative flex flex-col items-center gap-2 group px-1 py-1"
                      aria-label={labelText}
                      title={labelText}
                    >
                      <span
                        className={`
                          block w-12 h-12 rounded-2xl shadow-lg transition-all duration-200 flex items-center justify-center
                          ${isActive 
                            ? 'ring-2 ring-offset-2 ring-gray-900 dark:ring-gray-100 scale-110 shadow-xl' 
                            : 'group-hover:scale-110 group-active:scale-95'
                          }
                        `}
                        style={{ backgroundColor: hex }}
                      >
                        {isActive && (
                          <FontAwesomeIcon icon={faCheck} className="w-4 h-4 text-white drop-shadow" />
                        )}
                      </span>
                      <span className="text-[11px] font-medium text-gray-600 dark:text-gray-300">
                        {labelText}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* DESKTOP: Segmented Pill Control with Sliding Indicator              */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <div className="hidden md:flex items-center gap-3 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md rounded-full border border-gray-100 dark:border-gray-800 shadow-lg px-3 py-2">
        {themeColors.map(({ name, labelId, hex, defaultLabel }) => {
          const isActive = activeColor === name;
          const labelText = intl.formatMessage({ id: labelId, defaultMessage: defaultLabel, description: 'Theme color name' });
          return (
            <button
              key={name}
              onClick={() => setColor(name)}
              onMouseEnter={() => setHoveredColor(name)}
              onMouseLeave={() => setHoveredColor(null)}
              className={`
                flex items-center gap-2 px-3 py-1.5 rounded-full transition-all duration-200
                focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 dark:focus:ring-gray-500
                ${isActive ? 'bg-gray-900 text-white dark:bg-gray-100 dark:text-blog-black shadow-md' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}
              `}
              aria-label={labelText}
              aria-pressed={isActive}
              title={labelText}
            >
              <span
                className={`w-5 h-5 rounded-full border border-white/50 shadow-sm transition-transform duration-200 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}
                style={{ backgroundColor: hex }}
              />
              <span className="text-sm font-medium">{labelText}</span>
              {isActive && <FontAwesomeIcon icon={faCheck} className="w-4 h-4" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}
