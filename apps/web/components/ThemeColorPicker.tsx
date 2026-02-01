import React, { useState, useEffect } from 'react';
import { useThemeSettings } from '../lib/use-theme-settings';
import { useIntl } from 'react-intl';

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
  const intl = useIntl();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex gap-2 p-1.5 bg-white/50 dark:bg-gray-800/50 rounded-full border border-gray-100 dark:border-gray-700">
        {themeColors.map((c) => (
          <div key={c.name} className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700" />
        ))}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 p-1.5 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md rounded-full border border-gray-100 dark:border-gray-800 shadow-lg transition-colors duration-300">
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
  );
}
