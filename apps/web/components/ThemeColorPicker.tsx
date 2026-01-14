import React, { useState, useEffect } from 'react';
import { useThemeSettings } from '../lib/use-theme-settings';
import { FormattedMessage } from 'react-intl';

const colors = [
  { name: 'blue', labelId: 'theme-blue', color: '#00539c' },
  { name: 'green', labelId: 'theme-green', color: '#22c55e' },
  { name: 'purple', labelId: 'theme-purple', color: '#a855f7' },
  { name: 'orange', labelId: 'theme-orange', color: '#f97316' },
  { name: 'teal', labelId: 'theme-teal', color: '#14b8a6' },
];

export default function ThemeColorPicker() {
  const { color, setColor } = useThemeSettings();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex gap-2">
        {colors.map(({ name, color }) => (
          <button
            key={name}
            className={`w-6 h-6 rounded-full border-2 ${
              name === 'blue' ? 'border-gray-800' : 'border-gray-300'
            }`}
            style={{ backgroundColor: color }}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="flex gap-2">
      {colors.map(({ name, labelId, color }) => (
        <button
          key={name}
          onClick={() => setColor(name)}
          className={`w-6 h-6 rounded-full border-2 ${
            color === name ? 'border-gray-800' : 'border-gray-300'
          }`}
          style={{ backgroundColor: color }}
          aria-label={<FormattedMessage id={labelId} />}
        />
      ))}
    </div>
  );
}
