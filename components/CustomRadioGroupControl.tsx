import React from 'react';
import { withJsonFormsControlProps } from '@jsonforms/react';
import { ControlProps, isEnumControl, rankWith } from '@jsonforms/core';
import { deliveryOptions } from '../lib/library';
import { FormattedMessage } from 'react-intl';

const CustomRadioGroupControl = ({ data, handleChange, path }: ControlProps) => {
  return (
    <div className="space-y-3">
      {deliveryOptions.map(option => (
        <label 
          key={option.id} 
          className={`flex items-center space-x-3 p-4 rounded-lg border-2 transition-all duration-200 cursor-pointer hover:bg-gray-50 dark:hover:bg-fun-blue-700 ${
            data?.id === option.id 
              ? 'border-fun-blue-500 dark:border-blog-white bg-blue-50 dark:bg-primary-blue/20' 
              : 'border-gray-200 dark:border-fun-blue-600 bg-white dark:bg-fun-blue-800'
          }`}
        >
          <input
            type="radio"
            name={path}
            value={option.id}
            checked={data?.id === option.id}
            onChange={() => handleChange(path, option)}
            className="w-4 h-4 text-primary-blue focus:ring-primary-blue focus:ring-2 dark:focus:ring-primary-blue dark:text-primary-blue"
          />
          <div className="flex-1">
            <div className="flex justify-between items-center">
              <span className="font-medium text-black dark:text-white">
                {option.name}
              </span>
              {option.deliveryPrice > 0 ? (
                <span className="text-sm font-semibold text-gray-600 dark:text-gray-300">
                  € {option.deliveryPrice.toFixed(2)}
                </span>
              ) : (
                <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                  FREE
                </span>
              )}
            </div>
            {option.description && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {option.description}
              </p>
            )}
          </div>
        </label>
      ))}
    </div>
  );
};

export default withJsonFormsControlProps(CustomRadioGroupControl);